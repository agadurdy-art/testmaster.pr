import React from "react";

export default function DashboardFooter() {
  return (
    <footer className="pt-10 rule flex flex-wrap gap-6 text-[13px] text-muted">
      <span>© {new Date().getFullYear()} testmaster.pro</span>
      <a href="/help" className="hover:text-fg">Help</a>
      <a href="/shortcuts" className="hover:text-fg">Keyboard shortcuts</a>
      <a href="/privacy" className="hover:text-fg">Privacy</a>
    </footer>
  );
}
