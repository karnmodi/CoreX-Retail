// src/components/NotificationHeader.jsx
import React, { useState, useRef, useEffect } from "react";
import { useNotification } from "../configs/notificationsContext";
import { Link } from "react-router-dom";
import { 
  Bell, 
  Package, 
  Users, 
  Calendar, 
  DollarSign, 
  Settings, 
  ShoppingBag,
  XCircle, 
  CheckCircle,
  AlertTriangle,
  ExternalLink
} from "lucide-react";

const NotificationHeader = () => {
  const { notifications, unreadCount, markAsRead, removeNotification } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const recentNotifications = notifications
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get notification icon based on type
  const getNotificationIcon = (type, priority) => {
    const iconProps = { 
      size: 18, 
      className: priority === "high" ? "text-red-500" : "text-blue-500" 
    };

    switch (type) {
      case "inventory":
        return <Package {...iconProps} />;
      case "staff":
        return <Users {...iconProps} />;
      case "roster":
        return <Calendar {...iconProps} />;
      case "sales":
        return <DollarSign {...iconProps} />;
      case "system":
        return <Settings {...iconProps} />;
      case "order":
        return <ShoppingBag {...iconProps} />;
      case "admin":
        return <Users {...iconProps} />;
      default:
        return <Bell {...iconProps} />;
    }
  };

  // Handle marking a notification as read
  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    await markAsRead(id);
  };

  // Handle removing a notification
  const handleRemoveNotification = async (id, e) => {
    e.stopPropagation();
    await removeNotification(id);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative text-gray-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-full"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right--1 inline-flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-red-500 rounded-full">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-lg z-10 overflow-hidden border border-gray-100">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center rounded-t-xl">
            <h3 className="text-sm font-medium text-gray-700">Recent Notifications</h3>
            <Link
              to="./more/notifications"
              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
              onClick={() => setIsOpen(false)}
            >
              View All
            </Link>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="py-8 px-4 text-center text-gray-500">
                <Bell size={32} className="mx-auto mb-3 text-gray-300" />
                <p>No notifications yet</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {recentNotifications.map((notification) => (
                  <li key={notification.id} className={`p-4 hover:bg-gray-50 ${!notification.read ? "bg-blue-50" : ""}`}>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 pt-0.5 bg-gray-50 p-1.5 rounded-lg">
                        {getNotificationIcon(notification.type, notification.priority)}
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate max-w-[180px]">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500">{notification.time}</p>
                        </div>
                        <p className="text-xs text-gray-500 truncate max-w-[250px] mt-0.5">{notification.message}</p>
                        
                        <div className="mt-2 flex space-x-2">
                          {!notification.read && (
                            <button
                              onClick={(e) => handleMarkAsRead(notification.id, e)}
                              className="text-xs flex items-center text-blue-600 hover:text-blue-800"
                            >
                              <CheckCircle size={12} className="mr-1" />
                              Mark read
                            </button>
                          )}
                          <button
                            onClick={(e) => handleRemoveNotification(notification.id, e)}
                            className="text-xs flex items-center text-gray-600 hover:text-gray-800"
                          >
                            <XCircle size={12} className="mr-1" />
                            Remove
                          </button>
                          
                          {notification.action && notification.action.type === "link" && (
                            <Link
                              to={notification.action.destination}
                              className="text-xs flex items-center ml-auto text-blue-600 hover:text-blue-800"
                              onClick={() => {
                                setIsOpen(false);
                                if (!notification.read) markAsRead(notification.id);
                              }}
                            >
                              {notification.action.label || "View"} <ExternalLink size={10} className="ml-1" />
                            </Link>
                          )}
                        </div>
                        
                        {notification.priority === "high" && (
                          <div className="mt-1 flex items-center">
                            <AlertTriangle size={12} className="text-red-500 mr-1" />
                            <span className="text-xs text-red-500">High priority</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-center rounded-b-xl">
            <Link
              to="./more/notifications"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              onClick={() => setIsOpen(false)}
            >
              See all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationHeader;