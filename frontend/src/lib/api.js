import axios from 'axios';
import { stashUpgradeResume } from './upgradeFlow';
import { getToken, setToken, clearToken } from './authToken';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach the opaque session token (audit F01/F03) to every request so
// ownership/admin-gated routes can identify the caller.
api.interceptors.request.use((config) => {
  const t = getToken();
  if (t) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${t}`;
  }
  return config;
});

// Auth endpoints where a 401 is a normal "wrong credentials" error shown on
// the form — NOT an expired session that should bounce the user to /login.
const AUTH_PATHS = ['/auth/login', '/auth/register', '/auth/google/session', '/auth/facebook-login'];

// Codes the backend uses to flag "this is a paywall, not a transient error".
// Speaking surface uses quota_exhausted/fulltest_locked (legacy); Liz +
// writing surfaces use quota_exceeded/plan_locked. All four route through
// the same upgrade-resume flow.
const PAYWALL_CODES = new Set([
  'quota_exceeded',
  'quota_exhausted',
  'fulltest_locked',
  'plan_locked',
]);

// Global 402/403 paywall handler: stash where the user was so the post-
// checkout flow can resume them on the same task, and broadcast a window
// event so mounted pages can show an inline upsell instead of reloading.
// The actual /pricing redirect is left to the call site (some surfaces
// prefer an in-page modal first) — we only stash the resume target here.
api.interceptors.response.use(
  (resp) => resp,
  (error) => {
    const status = error?.response?.status;
    const detail = error?.response?.data?.detail;
    const code = detail && typeof detail === 'object' ? detail.code : null;
    // Expired/invalid session (audit F03): drop the dead session and bounce to
    // login — but not for the auth endpoints themselves (401 there = wrong
    // credentials, shown inline on the form).
    const reqUrl = error?.config?.url || '';
    const isAuthCall = AUTH_PATHS.some((p) => reqUrl.includes(p));
    if (status === 401 && !isAuthCall) {
      try {
        clearToken();
        window.localStorage.removeItem('user');
        if (typeof window !== 'undefined' && window.location &&
            !window.location.pathname.startsWith('/login')) {
          const next = encodeURIComponent(window.location.pathname + window.location.search);
          window.location.assign(`/login?next=${next}`);
        }
      } catch (_) { /* non-browser */ }
      return Promise.reject(error);
    }
    if ((status === 402 || status === 403) && code && PAYWALL_CODES.has(code)) {
      try {
        // Stash the *current* path so onApprove can return the user here.
        if (typeof window !== 'undefined' && window.location) {
          stashUpgradeResume({
            from: window.location.pathname + window.location.search,
            kind: detail.kind,
            label: detail.detail || detail.message,
          });
        }
        window.dispatchEvent(
          new CustomEvent('testmaster:quota-exceeded', { detail }),
        );
      } catch (_) {
        /* non-browser environment */
      }
    }
    return Promise.reject(error);
  }
);

// Deprecated: createUser (old flow). Use registerUser/loginUser instead.
export const createUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const registerUser = async (data) => {
  const response = await api.post('/auth/register', data);
  if (response.data?.token) setToken(response.data.token);
  return response.data;
};

export const loginUser = async (data) => {
  const response = await api.post('/auth/login', data);
  if (response.data?.token) setToken(response.data.token);
  return response.data;
};

// Own Google OAuth client (replaces the Emergent proxy as of 2026-05-08).
// Backend hands the browser a single-use ticket in the `#session_id=...` URL
// fragment; we POST it back here to receive the User.
export const loginWithGoogleSession = async (sessionId) => {
  const response = await api.post('/auth/google/session', { session_id: sessionId });
  if (response.data?.token) setToken(response.data.token);
  return response.data;
};

export const verifyEmail = async (token) => {
  const response = await api.post('/auth/verify-email', { token });
  return response.data;
};

export const resendVerificationEmail = async (email) => {
  const response = await api.post('/auth/resend-verification', { email });
  return response.data;
};

export const requestPasswordReset = async (email) => {
  const response = await api.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await api.post('/auth/reset-password', { token, new_password: newPassword });
  return response.data;
};



export const getUser = async (userId) => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

export const getUserUsage = async (userId) => {
  const response = await api.get(`/users/${userId}/usage`);
  return response.data;
};

export const getTests = async (testType = null) => {
  const params = testType ? { test_type: testType } : {};
  const response = await api.get('/tests', { params });
  return response.data;
};

export const getTest = async (testId) => {
  const response = await api.get(`/tests/${testId}`);
  return response.data;
};

export const submitTest = async (submission) => {
  const response = await api.post('/tests/submit', submission);
  return response.data;
};

export const evaluateWriting = async (data) => {
  const response = await api.post('/evaluate/writing', data);
  return response.data;
};

export const evaluateSpeaking = async (data) => {
  const response = await api.post('/evaluate/speaking', data);
  return response.data;
};

export const transcribeAudio = async (audioFile) => {
  const formData = new FormData();
  formData.append('file', audioFile);
  const response = await api.post('/transcribe-audio', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};

export const getSpeakingQuestions = async (part) => {
  const response = await api.get(`/speaking/questions/${part}`);
  return response.data;
};

export const getPaymentOrder = async (orderId) => {
  const response = await api.get(`/payments/orders/${orderId}`);
  return response.data;
};

export const startSpeakingSession = async (userEmail) => {
  const response = await api.post('/speaking/session/start', {}, {
    headers: {
      'x-user-email': userEmail,
    },
  });
  return response.data;
};

export const getUserProgress = async (userId) => {
  const response = await api.get(`/progress/${userId}`);
  return response.data;
};

export const getTips = async (category = null) => {
  const params = category ? { category } : {};
  const response = await api.get('/tips', { params });
  return response.data;
};

export const getCourses = async () => {
  const response = await api.get('/courses');
  return response.data;
};

export const getCourse = async (courseId) => {
  const response = await api.get(`/courses/${courseId}`);
  return response.data;
};

export const manualCreditSimple = async ({ email, plan, exam_credits, admin_email }) => {
  const response = await api.post('/payments/manual-credit-simple', {
    email,
    plan,
    exam_credits,
    admin_email,
    admin_token: ''
  });
  return response.data;
};

export const createPaypalOrder = async ({ planId, email }) => {
  const response = await api.post('/payments/paypal/create-order', {
    planId,
    email,
  });
  return response.data;
};

export const capturePaypalOrder = async ({ orderId, planId, email }) => {
  const response = await api.post('/payments/paypal/capture-order', {
    orderId,
    planId,
    email,
  });
  return response.data;
};



export default api;

export const initiateSepayPayment = async ({ planId, email, currency = 'VND' }) => {
  const response = await api.post('/payments/sepay/initiate', { planId, email, currency });
  return response.data;
};

export const getSepayStatus = async (referenceCode) => {
  const response = await api.get(`/payments/sepay/status/${referenceCode}`);
  return response.data;
};

export const cancelPaypalSubscription = async ({ email, reason }) => {
  const response = await api.post('/payments/paypal/cancel-subscription', {
    email,
    reason: reason || '',
  });
  return response.data;
};

export const uploadBankPayment = async (formData) => {
  const response = await api.post('/payments/bank/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
