import CALENDAR from './calendar-icon.png';
import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import AuthForm from "./Authform";
import './App.css';
import './calendar.css';
import Calendar from './calendar.tsx'; 

function App() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);
  
  if (!user) {
    return <AuthForm onAuth={() => {}} />;
  }

  return (
    <>
      <button
        className="absolute top-8 right-4 sm:right-2 md:right-16 bg-red-500 text-white hover:bg-red-700 hover:cursor-pointer px-4 py-2 rounded"
        onClick={() => signOut(auth)}
      >
        Logout
      </button>
      <h1 className="flex text-base justify-center mt-10 sm:mt-10 md:mt-10 md:ml-10 underline font-semibold md:font-semibold text-gray-800">Welcome to your Calendar</h1>
      <div>
        <a>
          <img src={CALENDAR} className="flex h-20 justify-center sm:ml-75 md:ml-125 my-6"/>
        </a>
      </div>
      <div>
        <p>
          <Calendar />
        </p>
      </div>
      <p className="read-the-docs">
      </p>
    </>
  )
}

export default App
