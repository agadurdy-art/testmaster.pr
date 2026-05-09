// Speaking helper static content — pre-written pedagogical blurbs surfaced
// inside the floating Liz coaching panel during speaking practice.
//
// Two button kinds are static (zero LLM cost, served from this module):
//   - structure: Band 7+ answer scaffold for this Part (1 / 2 / 3)
//   - pitfall:   Common pitfalls examiners penalise on this Part
//
// Dynamic buttons (Unpack / Ideas / Phrases / Opener) hit a Haiku-backed
// endpoint (/api/speaking/helper). Splitting static + dynamic keeps the
// panel useful even when the network is flaky.
//
// Taxonomy keys: `part${n}` (n = 1, 2, 3)

export const HELPER_CONTENT = {
  part1: {
    structure: {
      title: 'Band 7+ structure — Part 1',
      sections: [
        {
          heading: 'Direct answer (1 sentence)',
          body: 'Lead with a clear "yes / no / sometimes" position. Examiners are testing fluency, not philosophy — do not stall with "that\'s a good question".',
        },
        {
          heading: 'Extension (1–2 sentences)',
          body: 'Reason → specific example. e.g. "I cycle to work most days, mainly because the traffic in Hanoi is unbearable in the mornings."',
        },
        {
          heading: 'Length',
          body: 'Aim 25–35 seconds per answer (3–4 sentences). One-word answers signal Band 5; novelistic monologues lose Coherence marks.',
        },
        {
          heading: 'Variety',
          body: 'Across the ~12 Part 1 questions, vary your openers ("Honestly,", "I\'d say", "It depends, but…"). Repeating the same hedge ceilings you at 6.0.',
        },
      ],
    },
    pitfall: {
      title: 'Common pitfalls — Part 1',
      items: [
        'Memorised answers — examiners are trained to spot them and will down-mark Lexical Resource if they sense recital.',
        'Single-word or two-word replies. Always extend with a reason or example, even if you don\'t have a strong opinion.',
        'Mirroring the question word-for-word ("Do I like reading? Yes, I like reading."). Paraphrase or skip.',
        'Discourse markers gone wild — "well, you know, basically, actually" stacked together sound rehearsed.',
        'Going off-topic into Part-2-length stories. Part 1 rewards crisp, grounded answers, not narratives.',
      ],
    },
  },

  part2: {
    structure: {
      title: 'Band 7+ structure — Part 2 long turn',
      sections: [
        {
          heading: 'Use the prep minute',
          body: 'Jot 4 keywords — one per cue card bullet. Forget full sentences, you will not have time to read them anyway.',
        },
        {
          heading: 'Opener (5–10 seconds)',
          body: '"I\'d like to talk about…" or "The X I\'ve chosen is…". Buy a beat to gather your thoughts; do not start cold.',
        },
        {
          heading: 'Body — bullet by bullet (~90 seconds)',
          body: 'Cover each bullet in order, but do not number them aloud. Add one sensory detail (sound / smell / colour) somewhere — examiners reward this.',
        },
        {
          heading: 'The "why it matters" (~20 seconds)',
          body: 'The final cue ("…and explain why…") is where most candidates rush. Slow down. This is where Lexical Resource is judged most.',
        },
        {
          heading: 'Wrap-up sentence',
          body: 'A short closer — "…so that\'s why this experience really stuck with me." — signals confidence and lets the examiner cut you cleanly at 2 minutes.',
        },
      ],
    },
    pitfall: {
      title: 'Common pitfalls — Part 2',
      items: [
        'Listing without storytelling — "I went there. It was nice. We ate food." Each sentence needs colour or causation.',
        'Going under 1:30 because you ran out of ideas. Better to slow your pace and add a side-detail than to stop early.',
        'Reading from prep notes word for word. The examiner can hear it. Glance, then talk.',
        'Topic drift — drifting into a different memory halfway through. Anchor every sentence back to the cue card noun.',
        'Burning Part 2 vocab in the first 30 seconds. Spread your strong collocations across the whole turn.',
      ],
    },
  },

  part3: {
    structure: {
      title: 'Band 7+ structure — Part 3 discussion',
      sections: [
        {
          heading: 'Frame (1 sentence)',
          body: 'Reframe the question to show you understood it. "I think the real question here is whether…" — this earns Coherence marks instantly.',
        },
        {
          heading: 'Position + reason',
          body: 'State your view directly, then back it with one cause-effect chain. "I\'d argue that …, mainly because …, which in turn means …"',
        },
        {
          heading: 'Concrete example',
          body: 'Always one specific example — country / industry / personal. Vague examples ("in many countries") are a Band 6 marker.',
        },
        {
          heading: 'Counter-balance',
          body: 'Acknowledge the opposing view in one sentence. "That said, you could argue…" then dismiss or qualify it. Shows nuance.',
        },
        {
          heading: 'Close',
          body: 'One forward-looking or evaluative sentence. Total ~45–60 seconds per Part 3 question. Going to 90+ seconds confuses the examiner pacing.',
        },
      ],
    },
    pitfall: {
      title: 'Common pitfalls — Part 3',
      items: [
        'Treating Part 3 like Part 1 — short personal answers. Part 3 wants abstraction and argument.',
        'Repeating Part 2 stories. Part 3 is societal / general; do not retell your last anecdote.',
        'No examples at all. "I think governments should do more" without a case study floors you at 6.0.',
        'Memorised connectors stacked unnaturally — "moreover, furthermore, in addition" three times in a row.',
        'Avoiding the question because it is hard. Examiners would rather hear an honest "I haven\'t thought much about this, but…" than a non-answer.',
      ],
    },
  },
};

// Default fallback when part is missing or malformed.
const FALLBACK = HELPER_CONTENT.part1;

/**
 * Resolve helper content for a given speaking Part.
 *
 * @param {string|number} part  1, 2, 3, '1', '2', '3', 'part1', etc.
 * @returns {{ structure: object, pitfall: object }}
 */
export function getHelperContent(part) {
  if (part == null) return FALLBACK;
  const normalized = String(part).replace(/^part/i, '').trim();
  return HELPER_CONTENT[`part${normalized}`] || FALLBACK;
}
