import CALENDAR from './calendar-icon.png';
import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import AuthForm from "./Authform";
import Chatbot from "./components/Chatbot";
import './App.css';
import './calendar.css';
import Calendar from './calendar.tsx'; 

function App() {
  const [user, setUser] = useState<any>(null);
  const [theme, setTheme] = useState<string>(() => {
    if (typeof window === 'undefined') return 'light';
    const stored = localStorage.getItem('theme');
    return stored === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);
  
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  // no system auto-detect listeners

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    // Apply immediately to avoid any visual lag
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', next);
    setTheme(next);
  };
  
  if (!user) {
    return <AuthForm onAuth={() => {}} />;
  }

  return (
    <div className="w-full min-h-screen bg-transparent text-gray-900 dark:text-gray-100 transition-colors duration-300">
      <button
        className="absolute top-2 left-2 z-50 inline-flex items-center gap-2 select-none"
        onClick={toggleTheme}
        role="switch"
        aria-checked={theme === 'dark'}
        aria-label="Toggle dark mode"
      >
        <span className="text-xs opacity-80">{theme === 'dark' ? 'Light' : 'Dark'}</span>
        <span
          className={`relative h-6 w-11 rounded-full transition-colors duration-300 ${theme === 'dark' ? 'bg-blue-500' : 'bg-gray-300'}`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 will-change-transform ${theme === 'dark' ? 'translate-x-5' : 'translate-x-0'}`}
          />
        </span>
      </button>
      <button
        className="absolute top-8 sm:right-2 lg:right-16 bg-red-500 text-white hover:bg-red-600 hover:shadow-xl hover:shadow-red-700 transition duration-300 hover:cursor-pointer px-4 py-2 rounded"
        onClick={() => signOut(auth)}
      >
        Logout
      </button>
      <h1 className="flex text-base justify-center ml-16 mt-12 sm:mr-12 md:ml-16 md:mt-12 font-garamond text-gray-800 dark:text-gray-100">Welcome to your Calendar</h1>
      <div className="relative w-full h-28">
        <a>
          <img src={CALENDAR} className="absolute h-20 justify-center left-1/2 transform -translate-x-1/2 my-6"/>
        </a>
      </div>
      <div>
        <Calendar />
      </div>
      <Chatbot />
      <p className="read-the-docs">
      </p>
    </div>
  )
}

export default App