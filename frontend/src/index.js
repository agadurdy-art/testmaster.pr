import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";
import { I18nProvider } from "./lib/i18n";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { Analytics } from "@vercel/analytics/react";

const paypalClientId = process.env.REACT_APP_PAYPAL_CLIENT_ID;

function RootProviders({ children }) {
  if (!paypalClientId) {
    return <I18nProvider>{children}</I18nProvider>;
  }

  // Mixed-mode SDK: the pricing surface mixes one-time orders (Exam pack +
  // Custom slider via createOrder) with recurring subscriptions (Weekly +
  // Monthly via createSubscription). intent=subscription locks the SDK to
  // subscription-only flow and silently no-ops createOrder clicks — Aga
  // 2026-05-23: "tikliyorum ama bir yere gitmiyor" on /pricing/v2 Custom.
  // intent=capture + vault=true supports both call shapes.
  const options = {
    "client-id": paypalClientId,
    currency: "USD",
    intent: "capture",
    vault: true,
    components: "buttons",
  };

  return (
    <PayPalScriptProvider options={options}>
      <I18nProvider>{children}</I18nProvider>
    </PayPalScriptProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <RootProviders>
      <App />
      {/* Vercel Analytics — privacy-friendly page-view + visitor tracking
          (no cookies, GDPR-clean). Free on the Vercel Hobby tier we're
          already paying for. Critical for measuring the new quick
          assessment funnel: landing → /quick-assessment → results →
          /signup. Aga 2026-05-24 onayı. */}
      <Analytics />
    </RootProviders>
  </React.StrictMode>,
);
