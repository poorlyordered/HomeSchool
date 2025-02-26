import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyEmail } from '../lib/auth';
import { Notification } from './Notification';

export function EmailVerification() {
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    const handleVerification = async () => {
      try {
        // The token is automatically handled by Supabase in the URL
        const result = await verifyEmail();
        
        if (result.success) {
          setNotification({
            type: 'success',
            message: 'Email verified successfully! You can now sign in.'
          });
          
          // Redirect to sign in page after 3 seconds
          setTimeout(() => {
            navigate('/signin');
          }, 3000);
        } else {
          setError('Email verification failed. Please try again or contact support.');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred during verification');
      } finally {
        setVerifying(false);
      }
    };

    handleVerification();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Email Verification
        </h2>
      </div>
      
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {verifying ? (
            <div className="flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-700">Verifying your email...</p>
            </div>
          ) : error ? (
            <div className="text-center">
              <div className="text-red-600 mb-4">{error}</div>
              <button
                onClick={() => navigate('/signin')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Return to Sign In
              </button>
            </div>
          ) : (
            <div className="text-center">
              <div className="text-green-600 mb-4">
                Email verified successfully! Redirecting to sign in page...
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
