import axios from 'axios';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Deprecated: createUser (old flow). Use registerUser/loginUser instead.
export const createUser = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const registerUser = async (data) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const loginUser = async (data) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const verifyEmail = async (token) => {
  const response = await api.post('/auth/verify-email', { token });
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
  const response = await api.post('/speaking/transcribe', formData, {
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

export const manualCreditSimple = async ({ email, plan, exam_credits }) => {
  const response = await api.post('/payments/manual-credit-simple', {
    email,
    plan,
    exam_credits,
    admin_token: ''
  });
  return response.data;
};

export default api;