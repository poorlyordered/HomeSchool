import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Notification } from "./Notification";

export const SessionExpired = () => {
  const navigate = useNavigate();
  const [showNotification, setShowNotification] = useState(true);

  useEffect(() => {
    // Automatically redirect to sign in page after 3 seconds
    const redirectTimer = setTimeout(() => {
      navigate("/signin");
    }, 3000);

    // Clean up the timer when component unmounts
    return () => {
      clearTimeout(redirectTimer);
    };
  }, [navigate]);

  const handleSignIn = () => {
    navigate("/signin");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {showNotification && (
        <Notification
          type="error"
          message="Your session has expired. Please sign in again."
          onClose={() => setShowNotification(false)}
        />
      )}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Session Expired
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Your session has expired due to inactivity. You will be redirected to
          the sign in page.
        </p>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="flex justify-center">
            <button
              onClick={handleSignIn}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign In Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
