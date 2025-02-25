import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getCurrentUser } from './lib/auth';
import { Notification } from './components/Notification';
import { LandingPage } from './components/LandingPage';
import { AuthForm } from './components/AuthForm';
import { Dashboard } from './components/Dashboard';
import type { User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const user = await getCurrentUser();
      setUser(user);
      setLoading(false);
    };
    initAuth();
  }, []);

  const handleAuthSuccess = async () => {
    setIsAuthenticating(true);
    // First update the user state
    const user = await getCurrentUser();
    setUser(user);
    
    // Then show the notification
    setNotification({
      type: 'success',
      message: 'Successfully signed in! Welcome back.',
    });
    setIsAuthenticating(false);
  };

  if (loading || isAuthenticating) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <Router>
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
      <Routes>
        <Route path="/" element={user ? <Dashboard user={user} /> : <LandingPage />} />
        <Route
          path="/signin"
          element={
            user ? (
              <Navigate to="/" replace />
            ) : (
              <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                  <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Sign in to your account
                  </h2>
                </div>
                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                  <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <AuthForm mode="signin" onSuccess={handleAuthSuccess} />
                  </div>
                </div>
              </div>
            )
          }
        />
        <Route
          path="/signup"
          element={
            user ? (
              <Navigate to="/" replace />
            ) : (
              <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                  <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Create your account
                  </h2>
                </div>
                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                  <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    <AuthForm mode="signup" onSuccess={handleAuthSuccess} />
                  </div>
                </div>
              </div>
            )
          }
        />
      </Routes>
    </Router>
  );
}
export default App;