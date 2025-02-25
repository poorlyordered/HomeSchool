import React, { useState } from 'react';
import { signIn, signUp } from '../lib/auth';

interface AuthFormProps {
  mode: 'signin' | 'signup';
  onSuccess: () => void;
}

export function AuthForm({ mode, onSuccess }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'guardian' | 'student'>('guardian');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        await signUp(email, password, role);
        // After signup, sign in automatically
        try {
          await signIn(email, password);
          onSuccess();
        } catch (err) {
          setError('Account created! Please check your email for verification.');
        }
      } else {
        await signIn(email, password);
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      {mode === 'signup' && (
        <div>
          <label className="block text-sm font-medium text-gray-700">Role</label>
          <div className="mt-1 space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="guardian"
                checked={role === 'guardian'}
                onChange={(e) => setRole(e.target.value as 'guardian')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2">Guardian</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="student"
                checked={role === 'student'}
                onChange={(e) => setRole(e.target.value as 'student')}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2">Student</span>
            </label>
          </div>
        </div>
      )}

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
      </button>
    </form>
  );
}