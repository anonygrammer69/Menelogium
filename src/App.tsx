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
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const [userThemeSet, setUserThemeSet] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('userThemeSet') === 'true';
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

  useEffect(() => {
    localStorage.setItem('userThemeSet', userThemeSet ? 'true' : 'false');
  }, [userThemeSet]);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (!userThemeSet) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, [userThemeSet]);

  const toggleTheme = () => {
    setUserThemeSet(true);
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };
  
  if (!user) {
    return <AuthForm onAuth={() => {}} />;
  }

  return (
    <>
      <button
        className="absolute top-2 left-2 z-50 px-3 py-1 rounded border border-gray-300 bg-white text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700 dark:hover:bg-gray-700 transition"
        onClick={toggleTheme}
        aria-label="Toggle dark mode"
      >
        {theme === 'dark' ? 'Light' : 'Dark'}
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
    </>
  )
}

export default App