'use client';

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { LogOut } from 'lucide-react';
import axiosInstance from '../lib/axiosInstance';
import { useToast } from '../hooks/use-toast';

export function LogoutButton() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      // 1. Call backend to invalidate token
      await axiosInstance.post('/authentication/logout');

      // 2. Clear client-side tokens
      localStorage.removeItem('auth');
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();

      // 3. Force reload and navigation without going back
      window.location.replace('/'); // Go to homepage (or login)

      // Optional: Show toast (will work only if the new page also mounts the toast component)
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
        variant: "default",
      });

    } catch (error) {
      console.error("Logout failed:", error);
      localStorage.removeItem('auth');
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.clear();

      window.location.replace('/');

      let errorMessage = "There was an issue logging out, but your session has been cleared locally.";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      toast({
        title: "Logout Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </Button>
  );
}
