// src/components/CreateNotificationPopup.jsx
import React, { useState, useEffect } from "react";
import {
  X,
  Send,
  Users,
  AlertTriangle,
  Bell,
  Package,
  Calendar,
  PoundSterling,
  Settings,
  ShoppingBag,
} from "lucide-react";
import { useStaff } from "../configs/StaffContext";
import { useAuth } from "../configs/AuthContext";
import { useToast } from "../components/ui/use-toast";
import { createNotification, getUserRoles } from "../services/notificationsAPI";

const CreateNotificationPopup = ({ isOpen, onClose, onSuccess }) => {
  const { toast } = useToast();
  const { staff } = useStaff();
  const { token, userData } = useAuth();

  const [roles, setRoles] = useState([
    { id: "all", name: "All Users" },
    { id: "admin", name: "Administrators" },
    { id: "store manager", name: "Store Managers" },
    { id: "staff", name: "Staff Members" },
  ]);

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    priority: "medium",
    targetRole: "all",
    targetUsers: [],
    sendPush: false,
    action: {
      type: "none",
      destination: "",
      label: "View Details",
    },
    expiresAt: null,
  });

  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSpecificUsers, setShowSpecificUsers] = useState(false);

  // Fetch available roles when popup opens
  useEffect(() => {
    if (isOpen && token) {
      fetchRoles();
    }
  }, [isOpen, token]);

  // Reset form when popup is opened
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: "",
        message: "",
        priority: "medium",
        targetRole: "all",
        targetUsers: [],
        sendPush: false,
        action: {
          type: "none",
          destination: "",
          label: "View Details",
        },
        expiresAt: null,
      });
      setShowSpecificUsers(false);
    }
  }, [isOpen]);

  // Fetch available roles for targeting
  const fetchRoles = async () => {
    setIsLoadingRoles(true);
    try {
      const rolesData = await getUserRoles(token);
      if (rolesData && rolesData.length > 0) {
        setRoles(rolesData);
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
    } finally {
      setIsLoadingRoles(false);
    }
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (type === "checkbox") {
      setFormData({
        ...formData,
        [name]: checked,
      });
      return;
    }

    if (name.includes(".")) {
      // Handle nested properties (e.g. action.type)
      const [parent, child] = name.split(".");
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });

      // If targetRole changes to specific
      if (name === "targetRole") {
        setShowSpecificUsers(value === "specific");
        if (value !== "specific") {
          setFormData((prev) => ({
            ...prev,
            targetUsers: [],
          }));
        }
      }
    }
  };

  const handleUserToggle = (userId) => {
    setFormData((prev) => {
      const isSelected = prev.targetUsers.includes(userId);
      let newTargetUsers;

      if (isSelected) {
        newTargetUsers = prev.targetUsers.filter((id) => id !== userId);
      } else {
        newTargetUsers = [...prev.targetUsers, userId];
      }

      return {
        ...prev,
        targetUsers: newTargetUsers,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form
      if (!formData.title.trim()) {
        throw new Error("Title is required");
      }

      if (!formData.message.trim()) {
        throw new Error("Message is required");
      }

      if (showSpecificUsers && formData.targetUsers.length === 0) {
        throw new Error("Please select at least one user");
      }

      // Prepare notification data exactly as expected by the backend
      const notificationData = {
        title: formData.title,
        message: formData.message,
        priority: formData.priority,
        // Be explicit about targetRole
        targetRole: showSpecificUsers ? "specific" : formData.targetRole,
        sendPush: formData.sendPush,
        // Always include targetUsers array - it will be empty if not specifically selecting users
        targetUsers: showSpecificUsers ? formData.targetUsers : [],
      };

      // Add expiry date if specified
      if (formData.expiresAt) {
        notificationData.expiresAt = formData.expiresAt;
      }

      // Add action if specified and not 'none'
      if (formData.action.type !== "none") {
        notificationData.action = {
          type: formData.action.type,
          destination: formData.action.destination,
          label: formData.action.label,
        };
      }

      console.log("Submitting notification:", notificationData); // Debug log

      // Send notification to API
      await createNotification(token, notificationData);

      toast({
        title: "Success!",
        description: "Notification created and sent successfully",
        variant: "success",
      });

      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (error) {
      console.error("Error creating notification:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create notification",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if user has permission to create notifications
  const canCreateNotifications =
    userData?.role === "admin" ||
    userData?.role === "store manager" ||
    userData?.role === "Store Manager";

  // Get icon for notification priority
  const getPriorityIcon = (priority) => {
    return (
      <AlertTriangle
        size={20}
        className={`${
          priority === "high"
            ? "text-red-500"
            : priority === "low"
            ? "text-green-500"
            : "text-orange-400"
        }`}
      />
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Bell className="mr-2" />
            <h2 className="text-xl font-semibold">Create New Notification</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-blue-700 rounded-full p-1"
          >
            <X size={20} />
          </button>
        </div>

        {!canCreateNotifications ? (
          <div className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Permission Required</h3>
            <p className="text-gray-600 mb-4">
              Only administrators and store managers can create notifications.
              Please contact your administrator for assistance.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="p-6 overflow-y-auto flex-grow"
            >
              <div className="space-y-6">
                {/* Notification Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="title"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Notification title"
                        className="px-4 py-2.5 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <div className="relative">
                        <select
                          name="priority"
                          value={formData.priority}
                          onChange={handleChange}
                          className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          {getPriorityIcon(formData.priority)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Message <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Enter notification message"
                      rows={3}
                      className="px-4 py-2.5 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-md font-medium mb-3">Send To</h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Audience
                      </label>
                      <div className="relative">
                        <select
                          name="targetRole"
                          value={formData.targetRole}
                          onChange={handleChange}
                          className="pl-10 pr-4 py-2.5 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          disabled={showSpecificUsers}
                        >
                          {roles.map((role) => (
                            <option key={role.id} value={role.id}>
                              {role.name}
                            </option>
                          ))}
                          <option value="specific">Specific Users</option>
                        </select>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                          <Users size={20} />
                        </div>
                      </div>
                    </div>

                    {/* Checkbox for specific users */}
                    <div className="flex items-center space-x-2">
                      <input
                        id="specific-users"
                        type="checkbox"
                        checked={showSpecificUsers}
                        onChange={(e) => {
                          setShowSpecificUsers(e.target.checked);
                          if (!e.target.checked) {
                            setFormData((prev) => ({
                              ...prev,
                              targetUsers: [],
                              targetRole: "all",
                            }));
                          } else {
                            setFormData((prev) => ({
                              ...prev,
                              targetRole: "specific",
                            }));
                          }
                        }}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor="specific-users"
                        className="text-sm text-gray-700"
                      >
                        Select specific users
                      </label>
                    </div>

                    {/* Staff list if "Select Specific Users" is chosen */}
                    {showSpecificUsers && (
                      <div className="mt-2 border border-gray-200 rounded-lg p-4 max-h-40 overflow-y-auto">
                        {staff.length === 0 ? (
                          <p className="text-gray-500 text-sm">
                            No staff members found
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {staff.map((member) => (
                              <div
                                key={member.id}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  id={`user-${member.id}`}
                                  type="checkbox"
                                  checked={formData.targetUsers.includes(
                                    member.id
                                  )}
                                  onChange={() => handleUserToggle(member.id)}
                                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label
                                  htmlFor={`user-${member.id}`}
                                  className="text-sm text-gray-700 flex items-center truncate"
                                >
                                  {member.profileImage && (
                                    <img
                                      src={member.profileImage}
                                      alt={member.name}
                                      className="w-6 h-6 rounded-full mr-2 object-cover"
                                    />
                                  )}
                                  <span className="truncate">
                                    {member.firstName && member.lastName
                                      ? `${member.firstName} ${member.lastName}`
                                      : member.name ||
                                        member.email ||
                                        "Unknown"}
                                  </span>
                                </label>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action (Optional) */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-md font-medium mb-3">
                    Action (Optional)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Action Type
                      </label>
                      <select
                        name="action.type"
                        value={formData.action.type}
                        onChange={handleChange}
                        className="px-4 py-2.5 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="none">No Action</option>
                        <option value="link">Link to Page</option>
                      </select>
                    </div>

                    {formData.action.type !== "none" && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Destination Path
                          </label>
                          <input
                            type="text"
                            name="action.destination"
                            value={formData.action.destination}
                            onChange={handleChange}
                            placeholder="/inventory, /staff, etc."
                            className="px-4 py-2.5 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Button Label
                          </label>
                          <input
                            type="text"
                            name="action.label"
                            value={formData.action.label}
                            onChange={handleChange}
                            placeholder="View Details"
                            className="px-4 py-2.5 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Additional Options */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-md font-medium mb-3">
                    Additional Options
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        id="send-push"
                        name="sendPush"
                        type="checkbox"
                        checked={formData.sendPush}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor="send-push"
                        className="text-sm text-gray-700"
                      >
                        Send as push notification (if available)
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Expiry Date (Optional)
                      </label>
                      <input
                        type="datetime-local"
                        name="expiresAt"
                        value={formData.expiresAt || ""}
                        onChange={handleChange}
                        className="px-4 py-2.5 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        If set, notification will automatically expire after
                        this date
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </form>

            {/* Footer with actions */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end items-center space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send size={16} className="mr-2" />
                    Send Notification
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CreateNotificationPopup;
