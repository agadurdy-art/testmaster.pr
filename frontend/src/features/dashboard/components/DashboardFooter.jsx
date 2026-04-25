import React from "react";

export default function DashboardFooter() {
  return (
    <footer className="pt-10 rule flex flex-wrap gap-6 text-[13px] text-muted">
      <span>© {new Date().getFullYear()} testmaster.pro</span>
      <a href="/contact" className="hover:text-fg">Help</a>
      <a href="/privacy" className="hover:text-fg">Privacy</a>
      <a href="/terms" className="hover:text-fg">Terms</a>
    </footer>
  );
}
