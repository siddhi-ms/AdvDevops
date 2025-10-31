import React from 'react';
import { X } from 'lucide-react';

const Notification = ({ notifications, onClose }) => {
  const hasNotifications = notifications && notifications.length > 0;

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 animate-dropdown">
      <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <p className="font-semibold text-gray-900">Notifications</p>
        <button 
          onClick={onClose} 
          className="text-gray-400 hover:text-gray-600 p-1 rounded-full"
          aria-label="Close notifications"
        >
          <X size={18} />
        </button>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {hasNotifications ? (
          notifications.map(notif => {
            if (notif.type === 'student') {
              const skillName = notif.skill?.name ?? 'an unknown skill';
              const instructorName = notif.instructor?.name ?? 'an unknown instructor';
              return (
                <div key={notif._id} className="px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                  {notif.status === 'confirmed' ? (
                      <p className="text-sm text-gray-800">
                          Your session for <span className="font-semibold text-sky-600">{skillName}</span> with <span className="font-semibold">{instructorName}</span> is confirmed for <span className="font-semibold">{new Date(notif.date).toLocaleString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>.
                      </p>
                  ) : ( // cancelled
                      <p className="text-sm text-gray-800">
                          Your booking for <span className="font-semibold text-sky-600">{skillName}</span> with <span className="font-semibold">{instructorName}</span> for <span className="font-semibold">{new Date(notif.date).toLocaleString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span> has been <span className="font-bold text-red-600">cancelled</span>.
                      </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                      {new Date(notif.updatedAt).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              )
            } else if (notif.type === 'instructor') {
              const skillName = notif.skill?.name ?? 'an unknown skill';
              const studentName = notif.student?.name ?? 'an unknown student';
              return (
                <div key={notif._id} className="px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                    <p className="text-sm text-gray-800">
                        You have a new booking request from <span className="font-semibold">{studentName}</span> for <span className="font-semibold text-sky-600">{skillName}</span>.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                        {new Date(notif.createdAt).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
              )
            }
            return null;
          })
        ) : (
          <div className="p-6 text-center text-gray-500">
            <p>You have no new notifications.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notification;
