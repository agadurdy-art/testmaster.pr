import React from 'react';

export default function Transcript({ tokens }) {
  return (
    <p
      style={{
        fontSize: 18,
        lineHeight: 1.75,
        color: 'hsl(222 47% 11% / 0.9)',
        whiteSpace: 'pre-wrap',
      }}
    >
      {tokens.map((tok, i) => {
        if (tok.pron) {
          return (
            <span
              key={i}
              className={`sp-pron sp-pron-${tok.pron}`}
              title={tok.note || tok.ipa}
            >
              {tok.t}
            </span>
          );
        }
        return <React.Fragment key={i}>{tok.t}</React.Fragment>;
      })}
    </p>
  );
}

// Split the flat user-only transcript tokens (in order) across the candidate's
// conversation turns, so each answer can be rendered with its own word-level
// pronunciation colouring. Greedy: consume tokens for a turn until their
// concatenated text covers the turn's text (compared on letters/digits only,
// so spacing/punctuation differences don't break alignment).
export function splitTokensByTurns(tokens, userMessages) {
  const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  const slices = [];
  let ti = 0;
  for (let m = 0; m < userMessages.length; m++) {
    const targetLen = norm(userMessages[m]).length;
    const slice = [];
    let accLen = 0;
    const isLast = m === userMessages.length - 1;
    while (ti < tokens.length && (accLen < targetLen || isLast)) {
      slice.push(tokens[ti]);
      accLen += norm(tokens[ti].t).length;
      ti += 1;
      if (!isLast && accLen >= targetLen) break;
    }
    slices.push(slice);
  }
  return slices;
}

// Render a token slice with the same pronunciation colouring as <Transcript>.
export function ColoredTokens({ tokens }) {
  return (
    <>
      {tokens.map((tok, i) =>
        tok.pron ? (
          <span key={i} className={`sp-pron sp-pron-${tok.pron}`} title={tok.note || tok.ipa}>{tok.t}</span>
        ) : (
          <React.Fragment key={i}>{tok.t}</React.Fragment>
        ),
      )}
    </>
  );
}
