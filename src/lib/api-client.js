const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://127.0.0.1:5001';
const WIL_API_URL = process.env.NEXT_PUBLIC_WIL_API_URL || 'http://127.0.0.1:3000';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async get(endpoint, init = {}) {
    return this.fetch(endpoint, { ...init, method: 'GET' });
  }

  async post(endpoint, body, init = {}) {
    return this.fetch(endpoint, {
      ...init,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers || {}),
      },
      body: JSON.stringify(body),
    });
  }

  async fetch(endpoint, init = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const res = await fetch(url, init);
    if (!res.ok) {
        // Try to parse error message from JSON response
        try {
            const errorData = await res.json();
            throw new Error(errorData.message || errorData.error || `Request failed with status ${res.status}`);
        } catch (e) {
            // Fallback if response isn't JSON or parsing fails
             throw new Error(`Request failed with status ${res.status}`);
        }
    }
    return res.json();
  }
}

export const backendClient = new ApiClient(BACKEND_API_URL);
export const wilClient = new ApiClient(`${WIL_API_URL}/api/v1`);

export const getWilUrl = () => `${WIL_API_URL}/api/v1`;
