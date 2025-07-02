import React from "react";

// Simple auth client for our JWT auth system
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const authClient = {
  // Google OAuth login
  signInWithGoogle: () => {
    window.location.href = `${API_BASE_URL}/api/auth/google`;
  },

  // Check if user is authenticated
  getCurrentUser: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        return { user: data.user, isAuthenticated: true };
      }
      return { user: null, isAuthenticated: false };
    } catch {
      return { user: null, isAuthenticated: false };
    }
  },

  // Logout
  signOut: async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      return true;
    } catch (error) {
      console.error('Logout failed:', error);
      return false;
    }
  }
};

// React hook for auth state
export const useSession = () => {
  const [session, setSession] = React.useState({ user: null, isAuthenticated: false, loading: true });

  React.useEffect(() => {
    authClient.getCurrentUser().then(result => {
      setSession({ ...result, loading: false });
    });
  }, []);

  const signOut = async () => {
    const success = await authClient.signOut();
    if (success) {
      setSession({ user: null, isAuthenticated: false, loading: false });
    }
  };

  return { ...session, signOut };
};

// Legacy exports for compatibility
export const signIn = {
  social: ({ provider }: { provider: string }) => {
    if (provider === 'google') {
      authClient.signInWithGoogle();
    }
  }
};

export const signOut = authClient.signOut; 