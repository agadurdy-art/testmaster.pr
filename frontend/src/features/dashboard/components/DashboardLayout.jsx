import React, { useState } from "react";
import "../dashboard.css";
import DashboardTopBar from "./DashboardTopBar";
import DashboardBottomNav from "./DashboardBottomNav";
import DashboardMobileDrawer from "./DashboardMobileDrawer";
import ThemeSwitch from "./ThemeSwitch";
import useDashboardTheme from "../hooks/useDashboardTheme";

/**
 * DashboardLayout wraps every authenticated dashboard view.
 * Applies the scoped stylesheet, theme class, sticky top bar, and fixed
 * mobile bottom nav. Children render inside the <main> content container.
 */
export default function DashboardLayout({
  children,
  activeSection = "dashboard",
  activeMobileTab = "home",
  user,
  onMobileTab,
  onLogout,
}) {
  const [theme, setTheme] = useDashboardTheme("light");
  const [menuOpen, setMenuOpen] = useState(false);
  const themeClass =
    theme === "dark" ? "theme-dark" : theme === "night" ? "theme-night" : "";

  return (
    <div className={`dashboard-scope ${themeClass}`}>
      <DashboardTopBar
        activeSection={activeSection}
        user={user}
        onOpenMenu={() => setMenuOpen(true)}
      />
      <main className="max-w-[1160px] mx-auto px-6 md:px-10 pt-14 md:pt-20 pb-20 body-pad-bottom">
        {children}
      </main>
      <DashboardBottomNav active={activeMobileTab} onNavigate={onMobileTab} />
      <DashboardMobileDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        user={user}
        onLogout={onLogout}
      />
      <ThemeSwitch theme={theme} onChange={setTheme} />
    </div>
  );
}
