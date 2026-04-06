import React from "react";
// Correct relative path
import { googleLogin } from "../firebase";

export default function Login() {
  const handleGoogleLogin = async () => {
    try {
      const user = await googleLogin();
      alert(`Welcome ${user.displayName}`);
      // Optional: redirect user to home page
      window.location.href = "/";
    } catch (error) {
      console.error(error);
      alert("Login failed. Check console for details.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <button
        onClick={handleGoogleLogin}
        className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
      >
        Continue with Google
      </button>
    </div>
  );
}
