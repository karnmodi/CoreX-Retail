import React, { useMemo } from "react";
import { useStaff } from "../../configs/StaffContext";
import DataTable from "../../components/Table";
import { Loader2, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import UserDetailsDialog from "../../components/UserDetailsDialog";
import { getFullName, getRoleBadgeColor } from "../../utils/helpers";
import moment from "moment";

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
          <Badge className={`${getRoleBadgeColor(value)} px-3 py-1`}>
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
          // Handle Firebase Timestamp
          if (value && value.seconds) {
            return moment(value.toDate()).format("DD/MM/YYYY");
          }
          // Handle regular date strings
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

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Error loading staff data: {error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <DataTable
          data={staff}
          columns={columns}
          title="Staff Management"
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
