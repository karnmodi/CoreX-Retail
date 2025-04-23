import React from "react";
import { Calendar, Users, Clock, SunMoon, ChevronLeft } from "lucide-react";
import StaffSchedule from "../../components/Manager/StaffScehdule";
import { useNavigate } from "react-router-dom";

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

const SchedulePage = () => {

  const navigate = useNavigate();
  const handleBackClick = () => {
    navigate(-1); 
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Header with back navigation */}
      <div className="flex items-center space-x-3 mb-6">
        <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors group">
          <ChevronLeft className="h-6 w-6 text-gray-600 group-hover:text-gray-800 transition-colors" onClick={handleBackClick}/>
        </button>
        <h2 className="text-2xl font-bold text-gray-800">Staff Schedule</h2>
      </div>

      {/* Staff Schedule Component */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <StaffSchedule />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        <StatCard
          icon={Calendar}
          title="Total Shifts Today"
          value="24"
          subtitle="8 morning, 10 afternoon, 6 evening"
        />
        <StatCard
          icon={Users}
          title="Staff On Duty"
          value="18"
          subtitle="6 currently on break"
        />
        <StatCard
          icon={Clock}
          title="Pending Swaps"
          value="3"
          subtitle="Requires your approval"
        />
        <StatCard
          icon={SunMoon}
          title="Upcoming Time Off"
          value="5"
          subtitle="In the next 7 days"
        />
      </div>
    </div>
  );
};

export default SchedulePage;
