import { useState, useEffect } from 'react';
import { AuthCard } from '@/components/AuthCard';
import { StudyDashboard } from '@/components/StudyDashboard';
import { apiClient } from '@/lib/api';

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already authenticated
    const checkAuth = () => {
      setIsAuthenticated(apiClient.isAuthenticated());
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-background flex items-center justify-center">
        <div className="animate-bounce-gentle">
          <div className="p-4 rounded-full bg-gradient-primary">
            <div className="h-8 w-8" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {isAuthenticated ? (
        <StudyDashboard onLogout={handleLogout} />
      ) : (
        <AuthCard onAuthSuccess={handleAuthSuccess} />
      )}
    </>
  );
};

export default Index;
