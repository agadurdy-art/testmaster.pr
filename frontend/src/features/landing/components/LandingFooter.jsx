import React from 'react';

export default function LandingFooter() {
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
            <li><a href="/status">Status</a></li>
          </ul>
        </div>
        <div className="foot-copy">
          © 2026 testmaster.pro · Made by a teacher, powered by students.
        </div>
      </div>
    </footer>
  );
}
