// src/store/authstore.js
import { create } from "zustand";
import axios from "axios";

const API_URL = "/api/auth";

axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    error: null,
    isLoading: false,
    isCheckingAuth: true,
    message: null,

    signup: async (email, password, name) => {
        set({ isLoading: true, error: null, message: null });
        try {
            const response = await axios.post(`${API_URL}/signup`, { email, password, name });
            set({
                user: response.data.user,
                isAuthenticated: false,  // Not authenticated until verified
                isLoading: false,
                message: response.data.message
            });
        } catch (error) {
            set({
                error: error.response?.data?.message || "Error signing up",
                isLoading: false
            });
            throw error;
        }
    },

    login: async (email, password) => {
        set({ isLoading: true, error: null, message: null });
        try {
            const response = await axios.post(`${API_URL}/login`, { email, password });

            if (response.data.isAdmin && response.data.redirectUrl) {
                // Redirect directly - Admin App handles its own 'admin_auth_token' from URL
                const redirectUrl = new URL(response.data.redirectUrl);
                if (response.data.token) {
                    redirectUrl.searchParams.set("token", response.data.token);
                }
                window.location.href = redirectUrl.toString();
                return;
            }

            // ✅ Store user-specific token
            if (response.data.token) {
                localStorage.setItem("USER_AUTH_TOKEN", response.data.token);
            }
            set({
                isAuthenticated: true,
                user: response.data.user,
                error: null,
                isLoading: false,
            });
        } catch (error) {
            set({
                error: error.response?.data?.message || "Error logging in",
                isLoading: false
            });
            throw error;
        }
    },

    logout: async () => {
        set({ isLoading: true, error: null });
        try {
            await axios.post(`${API_URL}/logout`);
            // ✅ Clear local user session
            localStorage.removeItem("USER_AUTH_TOKEN");
            set({
                user: null,
                isAuthenticated: false,
                error: null,
                isLoading: false
            });
        } catch (error) {
            set({ error: "Error logging out", isLoading: false });
            throw error;
        }
    },

    verifyEmail: async (code) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/verify-email`, { code });
            if (response.data.token) {
                localStorage.setItem("USER_AUTH_TOKEN", response.data.token);
            }
            set({
                user: response.data.user,
                isAuthenticated: true,  // ✅ Now authenticated after verification
                isLoading: false
            });
            return response.data;
        } catch (error) {
            set({
                error: error.response?.data?.message || "Error verifying email",
                isLoading: false
            });
            throw error;
        }
    },

    checkAuth: async () => {
        set({ isCheckingAuth: true, error: null });

        try {
            const response = await axios.get(
                `${API_URL}/check-auth`,
                { withCredentials: true }
            );

            set({
                user: response.data.user,
                isAuthenticated: true,
                isCheckingAuth: false,
            });
        } catch (error) {
            console.log("checkAuth failed (expected if not logged in)");
            set({
                user: null,
                isAuthenticated: false,
                isCheckingAuth: false,
                error: null,
            });
        }
    },

    refreshUser: async () => {
        try {
            const response = await axios.get(`${API_URL}/check-auth`, {
                withCredentials: true,
            });
            set({ user: response.data.user });
        } catch (error) {
            console.error("Failed to refresh user:", error);
        }
    },


    forgotPassword: async (email) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/forgot-password`, { email });
            set({ message: response.data.message, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error: error.response?.data?.message || "Error sending reset password email",
            });
            throw error;
        }
    },

    resetPassword: async (token, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await axios.post(`${API_URL}/reset-password/${token}`, { password });
            set({ message: response.data.message, isLoading: false });
        } catch (error) {
            set({
                isLoading: false,
                error: error.response?.data?.message || "Error resetting password",
            });
            throw error;
        }
    },

    clearMessage: () => set({ message: null, error: null }),
}));
