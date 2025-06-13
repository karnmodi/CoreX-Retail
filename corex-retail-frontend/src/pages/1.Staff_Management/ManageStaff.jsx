import React, { useMemo, useState } from "react";
import { useStaff } from "../../configs/StaffContext";
import { useAuth } from "../../configs/AuthContext"; // Added Auth Context import
import DataTable from "../../components/Table";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import UserDetailsDialog from "../../components/UserDetailsDialog";
import { getFullName, getRoleBadgeColor } from "../../utils/helpers";
import moment from "moment";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ManageStaffPage = () => {
  const {
    staff,
    loading,
    error,
    selectedStaff,
    showDetails,
    handleRowClick,
    closeDetails,
  } = useStaff();

  const { userData } = useAuth(); // Get user data from Auth Context
  const isAdmin = userData && userData.role === "admin";

  const [genderFilter, setGenderFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const accessibleStaff = useMemo(() => {
    if (isAdmin) {
      return staff;
    }

    return staff.filter(
      (employee) => employee.role === "staff" 
    );
  }, [staff, isAdmin]);

  const filteredStaff = useMemo(() => {
    return accessibleStaff.filter((s) => {
      return (
        (!genderFilter || s.genderCode === genderFilter) &&
        (!roleFilter || s.role === roleFilter) &&
        (!typeFilter || s.employeeType === typeFilter)
      );
    });
  }, [accessibleStaff, genderFilter, roleFilter, typeFilter]);

  const columns = useMemo(
    () => [
      { key: "empId", label: "ID" },
      {
        key: "fullName",
        label: "Full Name",
        format: (_, row) => getFullName(row.firstName, row.lastName),
      },
      {
        key: "role",
        label: "Position",
        format: (value) => (
          <Badge
            className={`${getRoleBadgeColor(
              value
            )} px-3 py-1 text-sm rounded-full`}
          >
            {value}
          </Badge>
        ),
      },
      { key: "email", label: "Email" },
      { key: "genderCode", label: "Gender" },
      {
        key: "startDate",
        label: "Join Date",
        format: (value) => {
          if (value && value.seconds) {
            return moment(value.toDate()).format("DD/MM/YYYY");
          }
          if (value) {
            return moment(value).format("DD/MM/YYYY");
          }
          return "";
        },
      },
      { key: "employeeType", label: "Employee Type" },
    ],
    []
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // if (error) {
  //   return (
  //     <Alert variant="destructive">
  //       <AlertDescription>Error loading staff data: {error}</AlertDescription>
  //     </Alert>
  //   );
  // }

  // Modify role filter options based on user role
  const getRoleFilterOptions = () => {
    if (isAdmin) {
      return (
        <>
          <SelectItem value="">All</SelectItem>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="store manager">Store Manager</SelectItem>
          <SelectItem value="staff">Staff</SelectItem>
        </>
      );
    } else {
      // Store managers can only filter by staff role
      return (
        <>
          <SelectItem value="">All</SelectItem>
          <SelectItem value="staff">Staff</SelectItem>
        </>
      );
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Select onValueChange={setGenderFilter} value={genderFilter}>
          <SelectTrigger className="rounded-full border border-gray-300 bg-white px-4 py-2 shadow focus:ring-2 focus:ring-blue-500 focus:outline-none hover:border-blue-400 transition duration-200">
            <SelectValue placeholder="Filter by Gender" />
          </SelectTrigger>
          <SelectContent className="rounded-xl shadow-lg">
            <SelectItem value="">All</SelectItem>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={setRoleFilter} value={roleFilter}>
          <SelectTrigger className="rounded-full border border-gray-300 bg-white px-4 py-2 shadow focus:ring-2 focus:ring-green-500 focus:outline-none hover:border-green-400 transition duration-200">
            <SelectValue placeholder="Filter by Role" />
          </SelectTrigger>
          <SelectContent className="rounded-xl shadow-lg">
            {getRoleFilterOptions()}
          </SelectContent>
        </Select>

        <Select onValueChange={setTypeFilter} value={typeFilter}>
          <SelectTrigger className="rounded-full border border-gray-300 bg-white px-4 py-2 shadow focus:ring-2 focus:ring-purple-500 focus:outline-none hover:border-purple-400 transition duration-200">
            <SelectValue placeholder="Filter by Employee Type" />
          </SelectTrigger>
          <SelectContent className="rounded-xl shadow-lg">
            <SelectItem value="">All</SelectItem>
            <SelectItem value="full-time">Full-Time</SelectItem>
            <SelectItem value="part-time">Part-Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
        <DataTable
          data={filteredStaff}
          columns={columns}
          title={isAdmin ? "Staff Management" : "Staff Overview"}
          onRowClick={handleRowClick}
        />
      </div>

      <UserDetailsDialog
        user={selectedStaff}
        open={showDetails}
        onClose={closeDetails}
      />
    </div>
  );
};

export default ManageStaffPage;
