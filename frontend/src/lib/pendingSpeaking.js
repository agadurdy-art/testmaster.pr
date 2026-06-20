// Crash-safe store for an in-flight speaking submission.
//
// Why this exists: a speaking part's answers live only in browser memory
// (audioBlobsRef) until the single /evaluate request returns. That request can
// take 30–90s (transcription + Sonnet), and if the user closes the tab or
// navigates away mid-grade the recordings are gone — the test is lost, exactly
// as the old overlay warned. FastAPI also cancels the request handler on client
// disconnect, so we can't rely on the server finishing after a leave either.
//
// Fix: the moment the user submits, we persist EVERYTHING needed to re-run the
// submission (audio blobs + question metadata + the stable client_request_id)
// to IndexedDB. If they come back, the page offers to resume. Because the
// backend de-dupes on client_request_id for 10 minutes and returns the cached
// result *before* charging quota, a resume within that window is free; after it
// the user is asked to consent to a fresh evaluation. Either way the ANSWERS
// are never lost.
//
// IndexedDB (not localStorage) because we store Blobs and they can be MBs.
// Everything is best-effort and never throws into the caller.

const DB_NAME = 'tm_speaking';
const STORE = 'pending';
const KEY = 'current'; // single in-flight submission at a time

function openDb() {
  return new Promise((resolve, reject) => {
    try {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE)) db.createObjectStore(STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    } catch (e) {
      reject(e);
    }
  });
}

// record: {
//   clientRequestId, tier, part (number), setId, topic,
//   cueCard: { prompt, bullets } | null,
//   answers: [{ question_id, part, question, duration }],
//   blobs: { [question_id]: Blob },
//   createdAt: epoch ms (passed in by caller — Date.now() is unavailable in
//              some sandboxes, so the caller stamps it),
// }
export async function savePendingSpeaking(record) {
  try {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(record, KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
    return true;
  } catch (_) {
    return false; // private mode / quota / unsupported — degrade silently
  }
}

// Attach the server-side job id to the saved record once the async submit has
// enqueued it. A return visit can then reconnect to the SAME grade (poll the
// job) instead of re-uploading the audio.
export async function attachJobToPending(jobId) {
  try {
    const rec = await getPendingSpeaking();
    if (!rec) return false;
    rec.jobId = jobId;
    return await savePendingSpeaking(rec);
  } catch (_) {
    return false;
  }
}

export async function getPendingSpeaking() {
  try {
    const db = await openDb();
    const rec = await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const r = tx.objectStore(STORE).get(KEY);
      r.onsuccess = () => resolve(r.result || null);
      r.onerror = () => reject(r.error);
    });
    db.close();
    return rec;
  } catch (_) {
    return null;
  }
}

export async function clearPendingSpeaking() {
  try {
    const db = await openDb();
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
    return true;
  } catch (_) {
    return false;
  }
}

// Free-resume window mirrors the backend idempotency TTL (10 min). Within it a
// resume returns the cached result with no extra quota charge; past it the user
// is told a resume costs one evaluation.
export const FREE_RESUME_MS = 10 * 60 * 1000;
