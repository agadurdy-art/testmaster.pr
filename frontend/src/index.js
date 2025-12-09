import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";
import { I18nProvider } from "./lib/i18n";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

const paypalClientId = process.env.REACT_APP_PAYPAL_CLIENT_ID;

function RootProviders({ children }) {
  if (!paypalClientId) {
    return <I18nProvider>{children}</I18nProvider>;
  }

  const options = {
    "client-id": paypalClientId,
    currency: "USD",
    intent: "capture",
    components: "buttons,marks",
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
    </RootProviders>
  </React.StrictMode>,
);
