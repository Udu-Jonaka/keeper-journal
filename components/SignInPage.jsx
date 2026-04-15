"use client";

import { useState } from "react";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";

export default function SignInPage() {
  const [error, setError] = useState(null);

  const handleSignIn = async () => {
    try {
      setError(null);
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email;

      const allowedEmails = process.env.NEXT_PUBLIC_ALLOWED_EMAILS
        ? process.env.NEXT_PUBLIC_ALLOWED_EMAILS.split(",").map((e) => e.trim())
        : [];

      if (!allowedEmails.includes(email)) {
        await signOut(auth);
        setError("You do not have access to this journal.");
        return;
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred during sign in.");
    }
  };

  return (
    <div className="signin-page">
      <div className="signin-card">
        <div className="signin-logo">Keeper</div>
        <p className="signin-tagline">A private journal for two.</p>
        <hr className="signin-divider" />
        {error && (
          <div className="status-error" style={{ marginBottom: "1rem" }}>
            {error}
          </div>
        )}
        <button className="btn-google" onClick={handleSignIn}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.46 14.013 17.64 11.804 17.64 9.2z"
              fill="#4285F4"
            />
            <path
              d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
              fill="#34A853"
            />
            <path
              d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"
              fill="#FBBC05"
            />
            <path
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>
        <p className="signin-note">
          Access is restricted to invited members only.
        </p>
      </div>
    </div>
  );
}
