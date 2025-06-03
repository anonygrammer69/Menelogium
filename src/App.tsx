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
        className="absolute top-8 sm:right-2 lg:right-16 bg-red-500 text-white hover:bg-red-600 hover:shadow-xl hover:shadow-red-700 transition duration-300 hover:cursor-pointer px-4 py-2 rounded"
        onClick={() => signOut(auth)}
      >
        Logout
      </button>
      <h1 className="flex text-base justify-center ml-16 mt-10 md:ml-10 font-garamond text-gray-800">Welcome to your Calendar</h1>
      <div>
        <a>
          <img src={CALENDAR} className="relative h-20 justify-center sm:ml-85 lg:ml-125 my-6"/>
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
