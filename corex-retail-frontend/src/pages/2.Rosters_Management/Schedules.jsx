import React, { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  Clock,
  SunMoon,
  ChevronLeft,
  Search,
  X,
  UserCircle2,
  Loader2,
  CalendarDays,
  ChevronRight,
} from "lucide-react";
import StaffSchedule from "../../components/Manager/StaffScehdule";
import { useNavigate, useParams } from "react-router-dom";
import { useRoster } from "../../configs/RostersContext";
import { useStaff } from "../../configs/StaffContext";
import { useAuth } from "../../configs/AuthContext";

const StatCard = ({ icon: Icon, title, value, subtitle }) => (
  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300 group">
    <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
      <h3 className="text-sm font-medium text-gray-600">{title}</h3>
      <Icon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
    </div>
    <div className="p-4">
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
    </div>
  </div>
);

// Staff search popup with shift preview
const StaffSearchPopup = ({ isOpen, onClose, onSelectStaff, staff }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStaff, setFilteredStaff] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewShifts, setPreviewShifts] = useState(null);
  const { fetchUpcomingShifts } = useRoster();

  // Filter staff based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredStaff(staff);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = staff.filter((member) => {
      const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
      const role = (member.role || "").toLowerCase();
      const department = (
        member.department ||
        member.departmentType ||
        ""
      ).toLowerCase();

      return (
        fullName.includes(query) ||
        role.includes(query) ||
        department.includes(query)
      );
    });

    setFilteredStaff(results);
  }, [searchQuery, staff]);

  // Initialize with all staff
  useEffect(() => {
    if (staff) {
      setFilteredStaff(staff);
    }
  }, [staff]);

  // Preview staff member shifts
  const handlePreviewMember = async (member) => {
    if (selectedMember?.id === member.id) {
      return; // Already selected
    }

    setSelectedMember(member);
    setPreviewLoading(true);
    setPreviewShifts(null);

    try {
      // Fetch upcoming shifts for this staff member
      const shifts = await fetchUpcomingShifts(member.id, 7);
      setPreviewShifts(shifts);
    } catch (error) {
      console.error("Error fetching shifts for preview:", error);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Handle staff selection
  const handleSelectStaff = (member) => {
    onSelectStaff(member);
    onClose();
  };

  // Format date to readable form
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check if date is today or tomorrow
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    }

    // Otherwise return formatted date
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate total hours from shift times
  const calculateHours = (startTime, endTime) => {
    const [startHour, startMin] = startTime.split(":").map(Number);
    const [endHour, endMin] = endTime.split(":").map(Number);

    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    return ((endMinutes - startMinutes) / 60).toFixed(1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-800">
            Staff Schedule Search
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search bar */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, role, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Content - 2 column layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Staff list */}
          <div className="w-2/5 border-r border-gray-200 overflow-y-auto">
            {filteredStaff.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>No staff members found</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {filteredStaff.map((member) => (
                  <li key={member.id}>
                    <button
                      className={`w-full text-left p-4 hover:bg-gray-50 flex items-center gap-3 ${
                        selectedMember?.id === member.id ? "bg-blue-50" : ""
                      }`}
                      onClick={() => handlePreviewMember(member)}
                    >
                      <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        {member.profilePicture ? (
                          <img
                            src={member.profilePicture}
                            alt={`${member.firstName} ${member.lastName}`}
                            className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-full object-cover"
                          />
                        ) : (
                          <UserCircle2 className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-gray-400" />
                        )}
                      </div>

                      <div>
                        <div className="font-medium text-gray-800">
                          {member.firstName} {member.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {member.role || "Staff"} •{" "}
                          {member.department ||
                            member.departmentType ||
                            "General"}
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Shift preview */}
          <div className="w-3/5 overflow-y-auto p-4">
            {!selectedMember ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <Calendar className="w-12 h-12 mb-3 text-gray-300" />
                <p className="text-lg font-medium">Select a staff member</p>
                <p className="text-sm mt-1">Preview their upcoming shifts</p>
              </div>
            ) : previewLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <Loader2 className="w-10 h-10 mb-3 text-blue-500 animate-spin" />
                <p>Loading shifts...</p>
              </div>
            ) : (
              <div>
                <div className="bg-blue-50 p-4 rounded-xl mb-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">
                        {selectedMember.firstName} {selectedMember.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {selectedMember.role || "Staff"} •{" "}
                        {selectedMember.department ||
                          selectedMember.departmentType ||
                          "General"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Upcoming shifts preview */}
                <div>
                  <div className="flex items-center mb-3">
                    <CalendarDays className="w-5 h-5 text-gray-400 mr-2" />
                    <h3 className="text-sm font-medium text-gray-700">
                      Upcoming shifts (7 days)
                    </h3>
                  </div>

                  {!previewShifts ||
                  !previewShifts.shiftsByDate ||
                  Object.keys(previewShifts.shiftsByDate).length === 0 ? (
                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                      <p className="text-gray-500">
                        No upcoming shifts scheduled
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(previewShifts.shiftsByDate)
                        .slice(0, 5)
                        .map(([date, shifts]) => (
                          <div
                            key={date}
                            className="border border-gray-200 rounded-lg overflow-hidden"
                          >
                            <div className="bg-gray-50 px-4 py-2 font-medium text-gray-700">
                              {formatDate(date)}
                            </div>
                            <div className="divide-y divide-gray-100">
                              {shifts.map((shift) => (
                                <div
                                  key={shift.id}
                                  className="px-4 py-3 flex justify-between items-center"
                                >
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-gray-400" />
                                    <span className="text-gray-800">
                                      {shift.startTime.substring(0, 5)} -{" "}
                                      {shift.endTime.substring(0, 5)}
                                    </span>
                                  </div>
                                  <span className="text-sm text-gray-500">
                                    {calculateHours(
                                      shift.startTime,
                                      shift.endTime
                                    )}{" "}
                                    hrs
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      {Object.keys(previewShifts.shiftsByDate).length > 5 && (
                        <div className="text-center text-sm text-blue-500">
                          <button
                            onClick={() => handleSelectStaff(selectedMember)}
                            className="hover:underline"
                          >
                            Show all shifts...
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const SchedulePage = () => {
  const navigate = useNavigate();
  const { staffId } = useParams();
  const { currentUser } = useAuth();
  const { staff, getStaffById } = useStaff();
  const { upcomingShifts, fetchUpcomingShifts } = useRoster();

  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isManager, setIsManager] = useState(true);
  const [isSearchPopupOpen, setIsSearchPopupOpen] = useState(false);
  const [stats, setStats] = useState({
    totalShiftsToday: "0",
    staffOnDuty: "0",
    pendingSwaps: "0",
    upcomingTimeOff: "0",
  });

  // Determine if current user is a manager
  useEffect(() => {
    if (currentUser) {
      setIsManager(
        currentUser.role === "manager" ||
          currentUser.role === "store manager" ||
          currentUser.role === "admin"
      );
    }
  }, [currentUser]);

  // Load staff details if staffId is provided
  useEffect(() => {
    const loadStaffData = async () => {
      if (staffId) {
        const staffData = await getStaffById(staffId);
        setSelectedStaff(staffData);
      }
    };

    loadStaffData();
  }, [staffId, getStaffById]);

  // Calculate stats from shifts
  useEffect(() => {
    if (upcomingShifts && upcomingShifts.shifts) {
      const today = new Date().toISOString().split("T")[0];
      const todayShifts = upcomingShifts.shiftsByDate?.[today] || [];

      const currentHour = new Date().getHours();
      const currentMinute = new Date().getMinutes();
      const currentTimeStr = `${String(currentHour).padStart(2, "0")}:${String(
        currentMinute
      ).padStart(2, "0")}`;

      const onDutyCount = todayShifts.filter((shift) => {
        return (
          shift.startTime <= currentTimeStr && shift.endTime >= currentTimeStr
        );
      }).length;

      setStats({
        totalShiftsToday: todayShifts.length.toString(),
        staffOnDuty: onDutyCount.toString(),
        pendingSwaps: "3", // Placeholder values
        upcomingTimeOff: "5",
      });
    }
  }, [upcomingShifts]);

  const handleBackClick = () => {
    navigate(-1);
  };

  // Open staff search popup
  const openSearchPopup = () => {
    setIsSearchPopupOpen(true);
  };

  // Handle staff selection from search popup
  const handleStaffSelect = (staffMember) => {
    navigate(`/schedule/${staffMember.id}`);
  };

  // Used to determine who's schedule we're viewing
  const targetStaffId = staffId || currentUser?.uid;

  // Get staff name for display
  const getDisplayName = () => {
    if (staffId && selectedStaff) {
      return `${selectedStaff.firstName} ${selectedStaff.lastName}'s`;
    }
    return "My";
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header with back navigation and staff search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex items-center space-x-3">
          <button
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors group"
            onClick={handleBackClick}
          >
            <ChevronLeft className="h-6 w-6 text-gray-600 group-hover:text-gray-800 transition-colors" />
          </button>
          <h2 className="text-2xl font-bold text-gray-800">
            {getDisplayName()} Schedule
          </h2>
        </div>

        {/* Staff Search Button (Only visible for managers) */}
        {isManager && staff && staff.length > 0 && (
          <button
            onClick={openSearchPopup}
            className="px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 text-gray-700 flex items-center gap-2 transition-colors"
          >
            <Search className="h-5 w-5 text-gray-500" />
            <span>Search Staff Schedules</span>
          </button>
        )}
      </div>

      {/* Quick Access - Recently Viewed or Top Staff */}
      {isManager && staffId && (
        <div className="mb-4 overflow-x-auto hide-scrollbar">
          <div className="flex space-x-2 py-2">
            <button
              onClick={() => navigate("/schedule")}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-full text-sm whitespace-nowrap"
            >
              <UserCircle2 className="w-4 h-4" />
              <span>My Schedule</span>
            </button>

            {/* Quick access to some staff members */}
            {staff.slice(0, 5).map((member) => (
              <button
                key={member.id}
                onClick={() => navigate(`/schedule/${member.id}`)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap
                  ${
                    member.id === staffId
                      ? "bg-blue-100 text-blue-700"
                      : "bg-white border border-gray-200 hover:bg-gray-50 text-gray-700"
                  }`}
              >
                <span>
                  {member.firstName} {member.lastName}
                </span>
              </button>
            ))}

            {staff.length > 5 && (
              <button
                onClick={openSearchPopup}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-full text-sm whitespace-nowrap"
              >
                <span>+{staff.length - 5} more</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Staff Schedule Component */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden mb-6">
        <StaffSchedule staffId={targetStaffId} />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Calendar}
          title="Total Shifts Today"
          value={stats.totalShiftsToday}
          subtitle="Scheduled for today"
        />
        <StatCard
          icon={Users}
          title="Staff On Duty"
          value={stats.staffOnDuty}
          subtitle="Currently working"
        />
        <StatCard
          icon={Clock}
          title="Pending Swaps"
          value={stats.pendingSwaps}
          subtitle="Requires approval"
        />
        <StatCard
          icon={SunMoon}
          title="Upcoming Time Off"
          value={stats.upcomingTimeOff}
          subtitle="In the next 7 days"
        />
      </div>

      {/* Staff view notification */}
      {staffId && selectedStaff && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mr-3">
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <p className="text-blue-800 font-medium">
              You're viewing {selectedStaff.firstName} {selectedStaff.lastName}
              's schedule
            </p>
            <p className="text-sm text-blue-600 mt-1">
              As a manager, you can view any team member's schedule.
              <button
                className="text-blue-700 underline ml-1"
                onClick={() => navigate("/schedule")}
              >
                Return to your schedule
              </button>
            </p>
          </div>
        </div>
      )}

      {/* Staff Search Popup */}
      <StaffSearchPopup
        isOpen={isSearchPopupOpen}
        onClose={() => setIsSearchPopupOpen(false)}
        onSelectStaff={handleStaffSelect}
        staff={staff}
      />
    </div>
  );
};

export default SchedulePage;
