import { useEffect, useState } from "react";
import { auth, firestore } from "../firebase";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { format } from "date-fns";

interface Event {
  id: string;
  title: string;
  date: string;
  email: string;
}

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [events, setEvents] = useState<Event[]>([]);
  const [title, setTitle] = useState("");

  const fetchEvents = async () => {
    const user = auth.currentUser;
    if (!user || !user.email) return;

    try {
      const eventsRef = collection(firestore, "events");
      const q = query(eventsRef, where("email", "==", user.email));
      const snapshot = await getDocs(q);
      const eventsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Event, "id">),
      }));
      setEvents(eventsData);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const sendReminder = async (date: string) => {
    try {
      const response = await fetch(
        "https://pumped-sincerely-coyote.ngrok-free.app/webhook/send-reminder",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ date }),
        }
      );

      if (!response.ok) {
        throw new Error(`Webhook error: ${response.status}`);
      }

      console.log("Reminder sent for", date);
    } catch (err) {
      console.error("Error sending reminder:", err);
    }
  };

  const handleDateClick = async (date: string) => {
    setSelectedDate(date);
    await sendReminder(date);
  };

  const handleAddEvent = async () => {
    const user = auth.currentUser;
    if (!user || !user.email || !selectedDate || !title.trim()) return;

    try {
      await addDoc(collection(firestore, "events"), {
        title: title.trim(),
        date: selectedDate,
        email: user.email,
      });

      setTitle("");
      await fetchEvents();
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteDoc(doc(firestore, "events", id));
      await fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const today = new Date();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const days: string[] = [];

  for (let i = 1; i <= monthEnd.getDate(); i++) {
    const date = format(new Date(today.getFullYear(), today.getMonth(), i), "yyyy-MM-dd");
    days.push(date);
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Calendar</h1>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {days.map((date) => (
          <button
            key={date}
            className={`border p-2 rounded ${
              selectedDate === date ? "bg-blue-200" : "hover:bg-gray-100"
            }`}
            onClick={() => handleDateClick(date)}
          >
            {format(new Date(date), "d")}
          </button>
        ))}
      </div>

      {selectedDate && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Add Event for {selectedDate}</h2>
          <input
            type="text"
            placeholder="Event Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border p-2 mr-2 rounded"
          />
          <button
            onClick={handleAddEvent}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add Event
          </button>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold mb-2">Your Events</h2>
        <ul>
          {events.map((event) => (
            <li key={event.id} className="mb-2">
              <span className="font-medium">{event.title}</span> on{" "}
              <span className="text-gray-600">{event.date}</span>
              <button
                onClick={() => handleDeleteEvent(event.id)}
                className="ml-4 text-red-500 hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
