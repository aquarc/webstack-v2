import React from 'react';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { app } from '../firebase'; // Import your Firebase config
import './GoogleLoginButton.css';
import Cookies from 'js-cookie';

const GoogleLoginButton = ({ text = "Continue with Google" }) => {
  const handleGoogleLogin = async () => {
    try {
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      const idToken = await result.user.getIdToken();

      const response = await fetch('/auth/firebase/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          // Email already registered with password
          alert('This email is already registered with a password. Please log in with your password instead.');
          return;
        }
        throw new Error(data.message || 'Firebase authentication failed');
      }

      // Store user info in cookies
      Cookies.set('user', JSON.stringify({
        email: data.email,
        username: data.username || data.email.split('@')[0]
      }), { expires: 7 });

      // Redirect to intended page or default to /sat
      const redirectTo = window.location.state?.from?.pathname || '/sat';
      window.location.href = redirectTo;
    } catch (error) {
      console.error('Google login error:', error);
      alert(`Login failed: ${error.message}`);
    }
  };

  return (
    <button
      onClick={handleGoogleLogin}
      className="google-login-button"
    >
      <div className="google-icon">
        <img
          src="/googleLogo.png"
          alt="Google logo"
        />
      </div>
      {text}
    </button>
  );
};

export default GoogleLoginButton;