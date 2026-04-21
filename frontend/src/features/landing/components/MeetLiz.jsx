import React from 'react';
import LizAvatar from './LizAvatar';
import ArrowRightIcon from './ArrowRightIcon';

/**
 * MeetLiz — "who is Liz" section. Three-role card deck explains what she does
 * for a candidate, anchored by a pulsing portrait orb.
 *
 * The primary CTA routes anonymous visitors to /signup?intent=liz so the
 * full-screen Liz view shows up right after they authenticate.
 */

const ROLES = [
  {
    title: 'Evaluator',
    body: 'Submit writing or speaking and get a band estimate with margin notes — in your language.',
  },
  {
    title: 'Speaking partner',
    body: 'Part 1, 2, and 3 drills with real pronunciation feedback and follow-up questions.',
  },
  {
    title: 'Study companion',
    body: 'Structured courses with short lessons, practice, and progress tracking tailored to you.',
  },
];

export default function MeetLiz() {
  return (
    <section id="liz" className="meet-liz">
      <div className="container meet-liz-inner">
        <div className="meet-liz-orb" aria-hidden="true">
          <span className="meet-liz-ring meet-liz-ring-1" />
          <span className="meet-liz-ring meet-liz-ring-2" />
          <span className="meet-liz-ring meet-liz-ring-3" />
          <LizAvatar size={128} alt="" />
        </div>

        <div className="meet-liz-copy">
          <div className="eyebrow">
            <span className="dot" aria-hidden="true" />
            Meet Liz
          </div>
          <h2 className="section-title">Your AI IELTS coach, everywhere.</h2>
          <p className="section-sub">
            Liz evaluates, teaches, and practices with you. One voice across writing, speaking,
            and your daily study plan.
          </p>

          <div className="meet-liz-roles">
            {ROLES.map((r) => (
              <div key={r.title} className="meet-liz-role">
                <div className="meet-liz-role-title">{r.title}</div>
                <div className="meet-liz-role-body">{r.body}</div>
              </div>
            ))}
          </div>

          <div className="cta-row">
            <a href="/signup?intent=liz" className="btn btn-primary btn-xl">
              Start with Liz
              <ArrowRightIcon size={16} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
