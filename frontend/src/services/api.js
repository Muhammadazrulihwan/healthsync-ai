const BASE_URL = 'http://localhost:8000/api/v1';

const handleResponse = async (res) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Error ${res.status}`);
  }
  return res.json();
};

const post = (path, data) =>
  fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then(handleResponse);

const get = (path) => fetch(`${BASE_URL}${path}`).then(handleResponse);

export const checkSymptoms      = (data) => post('/symptom/check', data);
export const symptomFollowup    = (data) => post('/symptom/followup', data);
export const getMedicationInfo  = (data) => post('/medication/info', data);
export const sendChat           = (data) => post('/chatbot/chat', data);
export const getChatTopics      = ()     => get('/chatbot/topics');
export const getPreventiveSuggestions = (data) => post('/preventive/suggest', data);
export const getDailyTips       = (cat = 'general') => get(`/preventive/health-tips/daily?category=${cat}`);
export const checkApiHealth     = ()     => fetch('http://localhost:8000/health').then(handleResponse);
