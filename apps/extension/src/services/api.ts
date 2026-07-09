import { useAuthStore } from '../stores/authStore.js';

const BASE_URL = 'http://localhost:5000/api';

const getHeaders = (): HeadersInit => {
  const token = useAuthStore.getState().token;
  const headers: HeadersInit = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Auth endpoints
  async register(name: string, email: string, password: string) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Registration failed');
    }
    return res.json();
  },

  async login(email: string, password: string) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Login failed');
    }
    return res.json();
  },

  // Gig CRUD endpoints
  async getGigs() {
    const res = await fetch(`${BASE_URL}/gigs`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch gigs');
    return res.json();
  },

  async getGigById(id: string) {
    const res = await fetch(`${BASE_URL}/gigs/${id}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch gig details');
    return res.json();
  },

  async createGig(payload: any) {
    const res = await fetch(`${BASE_URL}/gigs`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to create gig draft');
    }
    return res.json();
  },

  async updateGig(id: string, payload: any) {
    const res = await fetch(`${BASE_URL}/gigs/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to update gig draft');
    }
    return res.json();
  },

  async deleteGig(id: string) {
    const res = await fetch(`${BASE_URL}/gigs/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to delete gig draft');
    return res.json();
  },

  // AI generation endpoints
  async generateGig(gigDraftId: string) {
    const res = await fetch(`${BASE_URL}/ai/generate-gig`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ gigDraftId })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'AI generation failed');
    }
    return res.json();
  },

  async regenerateSection(gigDraftId: string, sectionPath: string, instructions: string) {
    const res = await fetch(`${BASE_URL}/ai/regenerate-section`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ gigDraftId, sectionPath, instructions })
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Section regeneration failed');
    }
    return res.json();
  },

  async getHistory() {
    const res = await fetch(`${BASE_URL}/history`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch generation history');
    return res.json();
  }
};
