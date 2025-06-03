import React, { useState } from "react";
import { auth, googleProvider } from "./firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import googleLogo from "./google-logo.png";

const AuthForm: React.FC<{ onAuth: () => void }> = ({ onAuth }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      onAuth();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      onAuth();
    } catch (err: any) {
        setError("Google sign-in failed");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-xs mx-auto text-black mt-10 p-10 bg-white rounded shadow-xl">
      <h2 className="text-xl font-bold">{isLogin ? "Login" : "Sign Up"}</h2>
      <input
        className="border p-2 rounded"
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />
      <input
        className="border p-2 rounded"
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      {error && <div className="text-red-500">{error}</div>}
      <button className="bg-blue-600 text-white rounded p-2 hover:bg-blue-700" type="submit">
        {isLogin ? "Login" : "Sign Up"}
      </button>
      <button
        type="button"
        className="text-blue-600 underline"
        onClick={() => setIsLogin(!isLogin)}
      >
        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
      </button>
      <button
        type="button"
        className="bg-gray-300 text-black rounded p-2 hover:bg-gray-400 mt-2"
        onClick={handleGoogleSignIn}
      >
        <img src={googleLogo} alt="Google" className="h-6 w-6 justify-center mr-2 google-logo" /> Sign in with Google
      </button>
    </form>
  );
};

export default AuthForm;