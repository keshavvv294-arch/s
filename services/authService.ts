
import { UserProfile } from "../types";

interface AuthResponse {
  user: UserProfile;
  token: string;
}

export const authService = {
  // 1. Sign Up
  signup: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signup failed');
    }
    const data = await response.json();
    localStorage.setItem('wealthflow_user', JSON.stringify(data.user));
    localStorage.setItem('wealthflow_token', data.token);
    return data;
  },

  // 2. Login
  loginWithEmail: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }
    const data = await response.json();
    localStorage.setItem('wealthflow_user', JSON.stringify(data.user));
    localStorage.setItem('wealthflow_token', data.token);
    return data;
  },

  // 4. Update Profile
  updateProfile: async (updates: Partial<UserProfile>): Promise<UserProfile> => {
    const savedUser = localStorage.getItem('wealthflow_user');
    if (!savedUser) throw new Error("No user logged in");
    const user = JSON.parse(savedUser);

    const response = await fetch('/api/auth/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, updates })
    });
    if (!response.ok) {
      throw new Error('Update failed');
    }
    const updatedUser = await response.json();
    localStorage.setItem('wealthflow_user', JSON.stringify(updatedUser));
    return updatedUser;
  },

  // 5. Check Session
  getCurrentUser: async (): Promise<UserProfile | null> => {
    const savedUser = localStorage.getItem('wealthflow_user');
    return savedUser ? JSON.parse(savedUser) : null;
  },

  // 6. Auth State Listener (Simplified for custom auth)
  onAuthStateChanged: (callback: (user: UserProfile | null) => void) => {
    const user = localStorage.getItem('wealthflow_user');
    callback(user ? JSON.parse(user) : null);
    return () => {};
  },

  logout: async () => {
    localStorage.removeItem('wealthflow_user');
    localStorage.removeItem('wealthflow_token');
  }
};
