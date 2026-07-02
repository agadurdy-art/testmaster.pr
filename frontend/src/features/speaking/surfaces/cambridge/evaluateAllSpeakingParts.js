import { mintClientRequestId } from '../../../../lib/clientRequestId';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Evaluate the whole Speaking section per-question, ONE structured call per
// part (not per question), so each part counts as a single eval against the
// user's quota — same economy + pipeline as Question Bank / Smart Practice.
// Returns a flat { questionIndex: legacyEvalShape } map (the shape
// CambridgeTestResults already consumes) and never throws.
//
// Called from CambridgeTestInterface's handleSubmitSection (the page owns the
// submit flow); `blobs` is the page-level speakingBlobsRef.current map that
// CambridgeSpeakingSection fills as the candidate records.
export async function evaluateAllSpeakingParts({ parts, blobs, user, bookId, testId }) {
  if (!Array.isArray(parts) || parts.length === 0) return {};

  const partQuestions = (part) => {
    if (Array.isArray(part.questions) && part.questions.length) return part.questions;
    if (Array.isArray(part.sample_questions) && part.sample_questions.length) return part.sample_questions;
    if (Array.isArray(part.topics)) return part.topics.flatMap(t => t.questions || []);
    if (Array.isArray(part.discussion_topics)) return part.discussion_topics.flatMap(dt => dt.questions || []);
    return [];
  };
  const qText = (q) => (typeof q === 'string' ? q : (q?.question || q?.text || ''));

  // Build one structured request per part that has at least one recording.
  const partJobs = parts.map((part, pIndex) => {
    const isPart2 = part.part_number === 2;
    const items = [];
    if (isPart2) {
      const rec = blobs[`part${pIndex}_qpart2`];
      if (rec?.blob) {
        items.push({ question: part.cue_card?.topic || part.title || 'Part 2 long turn', rec });
      }
    } else {
      const questions = partQuestions(part);
      questions.forEach((q, qIdx) => {
        const rec = blobs[`part${pIndex}_q${qIdx}`];
        if (rec?.blob) items.push({ question: qText(q), rec });
      });
    }
    return { part, pIndex, items };
  }).filter(job => job.items.length > 0);

  if (partJobs.length === 0) return {};

  const runPart = async ({ part, items }) => {
    try {
      const form = new FormData();
      form.append('user_id', user?.id || '');
      form.append('part', `part${part.part_number || 1}`);
      form.append('topic', part.title || part.topic || '');
      form.append('user_language', user?.feedback_language || user?.preferred_language || 'en');
      form.append('target_band', String(user?.target_band ?? 7.0));
      form.append('client_request_id', mintClientRequestId());
      form.append('book_id', bookId);
      form.append('test_id', testId);
      items.forEach((it, i) => {
        const idx = i + 1;
        form.append(`question_q${idx}`, it.question || '');
        form.append(`audio_q${idx}`, it.rec.blob, `cambridge-p${part.part_number}-q${idx}.webm`);
        form.append(`duration_q${idx}`, String(it.rec.duration || 0));
      });
      const res = await fetch(`${API_URL}/api/speaking-practice/evaluate-structured`, {
        method: 'POST',
        body: form,
      });
      if (!res.ok) {
        console.error('Cambridge speaking eval failed for part', part.part_number, res.status);
        return null;
      }
      return { part, payload: await res.json() };
    } catch (err) {
      console.error('Cambridge speaking eval error (part ' + part.part_number + '):', err);
      return null;
    }
  };

  const settled = await Promise.all(partJobs.map(runPart));

  // Flatten structured per-part payloads into the legacy per-question map.
  // IELTS criteria are holistic per part, so every question in a part shares
  // that part's 4 criterion bands; the per-question band is the structured
  // `indicative_band`.
  const flat = {};
  let k = 0;
  settled.filter(Boolean).forEach(({ part, payload }) => {
    const crit = {
      fluency_coherence: payload?.criteria?.fc?.band ?? payload?.scores?.fc ?? 5,
      lexical_resource: payload?.criteria?.lr?.band ?? payload?.scores?.lr ?? 5,
      grammatical_range: payload?.criteria?.gra?.band ?? payload?.scores?.gra ?? 5,
      pronunciation: payload?.criteria?.pr?.band ?? payload?.scores?.pr ?? 5,
    };
    const strengths = [
      ...(payload?.criteria?.fc?.strengths || []),
      ...(payload?.criteria?.lr?.strengths || []),
    ].slice(0, 4);
    const weaknesses = [
      ...(payload?.criteria?.fc?.weaknesses || []),
      ...(payload?.criteria?.gra?.weaknesses || []),
    ].slice(0, 4);
    const questionsOut = Array.isArray(payload?.questions) ? payload.questions : [];
    questionsOut.forEach((q) => {
      const transcript = q?.transcript || '';
      flat[k] = {
        success: true,
        overall_band: q?.indicative_band ?? payload?.scores?.overall ?? 5,
        criteria: crit,
        question: q?.question || '',
        part: part.part_number,
        feedback: q?.observation || payload?.liz_note || '',
        strengths,
        weaknesses,
        tip: payload?.liz_note || '',
        transcript,
        word_count: transcript ? transcript.split(/\s+/).filter(Boolean).length : 0,
        audio_url: q?.audio_url || null,
        unified: payload,
      };
      k += 1;
    });
  });
  return flat;
}

export default evaluateAllSpeakingParts;
