import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import toast from 'react-hot-toast';

const BookingModal = ({
  skillTitle,
  instructorName,
  skill,
  instructor,
  student,
  onClose,
  onConfirm,
}) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!date || !time || !duration) {
      setError("Please select a Date, Time, and Duration.");
      return;
    }

    const sessionDateTime = new Date(`${date}T${time}`);
    if (isNaN(sessionDateTime) || sessionDateTime < new Date()) {
      setError("Please select a valid future time.");
      return;
    }

    // ✅ Pass correct field names expected by backend
    onConfirm({
      skill: skill,
      instructor: instructor,
      student: student,
      date: sessionDateTime.toISOString(),
      duration: parseInt(duration),
      notes,
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-xl p-8 w-full max-w-lg shadow-2xl">
        <div className="flex justify-between items-center mb-6 border-b pb-3">
          <h2 className="text-2xl font-bold text-gray-900">
            Book Session: {skillTitle}
          </h2>
          <button onClick={onClose}>
            <X className="text-gray-500" />
          </button>
        </div>

        <p className="text-gray-700 mb-4">
          Instructor:{" "}
          <span className="font-semibold text-indigo-600">
            {instructorName || "Unknown Instructor"}
          </span>
        </p>

        {error && (
          <p className="bg-red-100 text-red-700 p-2 rounded mb-4">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">Duration (minutes)</label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
            >
              <option value="30">30</option>
              <option value="45">45</option>
              <option value="60">60</option>
              <option value="90">90</option>
              <option value="120">120</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">Notes (optional)</label>
            <textarea
              rows="3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border rounded p-2 w-full focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 rounded hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg"
          >
            Confirm Booking
          </button>
        </form>
      </div>
    </div>
  );
};

export default function BookingSessionPage() {
  const [skillDetails, setSkillDetails] = useState({});
  const [studentId, setStudentId] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [blockedOwnBooking, setBlockedOwnBooking] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const skill = params.get("skillId");
    const instructor = params.get("instructorId");
    const skillTitle = params.get("skillTitle");
    const instructorName = params.get("instructorName");

    if (skill && instructor) {
      setSkillDetails({
        title: decodeURIComponent(skillTitle || ""),
        instructorName: decodeURIComponent(instructorName || ""),
        skill,
        instructor,
      });
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setLoading(false);
      return;
    }

    fetch("http://localhost:5000/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const userId = data.user?._id || data.user?.id;
        if (data.success && userId) {
          setStudentId(userId);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Prevent booking if the user is trying to book their own skill
  useEffect(() => {
    if (studentId && skillDetails?.instructor) {
      if (studentId.toString() === skillDetails.instructor.toString()) {
        setBlockedOwnBooking(true);
        setIsModalVisible(false);
        try {
          toast.error("You can't book a session for your own skill.");
        } catch {}
      }
    }
  }, [studentId, skillDetails]);

  const handleBookingConfirm = async (bookingData) => {
    try {
      const token = localStorage.getItem("token");

      // ✅ Ensure all fields are present
      if (
        !bookingData.skill ||
        !bookingData.instructor ||
        !bookingData.student
      ) {
        toast.error("Booking failed: Missing instructor, skill, or student details.");
        return;
      }

      const res = await fetch("http://localhost:5000/api/booking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(bookingData),
      });

      const result = await res.json();
      if (res.ok) {
        toast.success("Request sent successfully!");
        setIsModalVisible(false);
      } else {
        toast.error("Booking failed: " + (result.message || "Unknown error"));
      }
    } catch (err) {
      toast.error("An unexpected error occurred. Please try again.");
    }
  };

  if (loading) return <p className="text-center p-10">Loading...</p>;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      {isModalVisible && !blockedOwnBooking && (
        <BookingModal
          skillTitle={skillDetails.title}
          instructorName={skillDetails.instructorName}
          skill={skillDetails.skill}
          instructor={skillDetails.instructor}
          student={studentId}
          onClose={() => setIsModalVisible(false)}
          onConfirm={handleBookingConfirm}
        />
      )}
      {!isModalVisible && !blockedOwnBooking && (
        <div className="bg-white p-10 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-indigo-600">
            Request Sent
          </h2>
          <p className="text-gray-600 mt-2">
            The instructor has been notified of your request.
          </p>
          <button
            className="mt-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 px-4 rounded hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg"
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
        </div>
      )}
      {blockedOwnBooking && (
        <div className="bg-white p-10 rounded-lg shadow-md text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600">Action not allowed</h2>
          <p className="text-gray-600 mt-2">You can’t book a session for a skill you posted.</p>
          <button
            className="mt-4 bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-700 shadow"
            onClick={() => window.history.back()}
          >
            Go Back
          </button>
        </div>
      )}
    </div>
  );
}