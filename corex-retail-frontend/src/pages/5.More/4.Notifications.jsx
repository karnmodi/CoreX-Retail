// src/pages/NotificationsPage.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNotification } from "../../configs/notificationsContext";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Search,
  Package,
  Users,
  Calendar,
  Settings,
  ShoppingBag,
  Filter,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  XCircle,
  ChevronRight,
  ExternalLink,
  MessageCircle,
  PoundSterling,
  PlusCircle,
} from "lucide-react";
import CreateNotificationPopup from "../../components/NotificationPopUp";
import { useAuth } from "../../configs/AuthContext";

const NotificationsPage = () => {
  const {
    notifications,
    loading,
    error,
    lastRefreshed,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    removeNotification,
  } = useNotification();
  const { userData } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [showCreatePopup, setShowCreatePopup] = useState(false);
  const navigate = useNavigate();

  // Check if user can create notifications
  const canCreateNotifications =
    userData?.role === "admin" ||
    userData?.role === "Administrator" ||
    userData?.role === "administrator" ||
    userData?.role === "store manager" ||
    userData?.role === "Store Manager" ||
    userData?.role === "manager";

  // Handle refresh
  const handleRefresh = () => {
    fetchNotifications();
  };

  const handleMarkAsRead = async (id) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  // Function to handle removing a notification
  const handleRemoveNotification = async (id) => {
    await removeNotification(id);
  };

  // Function to handle notification action
  const handleAction = (action) => {
    if (!action) return;

    if (action.type === "link" && action.destination) {
      navigate(action.destination);
    }
  };

  // Handle opening create notification popup
  const handleOpenCreatePopup = () => {
    setShowCreatePopup(true);
  };

  // Handle closing create notification popup
  const handleCloseCreatePopup = () => {
    setShowCreatePopup(false);
  };

  // Handle successful notification creation
  const handleNotificationCreated = () => {
    fetchNotifications();
  };

  // Get icon component based on notification type
  const getNotificationIcon = (type, priority) => {
    const iconProps = {
      size: 22,
      className: `${priority === "high" ? "text-red-500" : "text-blue-500"}`,
    };

    switch (type) {
      case "inventory":
        return <Package {...iconProps} />;
      case "staff":
        return <Users {...iconProps} />;
      case "roster":
        return <Calendar {...iconProps} />;
      case "sales":
        return <PoundSterling {...iconProps} />;
      case "system":
        return <Settings {...iconProps} />;
      case "order":
        return <ShoppingBag {...iconProps} />;
      case "admin":
        return <Users {...iconProps} />;
      case "store manager":
        return <Users {...iconProps} />;
      default:
        return <Bell {...iconProps} />;
    }
  };

  // Filter notifications based on search term and filters
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      // Search term filter
      const matchesSearch =
        searchTerm === "" ||
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase());

      // Type filter
      const matchesType =
        selectedType === "all" || notification.type === selectedType;

      // Priority filter
      const matchesPriority =
        selectedPriority === "all" ||
        notification.priority === selectedPriority;

      return matchesSearch && matchesType && matchesPriority;
    });
  }, [notifications, searchTerm, selectedType, selectedPriority]);

  const notificationTypes = useMemo(() => {
    const types = new Set(
      notifications.map((notification) => notification.type)
    );
    return ["all", ...Array.from(types)];
  }, [notifications]);

  const notificationPriorities = useMemo(() => {
    const priorities = new Set(
      notifications.map((notification) => notification.priority)
    );
    return ["all", ...Array.from(priorities)];
  }, [notifications]);

  return (
    <div className="w-full px-4 py-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div className="flex items-center">
            <Bell size={28} className="text-blue-600 mr-3" />
            <div>
              <h1 className="text-2xl font-bold mb-1">Notifications</h1>
              <p className="text-gray-500 text-sm">
                {lastRefreshed
                  ? `Last updated: ${new Date(lastRefreshed).toLocaleString()}`
                  : "Manage your alerts and updates"}
              </p>
            </div>
          </div>
          <div className="flex mt-4 md:mt-0 space-x-3">
            {canCreateNotifications && (
              <button
                onClick={handleOpenCreatePopup}
                className="flex items-center px-4 py-2 text-sm bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors shadow-sm"
              >
                <PlusCircle size={16} className="mr-2" />
                Create Notification
              </button>
            )}
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors shadow-sm"
            >
              <CheckCircle size={16} className="mr-2" />
              Mark all as read
            </button>
            <button
              onClick={handleRefresh}
              className="flex items-center px-4 py-2 text-sm bg-gray-100 rounded-full hover:bg-gray-200 transition-colors shadow-sm"
              disabled={loading}
            >
              <RefreshCw
                size={16}
                className={`mr-2 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 bg-white rounded-xl shadow-md p-4 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search notifications..."
                className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="flex gap-3">
              <div className="relative">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="pl-9 pr-10 py-2.5 appearance-none border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {notificationTypes.map((type) => (
                    <option key={type} value={type}>
                      {type === "all"
                        ? "All Types"
                        : type === "store manager"
                        ? "Store Manager"
                        : type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <Filter size={16} className="text-gray-400" />
                </div>
              </div>

              <div className="relative">
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="pl-9 pr-10 py-2.5 appearance-none border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {notificationPriorities.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority === "all"
                        ? "All Priorities"
                        : priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                  <AlertTriangle size={16} className="text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-xl shadow-md">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 p-6 rounded-xl shadow-md mb-6 border border-red-100">
            <p className="font-semibold text-lg mb-2">
              Error loading notifications
            </p>
            <p>{error}</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md text-center p-12 border border-gray-100">
            <Bell size={56} className="mx-auto text-gray-300 mb-5" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">
              No notifications found
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {searchTerm ||
              selectedType !== "all" ||
              selectedPriority !== "all"
                ? "Try adjusting your search or filters to see more results."
                : "You're all caught up! Check back later for new notifications."}
            </p>
            {canCreateNotifications && (
              <button
                onClick={handleOpenCreatePopup}
                className="mt-6 flex items-center px-4 py-2 text-sm bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors shadow-sm mx-auto"
              >
                <PlusCircle size={16} className="mr-2" />
                Create a notification
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <ul className="divide-y divide-gray-200">
              {filteredNotifications.map((notification) => (
                <li
                  key={notification.id}
                  className={`p-5 hover:bg-gray-50 transition-colors ${
                    !notification.read
                      ? "bg-blue-50 border-l-4 border-blue-500"
                      : ""
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 p-2 bg-gray-50 rounded-lg mr-2">
                      {getNotificationIcon(
                        notification.type,
                        notification.priority
                      )}
                    </div>
                    <div className="ml-2 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <h3
                          className={`text-base font-medium ${
                            !notification.read
                              ? "text-blue-800"
                              : "text-gray-800"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        <span className="text-xs text-gray-500 mt-1 sm:mt-0 flex items-center">
                          <Clock size={12} className="mr-1" />
                          {notification.time}
                        </span>
                      </div>

                      <p className="mt-1.5 text-sm text-gray-600">
                        {notification.message}
                      </p>

                      {notification.createdBy && (
                        <div className="mt-1 text-xs text-gray-500">
                          From: {notification.createdBy}
                        </div>
                      )}

                      {/* Notification details if available */}
                      {notification.details && (
                        <div className="mt-3 bg-gray-50 rounded-lg p-3 text-sm border border-gray-200">
                          {Array.isArray(notification.details) ? (
                            <ul className="space-y-2">
                              {notification.details.map((detail, index) => (
                                <li
                                  key={index}
                                  className="flex flex-col sm:flex-row sm:justify-between border-b border-gray-100 pb-2 last:border-0 last:pb-0"
                                >
                                  <span className="font-medium">
                                    {detail.productName}
                                  </span>
                                  <span className="mt-1 sm:mt-0">
                                    Stock:{" "}
                                    <span
                                      className={
                                        detail.currentStock <
                                        detail.reorderPoint
                                          ? "text-red-600 font-bold"
                                          : ""
                                      }
                                    >
                                      {detail.currentStock}
                                    </span>
                                    {detail.reorderPoint &&
                                      ` (Reorder at: ${detail.reorderPoint})`}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p>{JSON.stringify(notification.details)}</p>
                          )}
                        </div>
                      )}

                      <div className="mt-3 flex flex-wrap justify-between items-center">
                        <div className="space-x-2 mb-2 sm:mb-0">
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="text-xs px-3 py-1.5 bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200 transition-colors"
                            >
                              <CheckCircle size={12} className="inline mr-1" />
                              Mark as read
                            </button>
                          )}
                          <button
                            onClick={() =>
                              handleRemoveNotification(notification.id)
                            }
                            className="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
                          >
                            <XCircle size={12} className="inline mr-1" /> Remove
                          </button>
                          
                        </div>

                        {notification.action && (
                          <button
                            onClick={() => handleAction(notification.action)}
                            className={`flex items-center text-sm px-4 py-1.5 rounded-full ${
                              notification.priority === "high"
                                ? "bg-red-100 text-red-600 hover:bg-red-200"
                                : "bg-blue-100 text-blue-600 hover:bg-blue-200"
                            } transition-colors shadow-sm`}
                          >
                            {notification.action.label || "View"}
                            <ExternalLink size={14} className="ml-1.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Create Notification Popup */}
      <CreateNotificationPopup
        isOpen={showCreatePopup}
        onClose={handleCloseCreatePopup}
        onSuccess={handleNotificationCreated}
      />
    </div>
  );
};

export default NotificationsPage;
