import React from 'react';
import { readAuthUser } from '../../../lib/authNav';
import { isAdminUser } from '../../../lib/planAccess';

export default function LandingFooter() {
  // Status page is admin-only — Aga 2026-05-23: "Status button var, onu
  // sadece admin gorsun baska kimse gormesin". Non-admin visitors have no
  // need for the infra status board and a public link to it just creates
  // noise + leaks the route.
  const showStatus = isAdminUser(readAuthUser());
  return (
    <footer>
      <div className="container">
        <div className="foot">
          <a href="/" className="logo">
            testmaster<span className="pro">.pro</span>
          </a>
          <ul className="foot-links">
            <li><a href="/share-your-story">Share your story</a></li>
            <li><a href="/privacy">Privacy</a></li>
            <li><a href="/terms">Terms</a></li>
            <li><a href="/contact">Contact</a></li>
            {showStatus && <li><a href="/status">Status</a></li>}
          </ul>
        </div>
        <div className="foot-copy">
          © 2026 testmaster.pro · Made by a teacher, powered by students.
        </div>
      </div>
    </footer>
  );
}
