
import { UserProfile, UserAuth } from "../types";

export type AuthProvider = 'google' | 'microsoft' | 'linkedin' | 'github';

interface AuthResponse {
  user: UserProfile;
  token: string;
}

const STORAGE_KEY_USERS = 'finance_users_db';
const STORAGE_KEY_SESSION = 'finance_session_token';

// Helper to simulate DB
const getDB = (): UserAuth[] => {
  const data = localStorage.getItem(STORAGE_KEY_USERS);
  return data ? JSON.parse(data) : [];
};

const saveDB = (users: UserAuth[]) => {
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
};

export const authService = {
  // 1. Sign Up
  signup: async (name: string, email: string, password: string): Promise<AuthResponse> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = getDB();
        if (users.find(u => u.email === email)) {
          reject(new Error('User already exists'));
          return;
        }

        const newUser: UserAuth = {
          id: Date.now().toString(),
          email,
          passwordHash: btoa(password), // Simple base64 for demo (NOT secure for real prod)
          profile: {
            id: Date.now().toString(),
            name,
            email,
            avatar: 'indigo',
            level: 1,
            xp: 0,
            title: 'Novice Saver',
            joinDate: new Date().toISOString(),
            streak: 0,
            persona: 'The Saver',
            onboardingComplete: false
          }
        };

        users.push(newUser);
        saveDB(users);
        
        // Auto login
        const token = `token-${newUser.id}-${Date.now()}`;
        localStorage.setItem(STORAGE_KEY_SESSION, token);
        localStorage.setItem('current_user_id', newUser.id);

        resolve({ user: newUser.profile, token });
      }, 800);
    });
  },

  // 2. Login
  loginWithEmail: async (email: string, password: string): Promise<AuthResponse> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const users = getDB();
        const user = users.find(u => u.email === email && u.passwordHash === btoa(password));

        if (user) {
          const token = `token-${user.id}-${Date.now()}`;
          localStorage.setItem(STORAGE_KEY_SESSION, token);
          localStorage.setItem('current_user_id', user.id);
          resolve({ user: user.profile, token });
        } else {
          reject(new Error('Invalid email or password'));
        }
      }, 800);
    });
  },

  // 3. Social Login (Mock)
  loginWithSocial: async (provider: AuthProvider): Promise<AuthResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Create a mock user if social login is used
        const mockEmail = `user@${provider}.com`;
        const users = getDB();
        let user = users.find(u => u.email === mockEmail);

        if (!user) {
           user = {
             id: Date.now().toString(),
             email: mockEmail,
             passwordHash: 'social-login',
             profile: {
               id: Date.now().toString(),
               name: `${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
               email: mockEmail,
               avatar: 'indigo',
               level: 1,
               xp: 500,
               title: 'Social Saver',
               joinDate: new Date().toISOString(),
               streak: 1,
               persona: 'Connector',
               onboardingComplete: false
             }
           };
           users.push(user);
           saveDB(users);
        }

        const token = `social-token-${Date.now()}`;
        localStorage.setItem(STORAGE_KEY_SESSION, token);
        localStorage.setItem('current_user_id', user.id);
        
        resolve({ user: user.profile, token });
      }, 1000);
    });
  },

  // 4. Update Profile (e.g. after Onboarding)
  updateProfile: async (updates: Partial<UserProfile>): Promise<UserProfile> => {
     const userId = localStorage.getItem('current_user_id');
     if (!userId) throw new Error("No user logged in");

     const users = getDB();
     const userIndex = users.findIndex(u => u.id === userId);
     
     if (userIndex > -1) {
        users[userIndex].profile = { ...users[userIndex].profile, ...updates };
        saveDB(users);
        return users[userIndex].profile;
     }
     throw new Error("User not found");
  },

  // 5. Check Session
  getCurrentUser: async (): Promise<UserProfile | null> => {
     const token = localStorage.getItem(STORAGE_KEY_SESSION);
     const userId = localStorage.getItem('current_user_id');
     
     if (!token || !userId) return null;

     const users = getDB();
     const user = users.find(u => u.id === userId);
     return user ? user.profile : null;
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY_SESSION);
    localStorage.removeItem('current_user_id');
  }
};
