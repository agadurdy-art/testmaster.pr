import React from 'react';

/**
 * TrustBlock — surfaces the human + methodology behind the AI:
 *   • Who built it (an English teacher actively preparing for IELTS)
 *   • How scoring works (calibrated to IELTS examiner standards)
 *   • Honest disclaimer (AI estimate, not an official band score)
 *
 * Placed between LandingHeroDemo and MeetLiz so it answers
 * "can I trust these scores?" right after the hero pitch.
 *
 * Founder profile note (memory/feedback_aga_profile_no_name 2026-05-21):
 * the builder is an English teacher with 10+ years experience who is
 * preparing for the IELTS exam — NOT an IELTS instructor. Copy here
 * must not put the founder's first name on a public page.
 */
export default function TrustBlock() {
  return (
    <section id="trust" className="trust-block">
      <div className="container trust-block-inner">
        <div className="eyebrow">
          <span className="dot" aria-hidden="true" />
          Built by an English teacher preparing for IELTS
        </div>
        <h2 className="section-title">Why the band scores you see here are honest.</h2>
        <p className="section-sub">
          Most AI graders inflate scores so the product feels nice. We do the opposite — Liz is
          calibrated against real IELTS examiner standards so the band you see here matches what
          you'd get on test day.
        </p>

        <div className="trust-block-cards">
          <div className="trust-card">
            <div className="trust-card-title">Who built this</div>
            <div className="trust-card-body">
              An <strong>English teacher with 10+ years experience</strong> who's actively
              preparing for IELTS — so the rubrics were hand-tuned from both sides of the desk,
              against past student essays and Cambridge anchor papers.
            </div>
          </div>

          <div className="trust-card">
            <div className="trust-card-title">How scoring works</div>
            <div className="trust-card-body">
              Liz scores Writing on Task Response, Coherence, Lexical Resource, and Grammar — the
              same four criteria a real examiner uses. Speaking adds Pronunciation. Every
              evaluation includes the exact lines that cost band points and a rewrite.
            </div>
          </div>

          <div className="trust-card">
            <div className="trust-card-title">What this isn't</div>
            <div className="trust-card-body">
              Liz gives an <em>AI band estimate</em> — typically within ±0.5 of an examiner's
              score. It is not an official IELTS result. Use it to train, find your weak spots,
              and walk into test day knowing exactly where you stand.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
