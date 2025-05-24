import "tailwindcss";
import React, { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay } from "date-fns";
import { db, auth } from "./firebase";
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import leftArrow from "./left-arrow.png";
import rightArrow from "./right-arrow.png";

type Event = {
  id?: string;
  date: string;
  title: string;
  uid: string;
};

const months = Array.from({ length: 12 }, (_, i) => format(new Date(2000, i), "MMMM"));
const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - 25 + i);

const Calendar: React.FC = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogDate, setDialogDate] = useState<Date | null>(null);
  const [eventTitle, setEventTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleYearChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCurrentMonth(new Date(parseInt(e.target.value), currentMonth.getMonth(), 1));
  };

  const handleMonthChange = (month: string) => {
    const newMonthIndex = months.indexOf(month);
    setCurrentMonth(new Date(currentMonth.getFullYear(), newMonthIndex, 1));
  };

  const handleDateClick = (day: Date) => {
    setDialogDate(day);
    setSelectedDate(day);
    setShowDialog(true);
  };

  useEffect(() => {
    const fetchEvents = async () => {
      if (!auth.currentUser) return;
      const q = query(collection(db, "events"), where("uid", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
      const loadedEvents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Event[];
      setEvents(loadedEvents);
    };
    fetchEvents();
  }, [showDialog]);

  useEffect(() => {
    document.body.style.overflow = showDialog ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [showDialog]);

  const sendEventNotification = async (eventData: { eventTitle: string; userEmail: string; eventDate: string }) => {
    try {
      const webhookUrl = "https://pumped-sincerely-coyote.ngrok-free.app/webhook/send-reminder";
      
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true" // Add this header for ngrok
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      console.log("Event notification sent successfully");
      return true;
    } catch (error) {
      console.error("Failed to send event notification:", error);
      // You might want to show a user notification here
      return false;
    }
  };

  const handleAddEvent = async () => {
    if (!eventTitle.trim() || !dialogDate || !auth.currentUser) return;

    setIsSubmitting(true);

    try {
      const normalizedDate = new Date(dialogDate.getFullYear(), dialogDate.getMonth(), dialogDate.getDate());
      const formattedDate = format(normalizedDate, "dd-MM-yyyy");
      const newEvent = {
        date: formattedDate,
        title: eventTitle.trim(),
        uid: auth.currentUser.uid,
      };

      // Save to Firebase
      const docRef = await addDoc(collection(db, "events"), newEvent);
      setEvents(prev => [...prev, { ...newEvent, id: docRef.id }]);

      // Send notification via webhook
      const eventData = {
        eventTitle: newEvent.title,
        userEmail: auth.currentUser.email || "",
        eventDate: formattedDate
      };

      await sendEventNotification(eventData);

      // Reset form
      setShowDialog(false);
      setEventTitle("");
      setDialogDate(null);
    } catch (error) {
      console.error("Error adding event:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (eventToDelete: Event) => {
    setEvents(prev => prev.filter(event => event.id !== eventToDelete.id));
    if (eventToDelete.id) {
      await deleteDoc(doc(db, "events", eventToDelete.id));
    }
  };

  const renderHeader = () => (
    <div className="flex-row border-2 bg-gradient-to-bl border-black text-black text-lg font-semibold">
      <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
        <img src={leftArrow} alt="Previous" className="w-6.5 h-6.5 p-0.5 hover:bg-gray-300 hover:border-2 rounded" />
      </button>
      <select onChange={e => handleMonthChange(e.target.value)} value={format(currentMonth, "MMMM")} className="hover:cursor-pointer w-25 text-center mb-1 hover:bg-white hover:border-2 rounded-xl">
        {months.map(month => <option key={month} value={month}>{month}</option>)}
      </select>
      <select onChange={handleYearChange} value={format(currentMonth, "yyyy")} className="hover:cursor-pointer w-30 text-center mb-1 hover:bg-white hover:border-2 rounded-xl">
        {years.map(year => <option key={year} value={year}>{year}</option>)}
      </select>
      <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
        <img src={rightArrow} alt="Next" className="w-6.5 h-6.5 p-0.5 hover:bg-gray-300 hover:border-2 rounded" />
      </button>
    </div>
  );

  const renderDays = () => {
    const days = [];
    days.push(
      <div className="flex flex-row justify-evenly text-black text-lg">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => <div key={day}>{day}</div>)}
      </div>
    );

    const startDate = startOfWeek(startOfMonth(currentMonth));
    const endDate = endOfWeek(endOfMonth(currentMonth));
    let day = startDate;

    while (day <= endDate) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        const currentDay = day;
        week.push(
          <div
            key={currentDay.toString()}
            className={`flex p-4 justify-evenly bg-amber-100 border-2 border-black rounded-sm w-20 h-16 hover:shadow-xl hover:shadow-amber-700 hover:bg-amber-400 transition duration-200 ${!isSameMonth(day, currentMonth) ? "text-gray-400" : ""} ${isSameDay(currentDay, new Date()) ? "bg-red-500 hover:bg-red-600 hover:shadow-xl hover:shadow-red-700 transition duration-200" : ""}`}
            onClick={() => handleDateClick(currentDay)}
          >
            <div>{format(currentDay, "dd")}</div>
          </div>
        );
        day = addDays(day, 1);
      }
      days.push(<div className="flex p-5 justify-evenly bg-yellow-600 text-black border-3 rounded-lg border-black w-170" key={day.toString()}>{week}</div>);
    }

    return <div className="calendar">{days}</div>;
  };

  const dialogBox = showDialog && (
    <div className="fixed inset-0 flex backdrop-blur-sm items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl text-black flex flex-col gap-6 ml-10 mb-10 h-50 w-100">
        <h3 className="text-lg font-bold">Add Event</h3>
        <input
          className="border p-2 rounded"
          type="text"
          placeholder="Event title"
          value={eventTitle}
          onChange={(e) => setEventTitle(e.target.value)}
          autoFocus
          disabled={isSubmitting}
        />
        <div className="flex gap-2 justify-end">
          <button 
            className="px-4 py-1 rounded text-white bg-gray-400 hover:bg-gray-500 disabled:opacity-50" 
            onClick={() => { setShowDialog(false); setEventTitle(""); setDialogDate(null); }}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button 
            className="px-4 py-1 rounded text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50" 
            onClick={handleAddEvent}
            disabled={isSubmitting || !eventTitle.trim()}
          >
            {isSubmitting ? "Adding..." : "Add"}
          </button>
        </div>
      </div>
    </div>
  );

  const renderSelectedDateEvents = () => {
    if (!selectedDate) return <p>Select a date to view its events.</p>;
    const formattedDate = format(selectedDate, "dd-MM-yyyy");
    const selectedDateEvents = events.filter(e => e.date === formattedDate);
    if (selectedDateEvents.length === 0) return <p>No events for {formattedDate}.</p>;

    return (
      <ul>
        {selectedDateEvents.map((e, i) => (
          <li key={i} className="event-items">
            {formattedDate}: {e.title}
            <button onClick={() => handleDeleteEvent(e)} className="hover:bg-red-600 hover:shadow-red-700 hover:shadow-lg transition duration-300 rounded font-normal ml-1">❌</button>
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
        return new Date(`${aYear}-${aMonth}-${aDay}`).getTime() - new Date(`${bYear}-${bMonth}-${bDay}`).getTime();
      });

    if (monthEvents.length === 0) return <p>No events for this Month</p>;

    return (
      <ul>
        {monthEvents.map((e, i) => (
          <li key={e.id || i} className="event-items">
            {e.date}: {e.title}
            <button onClick={() => handleDeleteEvent(e)} className="hover:bg-red-600 hover:shadow-red-700 hover:shadow-lg transition duration-300 rounded ml-1 font-normal">❌</button>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <>
      {dialogBox}
      <div className="flex flex-row">
        <div className="table">
          {renderHeader()}
          {renderDays()}
        </div>
        <div className="flex flex-col text-center ml-20 text-black font-medium">
          <h2 className="text-2xl font-bold underline">Events for this month</h2>
          {renderSelectedMonthEvents()}
          <h2 className="text-xl mt-4 underline font-bold">Events for {selectedDate ? format(selectedDate, "dd-MM-yyyy") : ""}</h2>
          {renderSelectedDateEvents()}
        </div>
      </div>
    </>
  );
};

export default Calendar;