import React, { useCallback, useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Inbox,
  Mail,
  RefreshCw,
  Users,
  XCircle,
} from "lucide-react";
import { authHeader } from "../lib/authToken";

const API_URL = process.env.REACT_APP_BACKEND_URL;
const REFRESH_INTERVAL_MS = 30_000;

/**
 * /admin/ops — single-page operational dashboard.
 *
 * One endpoint (/api/admin/ops/overview) fans out to six panels in
 * parallel. We auto-refresh every 30s so a tab left open stays current.
 * Auth is the existing email-allowlist gate (security_utils.DEFAULT_ADMIN_EMAILS);
 * non-admin users get a 403 which we render as a polite "not allowed"
 * screen instead of throwing.
 */
export default function AdminOpsPage() {
  const [adminEmail, setAdminEmail] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastFetchedAt, setLastFetchedAt] = useState(null);

  // Pull current user from localStorage. If they're not logged in we send
  // them to /login with a return path.
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      if (!u?.email) {
        window.location.href = "/login?next=/admin/ops";
        return;
      }
      setAdminEmail(u.email);
    } catch {
      window.location.href = "/login?next=/admin/ops";
    }
  }, []);

  const fetchOverview = useCallback(
    async (silent = false) => {
      if (!adminEmail) return;
      if (!silent) setLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/api/admin/ops/overview?admin_email=${encodeURIComponent(adminEmail)}`,
          { headers: { ...authHeader() } },
        );
        if (res.status === 403) {
          setError("not-admin");
          setData(null);
          return;
        }
        if (!res.ok) {
          let detail = `HTTP ${res.status}`;
          try {
            const body = await res.json();
            if (typeof body?.detail === "string") detail = body.detail;
          } catch {
            /* noop */
          }
          setError(detail);
          return;
        }
        const body = await res.json();
        setData(body);
        setError(null);
        setLastFetchedAt(new Date());
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[AdminOpsPage] fetch failed", err);
        setError("Network error — check your connection.");
      } finally {
        setLoading(false);
      }
    },
    [adminEmail],
  );

  useEffect(() => {
    fetchOverview();
    const id = setInterval(() => fetchOverview(true), REFRESH_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchOverview]);

  useEffect(() => {
    const prev = document.title;
    document.title = "Admin Ops · IELTS Ace";
    return () => {
      document.title = prev;
    };
  }, []);

  if (!adminEmail) return null;

  if (error === "not-admin") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
          <h1 className="mt-4 text-xl font-semibold text-slate-900">
            Admin access required
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            You're signed in as <b>{adminEmail}</b> but this dashboard is
            limited to allowlisted admin accounts.
          </p>
          <a
            href="/"
            className="mt-5 inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm"
          >
            Back to site
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Top bar */}
      <div className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-3 flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold tracking-wider uppercase text-emerald-700">
            <Activity className="w-3.5 h-3.5" />
            Admin Ops
          </span>
          <span className="text-xs text-slate-500 hidden sm:inline">
            · {adminEmail}
          </span>
          <span className="ml-auto text-xs text-slate-500">
            {lastFetchedAt
              ? `Updated ${lastFetchedAt.toLocaleTimeString()}`
              : loading
              ? "Loading…"
              : "—"}
          </span>
          <button
            type="button"
            onClick={() => fetchOverview()}
            className="ml-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && error !== "not-admin" && (
        <div className="mx-auto max-w-7xl px-5 sm:px-8 mt-6">
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        </div>
      )}

      {!data && loading && (
        <div className="mx-auto max-w-7xl px-5 sm:px-8 mt-10 text-center text-slate-500">
          <RefreshCw className="w-6 h-6 text-emerald-600 mx-auto animate-spin" />
          <p className="mt-3 text-sm">Loading dashboard…</p>
        </div>
      )}

      {data && (
        <div className="mx-auto max-w-7xl px-5 sm:px-8 py-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ServicesPanel services={data.services} />
          <UsersPanel users={data.users} />
          <AnonEvalPanel evals={data.anon_evals} />
          <ResendPanel resend={data.resend} />
          <CostPanel cost={data.cost} />
          <RevenuePanel revenue={data.revenue} />
        </div>
      )}
    </div>
  );
}

// ----- Shared bits ------------------------------------------------------

function PanelShell({ title, icon: Icon, accent = "emerald", children, footer }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <header className="px-5 py-3 border-b border-slate-100 flex items-center gap-2">
        <Icon className={`w-4 h-4 text-${accent}-600`} />
        <h2 className="text-[13px] font-semibold tracking-wide uppercase text-slate-700">
          {title}
        </h2>
      </header>
      <div className="px-5 py-4">{children}</div>
      {footer && (
        <footer className="px-5 py-2 border-t border-slate-100 text-[11px] text-slate-500">
          {footer}
        </footer>
      )}
    </section>
  );
}

function StatusDot({ ok }) {
  if (ok === true) return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
  if (ok === false) return <XCircle className="w-3.5 h-3.5 text-red-500" />;
  return <span className="inline-block w-3.5 h-3.5 rounded-full bg-slate-300" />;
}

function Pill({ tone = "slate", children }) {
  const toneCls = {
    slate: "bg-slate-100 text-slate-700",
    amber: "bg-amber-100 text-amber-800",
    red: "bg-red-100 text-red-800",
    emerald: "bg-emerald-100 text-emerald-800",
  }[tone];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${toneCls}`}>
      {children}
    </span>
  );
}

function fmtTime(iso) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return String(iso);
  }
}

// ----- Panels -----------------------------------------------------------

function ServicesPanel({ services }) {
  if (!services) return null;
  const rows = [
    ["MongoDB", services.mongo],
    ["Resend (email)", services.resend],
    ["Anthropic", services.anthropic],
    ["OpenAI", services.openai],
    ["Azure Speech", services.azure_speech],
    ["ElevenLabs", services.elevenlabs],
    ["PayPal", services.paypal],
    ["SePay (prod)", services.sepay],
    ["R2 (storage)", services.r2],
    ["FRONTEND_BASE_URL", services.frontend_base_url],
  ];
  return (
    <PanelShell title="Service health" icon={Activity}>
      <ul className="space-y-1.5 text-sm">
        {rows.map(([label, info]) => (
          <li key={label} className="flex items-center gap-2">
            <StatusDot ok={info?.ok} />
            <span className="text-slate-800">{label}</span>
            {info?.note && (
              <span className="ml-auto text-[11px] text-slate-500 truncate max-w-[55%]">
                {info.note}
              </span>
            )}
            {info?.value && (
              <span className="ml-auto text-[11px] text-slate-500 truncate max-w-[55%]">
                {info.value}
              </span>
            )}
          </li>
        ))}
      </ul>
    </PanelShell>
  );
}

function UsersPanel({ users }) {
  if (!users) return null;
  return (
    <PanelShell title="Users" icon={Users}>
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Stat label="Total" value={users.total} />
        <Stat label="New 24h" value={users.signups_24h} />
        <Stat label="New 7d" value={users.signups_7d} />
        <Stat label="Verified" value={users.verified} />
        <Stat label="Active 7d" value={users.active_7d} />
        <Stat
          label="Verify rate"
          value={
            users.total
              ? `${Math.round((users.verified / users.total) * 100)}%`
              : "—"
          }
        />
      </div>
      <div className="mt-2">
        <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-500 mb-2">
          Plan breakdown
        </div>
        <ul className="space-y-1 text-sm">
          {(users.plan_breakdown || []).map((p) => (
            <li key={p.plan} className="flex items-center justify-between">
              <span className="text-slate-700">{p.plan}</span>
              <span className="text-slate-900 font-medium">{p.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </PanelShell>
  );
}

function AnonEvalPanel({ evals }) {
  if (!evals) return null;
  return (
    <PanelShell title="Anon eval queue · /score-my-essay" icon={Inbox}>
      <div className="grid grid-cols-4 gap-3 mb-3">
        <Stat label="Pending" value={evals.pending} tone={evals.pending > 0 ? "amber" : "slate"} />
        <Stat label="Done 24h" value={evals.complete_24h} />
        <Stat label="Failed 24h" value={evals.failed_24h} tone={evals.failed_24h > 0 ? "red" : "slate"} />
        <Stat label="Done 7d" value={evals.complete_7d} />
      </div>
      {/* Marketing roll-up — opted vs synced to Resend audience. Gap is
          either RESEND_AUDIENCE_ID unset or sync failures. */}
      <div className="mb-4 px-3 py-2 rounded-lg bg-slate-50 flex items-center gap-4 text-[12px]">
        <span className="font-semibold tracking-wider uppercase text-slate-500 text-[10px]">
          Marketing
        </span>
        <span className="text-slate-700">
          <b className="text-slate-900">{evals.marketing_opted_total ?? 0}</b>{" "}
          opted-in
        </span>
        <span className="text-slate-700">
          <b className="text-slate-900">{evals.marketing_synced_total ?? 0}</b>{" "}
          synced to Resend
        </span>
        {(evals.marketing_opted_total ?? 0) > (evals.marketing_synced_total ?? 0) && (
          <Pill tone="amber">
            {(evals.marketing_opted_total ?? 0) - (evals.marketing_synced_total ?? 0)}{" "}
            unsynced — check RESEND_AUDIENCE_ID
          </Pill>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead className="text-slate-500">
            <tr className="text-left">
              <th className="font-normal py-1.5">When</th>
              <th className="font-normal">Email</th>
              <th className="font-normal">Status</th>
              <th className="font-normal">Band</th>
              <th className="font-normal">Sent</th>
              <th className="font-normal" title="Marketing opt-in + Resend audience sync">Opt-in</th>
              <th className="font-normal"></th>
            </tr>
          </thead>
          <tbody>
            {(evals.recent || []).slice(0, 12).map((r, i) => (
              <tr key={i} className="border-t border-slate-100">
                <td className="py-1.5 text-slate-600 whitespace-nowrap">{fmtTime(r.created_at)}</td>
                <td className="text-slate-800">{r.email_masked}</td>
                <td>
                  {r.status === "complete" && <Pill tone="emerald">complete</Pill>}
                  {r.status === "pending" && <Pill tone="amber">pending</Pill>}
                  {r.status === "failed" && <Pill tone="red">failed</Pill>}
                </td>
                <td className="text-slate-900 font-medium">{r.band ?? "—"}</td>
                <td>
                  {r.email_ok === true && <StatusDot ok={true} />}
                  {r.email_ok === false && <StatusDot ok={false} />}
                  {r.email_ok === undefined && <span className="text-slate-400">—</span>}
                </td>
                <td>
                  <OptInBadge row={r} />
                </td>
                <td className="text-right">
                  {r.token && (
                    <a
                      href={`/r/${r.token}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 hover:underline"
                    >
                      open
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PanelShell>
  );
}

// Marketing opt-in badge for each row:
//   ✓ green  = opted in + successfully synced to Resend audience
//   ✓ amber  = opted in but audience sync skipped (RESEND_AUDIENCE_ID unset)
//   ✕ red    = opted in but audience sync failed (invalid id, API error, etc.)
//   —       = did not opt in (most users; not a problem)
function OptInBadge({ row }) {
  if (!row.marketing_consent) {
    return <span className="text-slate-300" title="No marketing opt-in">—</span>;
  }
  if (row.audience_ok === true) {
    return (
      <span title="Opted in + synced to Resend audience">
        <Pill tone="emerald">opt-in ✓</Pill>
      </span>
    );
  }
  if (row.audience_skipped) {
    return (
      <span title={row.audience_error || "Audience sync skipped"}>
        <Pill tone="amber">opt-in · unsynced</Pill>
      </span>
    );
  }
  if (row.audience_ok === false) {
    return (
      <span title={row.audience_error || "Audience sync failed"}>
        <Pill tone="red">opt-in · sync fail</Pill>
      </span>
    );
  }
  // marketing_consent=true but no audience attempt recorded yet (eval may
  // still be running, or the background task crashed before audience step).
  return (
    <span title="Opt-in recorded, audience sync pending">
      <Pill tone="amber">opt-in · pending</Pill>
    </span>
  );
}

function ResendPanel({ resend }) {
  if (!resend) return null;
  return (
    <PanelShell title="Resend email delivery (24h)" icon={Mail}>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Stat label="Sent 24h" value={resend.sent_24h} />
        <Stat
          label="Failed 24h"
          value={resend.failed_24h}
          tone={resend.failed_24h > 0 ? "red" : "slate"}
        />
      </div>
      <ul className="space-y-2 text-[12px]">
        {(resend.recent || []).slice(0, 8).map((r, i) => (
          <li key={i} className="flex items-start gap-2 border-t border-slate-100 pt-2">
            <StatusDot ok={r.ok} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-800">{r.to_masked}</span>
                <span className="text-slate-500 text-[11px]">{fmtTime(r.sent_at)}</span>
              </div>
              {r.error && (
                <div className="text-red-700 text-[11px] mt-0.5 break-words">
                  {r.error}
                </div>
              )}
              {r.email_id && (
                <div className="text-slate-400 text-[10px] mt-0.5">
                  id: {r.email_id}
                </div>
              )}
            </div>
          </li>
        ))}
        {(resend.recent || []).length === 0 && (
          <li className="text-slate-500 text-[12px]">No deliveries yet.</li>
        )}
      </ul>
    </PanelShell>
  );
}

function CostPanel({ cost }) {
  if (!cost) return null;
  if (!cost.available) {
    return (
      <PanelShell title="LLM cost (7d / 30d)" icon={DollarSign}>
        <p className="text-sm text-slate-500">
          {cost.error || "Telemetry not initialized yet."}
        </p>
      </PanelShell>
    );
  }
  return (
    <PanelShell title="LLM cost (7d / 30d)" icon={DollarSign}>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Stat label="Week" value={`$${(cost.week?.total_usd || 0).toFixed(2)}`} />
        <Stat label="Month" value={`$${(cost.month?.total_usd || 0).toFixed(2)}`} />
      </div>
      <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-500 mb-2">
        Top scopes (week)
      </div>
      <ul className="space-y-1 text-sm mb-3">
        {(cost.week?.by_scope || []).slice(0, 5).map((s, i) => (
          <li key={i} className="flex items-center justify-between">
            <span className="text-slate-700 truncate max-w-[60%]">{s.scope || "(unknown)"}</span>
            <span className="text-slate-900 font-medium">
              ${(s.cost_usd || 0).toFixed(3)}{" "}
              <span className="text-slate-400 text-[11px]">· {s.calls}</span>
            </span>
          </li>
        ))}
      </ul>
      <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-500 mb-2">
        Top models (week)
      </div>
      <ul className="space-y-1 text-sm">
        {(cost.week?.by_model || []).slice(0, 5).map((m, i) => (
          <li key={i} className="flex items-center justify-between">
            <span className="text-slate-700 truncate max-w-[60%]">{m._id || (m.model || "(unknown)")}</span>
            <span className="text-slate-900 font-medium">
              ${(m.cost_usd || 0).toFixed(3)}{" "}
              <span className="text-slate-400 text-[11px]">· {m.calls}</span>
            </span>
          </li>
        ))}
      </ul>
    </PanelShell>
  );
}

function RevenuePanel({ revenue }) {
  if (!revenue) return null;
  return (
    <PanelShell title="Revenue" icon={Clock}>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-500 mb-2">
            PayPal
          </div>
          <Stat label="Week" value={revenue.paypal?.week_count ?? 0} compact />
          <Stat label="Month" value={revenue.paypal?.month_count ?? 0} compact />
          <Stat
            label="Month $"
            value={`$${(revenue.paypal?.month_usd || 0).toFixed(2)}`}
            compact
          />
          {revenue.paypal?.error && (
            <div className="text-red-600 text-[11px] mt-1">{revenue.paypal.error}</div>
          )}
        </div>
        <div>
          <div className="text-[11px] font-semibold tracking-wider uppercase text-slate-500 mb-2">
            SePay
          </div>
          <Stat label="Week" value={revenue.sepay?.week_count ?? 0} compact />
          <Stat label="Month" value={revenue.sepay?.month_count ?? 0} compact />
          <Stat
            label="Month ₫"
            value={(revenue.sepay?.month_vnd || 0).toLocaleString()}
            compact
          />
          {revenue.sepay?.error && (
            <div className="text-red-600 text-[11px] mt-1">{revenue.sepay.error}</div>
          )}
        </div>
      </div>
    </PanelShell>
  );
}

function Stat({ label, value, tone = "slate", compact = false }) {
  const valTone = {
    slate: "text-slate-900",
    amber: "text-amber-700",
    red: "text-red-700",
    emerald: "text-emerald-700",
  }[tone];
  return (
    <div className={compact ? "py-1" : ""}>
      <div className="text-[10px] font-semibold tracking-wider uppercase text-slate-500">
        {label}
      </div>
      <div className={`text-${compact ? "base" : "lg"} font-semibold ${valTone}`}>
        {value ?? "—"}
      </div>
    </div>
  );
}
