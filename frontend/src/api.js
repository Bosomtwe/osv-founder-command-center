import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
  withCredentials: true,
});

// CSRF configuration
api.defaults.xsrfCookieName = 'csrftoken';
api.defaults.xsrfHeaderName = 'X-CSRFToken';

// Force credentials and manually ensure CSRF token is sent
api.interceptors.request.use(config => {
  config.withCredentials = true;

  // Manually get CSRF token from cookie and add header for non-GET requests
  const csrfToken = getCookie('csrftoken');
  if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
    config.headers['X-CSRFToken'] = csrfToken;
  }

  return config;
});

// Helper function to get cookie by name
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Pre-load to ensure session and CSRF cookie are set
api.get('tasks/').catch(() => {});

export default api;