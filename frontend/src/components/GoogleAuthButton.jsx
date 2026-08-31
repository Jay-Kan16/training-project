import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const GoogleIcon = (props) => (
  <svg width={18} height={18} viewBox="0 0 24 24" {...props}>
    <path
      fill="#EA4335"
      d="M12 5c1.54 0 2.94.55 4.04 1.46l3.03-3.03C17.24 1.7 14.77 1 12 1 7.42 1 3.48 3.6 1.58 7.37l3.64 2.82C6.1 7.24 8.81 5 12 5z"
    />
    <path
      fill="#4285F4"
      d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.65 2.83c2.14-1.98 3.37-4.89 3.37-8.65z"
    />
    <path
      fill="#FBBC05"
      d="M5.22 14.81c-.24-.72-.37-1.49-.37-2.28 0-.79.13-1.56.37-2.28L1.58 7.43C.57 9.44 0 11.66 0 14c0 2.34.57 4.56 1.58 6.57l3.64-2.76z"
    />
    <path
      fill="#34A853"
      d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.65-2.83c-1.07.72-2.45 1.16-4.28 1.16-3.19 0-5.9-2.24-6.78-5.19L1.58 15.99C3.48 19.8 7.42 23 12 23z"
    />
  </svg>
);

export default function GoogleAuthButton({ text = 'signin_with', onError }) {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showConfigNotice, setShowConfigNotice] = useState(false);
  const [gsiError, setGsiError] = useState(false);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isConfigured = Boolean(clientId && clientId.trim() !== '' && !gsiError);

  const handleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      if (!credentialResponse?.credential) {
        throw new Error('No credential received from Google');
      }
      await googleLogin(credentialResponse.credential);
      navigate('/dashboard');
    } catch (err) {
      const msg =
        err.response?.data?.message || err.message || 'Google sign-in failed';
      if (onError) onError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomClick = () => {
    if (!clientId) {
      setShowConfigNotice(true);
      if (onError) {
        onError(
          'Google Client ID is not configured yet. Add VITE_GOOGLE_CLIENT_ID to your frontend .env and GOOGLE_CLIENT_ID to your backend .env.'
        );
      }
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {isConfigured ? (
        <div className="w-full flex justify-center google-btn-wrapper overflow-hidden rounded-lg">
          <GoogleLogin
            onSuccess={handleSuccess}
            onError={() => {
              setGsiError(true);
              if (onError) onError('Google Sign-In was cancelled or failed');
            }}
            text={text === 'signup_with' ? 'signup_with' : 'signin_with'}
            theme="filled_black"
            shape="rectangular"
            size="large"
            width="320"
          />
        </div>
      ) : (
        <div className="w-full">
          <button
            type="button"
            onClick={handleCustomClick}
            className="w-full flex items-center justify-center gap-3 bg-surface-card hover:bg-surface-card/70 border border-white/10 text-white font-medium text-sm px-4 py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            <GoogleIcon />
            <span>
              {text === 'signup_with'
                ? 'Sign up with Google'
                : 'Continue with Google'}
            </span>
          </button>

          {showConfigNotice && (
            <div className="mt-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
              <p className="font-semibold mb-1">⚙️ Google OAuth Setup:</p>
              <p>
                To connect live Google Sign-In, add your Google OAuth Client ID to your environment files:
              </p>
              <code className="block my-1 px-2 py-1 rounded bg-black/40 text-[11px] text-amber-200">
                frontend/.env: VITE_GOOGLE_CLIENT_ID=your-client-id
                <br />
                backend/.env: GOOGLE_CLIENT_ID=your-client-id
              </code>
            </div>
          )}
        </div>
      )}

      {loading && (
        <p className="text-xs text-slate-400 mt-2 animate-pulse">
          Authenticating with Google...
        </p>
      )}
    </div>
  );
}
