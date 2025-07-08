import React from 'react';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { app } from '../firebase'; // Import your Firebase config

const GoogleLoginButton = ({ text = "Continue with Google" }) => {
  const handleGoogleLogin = async () => {
    try {
      const auth = getAuth(app);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Send the ID token to your backend for verification
      const idToken = await result.user.getIdToken();
      
      const response = await fetch('/auth/firebase/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Firebase authentication failed');
      }

      // Redirect or handle success
      window.location.href = '/?auth=success';
    } catch (error) {
      console.error('Google login error:', error);
      // Handle error (show message to user)
    }
  };

  return (
    <button 
      onClick={handleGoogleLogin}
      className="google-login-button"
    >
      <img 
        src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" 
        alt="Google logo" 
        className="google-logo"
      />
      {text}
    </button>
  );
};

export default GoogleLoginButton;