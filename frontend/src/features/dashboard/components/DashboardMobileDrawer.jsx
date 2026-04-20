import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Slide-in mobile drawer opened from the hamburger in DashboardTopBar.
 * Mirrors the desktop nav links + profile/settings/logout actions so mobile
 * users can reach any top-level destination without a working side nav.
 *
 * Rendered by DashboardLayout; visibility controlled by the `open` prop.
 */
export default function DashboardMobileDrawer({
  open,
  onClose,
  user,
  onLogout,
}) {
  const navigate = useNavigate();

  // Lock background scroll while the drawer is open.
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return undefined;
    const handler = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const go = (path) => {
    onClose?.();
    navigate(path);
  };

  const LINKS = [
    { label: "Dashboard", path: "/dashboard" },
    { label: "Practice", path: "/question-bank" },
    { label: "Courses", path: "/courses" },
    { label: "Liz", path: "/liz" },
    { label: "Progress", path: "/progress" },
    { label: "Pricing", path: "/pricing" },
    { label: "Profile", path: "/profile" },
    { label: "Settings", path: "/settings" },
  ];

  return (
    <div
      className={`fixed inset-0 z-50 md:hidden ${open ? "" : "pointer-events-none"}`}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className="absolute inset-0 transition-opacity"
        style={{
          background: "rgba(10,12,16,.42)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          opacity: open ? 1 : 0,
        }}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className="absolute top-0 right-0 h-full w-[82%] max-w-[340px] shadow-xl flex flex-col"
        style={{
          background: "hsl(var(--surface))",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 220ms cubic-bezier(.2,.8,.2,1)",
        }}
      >
        <div className="flex items-center justify-between px-5 h-[68px] border-b hairline">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-medium"
              style={{
                background: "hsl(var(--sky) / 0.15)",
                color: "hsl(var(--sky))",
                border: "1px solid hsl(var(--sky) / .3)",
              }}
            >
              {user?.initials || (user?.email ? user.email[0]?.toUpperCase() : "AG")}
            </div>
            <div className="leading-tight">
              <div className="text-sm font-medium">{user?.firstName || user?.name || "Aga"}</div>
              <div className="text-[11px] text-muted truncate max-w-[180px]">{user?.email}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="p-2 rounded-lg hover:bg-black/5"
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {LINKS.map((l) => (
            <button
              key={l.path}
              type="button"
              onClick={() => go(l.path)}
              className="w-full text-left px-5 py-3.5 text-[15px] hover:bg-black/5"
            >
              {l.label}
            </button>
          ))}
        </nav>
        {onLogout && (
          <div className="border-t hairline p-4">
            <button
              type="button"
              onClick={() => {
                onClose?.();
                onLogout();
              }}
              className="w-full py-2.5 rounded-lg text-[14px] font-medium"
              style={{
                background: "hsl(var(--danger) / .08)",
                color: "hsl(var(--danger))",
              }}
            >
              Log out
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
