import "tailwindcss";
import React, { useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay} from "date-fns";
import {db, auth } from "./firebase";
import { useEffect } from "react";
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import leftArrow from "./left-arrow.png";
import rightArrow from "./right-arrow.png";
import menuIcon from "./menu--icon.png";

type Event = {
  id? :string;
  date: string; 
  title: string;
  uid: string;
};

const months = Array.from({ length: 12 }, (_, i) => format(new Date(2000, i), "MMMM"));
const years = Array.from({ length: 100 }, (_, i) => (new Date().getFullYear() - 25 + i));

// Webhook URL for n8n
const WEBHOOK_URL = "https://pumped-sincerely-coyote.ngrok-free.app/webhook/send-reminder";

const Calendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogDate, setDialogDate] = useState<Date | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const[showSidebar, setShowSidebar] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const handleYearChange = (year: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentMonth(new Date(parseInt(year.target.value), currentMonth.getMonth(), 1));
  };
  const handleMonthChange = (month: string) => {
    const newMonthIndex = months.indexOf(month);
    setCurrentMonth(new Date(currentMonth.getFullYear(), newMonthIndex, 1));
  };
 
  const handleDateClick = (day: Date) => {
    setDialogDate(day);
    setSelectedDate(day);
    setShowDialog(true);
    setError(""); // Clear any previous errors
};

  useEffect(() => {
    const fetchEvents = async () => {
      if (!auth.currentUser) return;
      try {
        const q = query(
          collection(db, "events"),
          where("uid", "==", auth.currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        const loadedEvents = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
          })) as Event[];
        setEvents(loadedEvents);
      } catch (error) {
        console.error("Error fetching events:", error);
        setError("Failed to load events");
      }
      };
    fetchEvents();
  }, []);

  useEffect(() => {
    if (showDialog) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showDialog]);

  // Function to send webhook request
  const sendWebhookNotification = async (eventData: Event) => {
    try {
      const webhookPayload = {
        userEmail: auth.currentUser?.email || "",
        eventTitle: eventData.title,
        eventDate: eventData.date,
        uid: eventData.uid,
        timestamp: new Date().toISOString()
      };

      console.log("Sending webhook notification:", webhookPayload);

      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(webhookPayload),
      });

      if (response.ok) {
        console.log("Webhook notification sent successfully");
      } else {
        console.error("Failed to send webhook notification:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error sending webhook notification:", error);
    }
  };

  const handleAddEvent = async () => {
    if (!eventTitle.trim() || !dialogDate || !auth.currentUser) {
      setError("Please enter an event title");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const normalizedDate = new Date(dialogDate.getFullYear(), dialogDate.getMonth(), dialogDate.getDate());
      const formattedDate = format(normalizedDate, "dd-MM-yyyy");
      const newEvent = {
        date: formattedDate,
        title: eventTitle.trim(),
        uid: auth.currentUser.uid,
      };
      
      console.log("Creating event:", newEvent);
      
      // Add event to Firestore
      const docRef = await addDoc(collection(db, "events"), newEvent);
      const eventWithId = { ...newEvent, id: docRef.id };
      
      console.log("Event created successfully with ID:", docRef.id);
      
      // Update local state
      setEvents(prev => [...prev, eventWithId]);
      
      // Send webhook notification (don't let this fail the event creation)
      try {
        await sendWebhookNotification(eventWithId);
      } catch (webhookError) {
        console.error("Webhook failed but event was created:", webhookError);
      }
      
      // Close dialog and reset form
      setShowDialog(false);
      setEventTitle("");
      setDialogDate(null);
      
      console.log("Event creation process completed successfully");
    } catch (error) {
      console.error("Error creating event:", error);
      setError(`Failed to create event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteEvent = async (eventToDelete: Event) => {
    try {
      setEvents(prev => prev.filter(event => event.id !== eventToDelete.id));
      if (eventToDelete.id) {
        await deleteDoc(doc(db, "events", eventToDelete.id));
        console.log("Event deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      setError("Failed to delete event");
      // Restore the event in case of error
      setEvents(prev => [...prev, eventToDelete]);
    }
  };

  const renderHeader = () => (
    <div className="flex-row border-2 bg-gradient-to-b from-white to-slate-300 border-black rounded-lg text-black text-lg font-semibold">
      <button 
      className="hover:cursor-pointer" 
      onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} 
      aria-label="Previous month">
        <img src={leftArrow} alt="Previous" className="relative top-1 w-6.5 h-6.5 p-0.5 hover:bg-gray-300 hover:border-2 rounded"/>
      </button>
      <select className="hover:cursor-pointer w-25 text-center mb-1 hover:bg-white hover:border-2 rounded-xl"
        onChange={(e) => handleMonthChange(e.target.value)}
        value={format(currentMonth, "MMMM")}>
        {months.map((month) => (
        <option key={month} value={month}>
          {month}
        </option>
        ))}
      </select>
      <select className="hover:cursor-pointer w-30 text-center mb-1 hover:bg-white hover:border-2 rounded-xl"
        onChange={handleYearChange} 
        value={format(currentMonth, "yyyy")}>
        {years.map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
          ))}
      </select>
      <button 
      className="hover:cursor-pointer" 
      onClick={() => (setCurrentMonth(addMonths(currentMonth, 1)))}
      aria-label="Next month">
        <img src={rightArrow} alt="Next" className="relative top-1 w-6.5 h-6.5 p-0.5 hover:bg-gray-300 hover:border-2 rounded"/>
      </button>
    </div>
  );

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const renderDays = () => {
    const days = [];
    days.push(
    <div className="flex flex-row justify-evenly text-black text-lg">
      {weekdays.map((day) => (
        <div key={day}>
          {day}
        </div>
      ))}
    </div>
  );
    const startDate = startOfWeek(startOfMonth(currentMonth));
    const endDate = endOfWeek(endOfMonth(currentMonth));
    let day = startDate;
    const dayCells = [];
    while (day <= endDate) {
      const currentDay = day;
      dayCells.push(
        <div
          key={currentDay.toString()}
          className={`flex items-center justify-center rounded-sm w-26 h-24 font-sans select-none cursor-pointer
            ${!isSameMonth(currentDay, currentMonth) ? "text-gray-400" : ""}
            ${isSameDay(currentDay, new Date())
              ? "bg-red-500 text-white hover:bg-red-600 hover:shadow-xl hover:shadow-red-700 transition duration-300"
              : "bg-slate-300 text-black hover:shadow-xl hover:shadow-blue-700 hover:bg-blue-500 transition duration-300"
            }
          `}
          onClick={() => handleDateClick(currentDay)}
        >
          {format(currentDay, "dd")}
        </div>
      );
      day = addDays(day, 1);
    }
    return (
      <div>
        <div className="grid grid-cols-7 border-2 border-black rounded-lg text-black bg-slate-300 text-lg mb-2">
          {weekdays.map((day) => (
            <div key={day} className="relative text-center font-semibold py-2">{day}</div>
          ))}
          </div>
          <div className="grid grid-cols-7 gap-px">
          {dayCells}
        </div>
      </div>
    );
  };

const dialogBox = showDialog && (
  <div className="fixed inset-0 flex backdrop-blur-sm items-center justify-center z-50">
    <div className="bg-white p-6 rounded-xl text-black flex flex-col gap-6 ml-10 mb-10 h-50 w-100">
      <h3 className="text-lg font-bold">Add Event for {dialogDate ? format(dialogDate, "dd-MM-yyyy") : ""}</h3>
      {error && (
        <div className="text-red-500 text-sm bg-red-50 p-2 rounded">
          {error}
        </div>
      )}
      <input
        className="border p-2 rounded"
        type="text"
        placeholder="Event Title"
        value={eventTitle}
        onChange={(e) => setEventTitle(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter' && !isLoading) {
            handleAddEvent();
          }
        }}
        autoFocus
      />
      <div className="flex gap-2 justify-end">
        <button
          className="px-4 py-1 rounded text-white bg-gray-400 hover:bg-gray-500"
          onClick={() => {
            setShowDialog(false); 
            setEventTitle(""); 
            setDialogDate(null);
            setError("");
          }}
        >
          Cancel
        </button>
        <button
          className="px-4 py-1 rounded text-white bg-blue-600 hover:bg-blue-700"
          onClick={handleAddEvent}
        >
          {isLoading ? "Adding..." : "Add"}
        </button>
      </div>
    </div>
  </div>
  );

  const renderSelectedDateEvents = () => {
  if (!selectedDate) {
    return <p>Select a date to view its events.</p>;
  }

  const formattedDate = format(selectedDate, "dd-MM-yyyy");
  const selectedDateEvents = events.filter((e) => e.date === formattedDate);

  if (selectedDateEvents.length === 0) {
    return <p>No events for {formattedDate}.</p>;
  }
  return (
    <ul>
      {selectedDateEvents.map((e, i) => (
        <li key={i} className="justify-center font-garamond text-black text-lg">
          {formattedDate}: {e.title}
          <button
            onClick={() => handleDeleteEvent(e)}
            className="hover:bg-red-600 hover:shadow-red-700 hover:shadow-lg transition duration hover:cursor-pointer ml-1 300 rounded font-normal"
          >
            ❌
          </button>
        </li>
      ))}
    </ul>
  );
};

const renderSelectedMonthEvents = () => {
  const currentmonthString = format(currentMonth, "MM-yyyy");
  const monthEvents = events
    .filter(e => {
      const [, month, year] = e.date.split("-");
      return `${month}-${year}` === currentmonthString;
    })

    .sort((a, b) => {
      const [aDay, aMonth, aYear] = a.date.split("-");
      const [bDay, bMonth, bYear] = b.date.split("-"); 
      const aDate = new Date(`${aYear}-${aMonth}-${aDay}`);
      const bDate = new Date(`${bYear}-${bMonth}-${bDay}`)
      return aDate.getTime() - bDate.getTime();
    })

   if (monthEvents.length === 0) {
    return <p>No events for this Month</p>;
   }

  return (
    <ul>
      {monthEvents.map((e, i) => (
        <li key={e.id || i} className="justify-center font-garamond text-black text-lg">
          {e.date}: {e.title}
          <button
            onClick={() => handleDeleteEvent(e)}
            className="hover:bg-red-600 hover:shadow-red-700 hover:shadow-lg hover:cursor-pointer transition duration 300 rounded ml-1 font-normal"
          >
            ❌
          </button>
        </li>
      ))}
    </ul>
  )
  };
return (
    <>
      {dialogBox}
      <button 
        className="z-40 hover:cursor-pointer toggle-button"
        onClick={() => setShowSidebar((prev) => !prev)}
        aria-label="Toggle Sidebar">
          <img src={menuIcon} alt="Menu" className="relative w-20 h-20 hover:bg-gray-400 transition duration-300 hover:border-2 hover:border-black rounded"/>
      </button>
      <div className="flex flex-col md:flex-row">
        {showSidebar && (
          <div
            className={`
            fixed top-0 left-0 z-50 w-64 py-2 px-4 h-full bg-gradient-to-b from-white to-slate-400 border-2 border-black rounded-lg p-4 gap-4 flex flex-col shadow-lg
            transition duration-300 ease-in-out
            ${showSidebar ? "translate-x-0" : "translate-x-4"}
           `}
            style={{ willChange: "transform" }}
          >
            <h2 className="text-xl font-semibold mt-4 mb-4">Menu</h2>
           <button
              className="py-2 px-4 rounded bg-blue-500 text-white hover:bg-blue-600 transition hover:cursor-pointer"
              onClick={() => {
               setDialogDate(new Date());
               setShowDialog(true);
               setError("");
              }}
            >
              Add an event for today
            </button>
            <button
              className="py-2 px-4 rounded bg-green-500 text-white hover:bg-green-600 transition hover:cursor-pointer"
              onClick={() => setCurrentMonth(new Date())}
           >
             Go to Today
            </button>
            <button
              className="py-2 px-4 rounded bg-gray-400 text-white hover:bg-gray-500 transition hover:cursor-pointer mt-auto"
              onClick={() => setShowSidebar(false)}
            >
              Close Menu
            </button>
          </div>
        )}
        <div className="flex flex-col md:flex-row">
          <div className="table">
            {renderHeader()}
            {renderDays()}
          </div>
          <div className="flex flex-col text-center sm:my-10 md:mt-0 sm:ml-4 md:ml-20 md:mr-0 sm:mr-4 text-black">
            <h2 className="text-2xl text-black font-garamond underline">Events for this month</h2>
            {renderSelectedMonthEvents()}
            <h2 className="text-xl mt-4 mb-2 underline text-black font-garamond">
              Events for {selectedDate ? format((selectedDate), "dd-MM-yyyy") : ""}
            </h2>
            {renderSelectedDateEvents()}
          </div>
        </div>
      </div>
    </>
  );
};
export default Calendar;