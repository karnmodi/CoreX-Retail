import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStaff } from "../../configs/StaffContext";
import { getFullName } from "../../utils/helpers";

function formReducer(state, action) {
  if (!action) return state;

  switch (action.type) {
    case "UPDATE_FIELD":
      return { ...state, [action.field]: action.value };
    case "UPDATE_MULTIPLE":
      return { ...state, ...action.values };
    case "RESET":
      return initialFormState;
    case "LOAD_STAFF_MEMBER":
      return { ...state, ...action.values };
    default:
      return state;
  }
}

const RemoveStaff = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formState, dispatch] = useReducer(formReducer, initialFormState || {});
  const { staff, deleteStaffMember, getStaffById } = useStaff();

  const [submitError, setSubmitError] = useState(""); // Define submitError state

  useEffect(() => {
    if (!id) {
      alert("Please select a Staff from the Manage Staff page");
      navigate("../manageStaff");
      return;
    }

    const loadStaffMember = async () => {
      try {
        const staffMember = await getStaffById(id);
        if (staffMember) {
          const staffData = {
            firstName: staffMember.firstName || "",
            lastName: staffMember.lastName || "",
            email: staffMember.email || "",
            dateOfBirth: staffMember.dateOfBirth || "",
            maritalStatus: staffMember.maritalDesc || "",
            gender: staffMember.genderCode || "",
            race: staffMember.raceDesc || "",

            // Employment Information
            employeeID: staffMember.empId || "",
            classificationType: staffMember.classificationType || "",
            position: staffMember.role || "",
            employeeType: staffMember.employeeType || "",
            employeeStatus: staffMember.employeeStatus || "",
            employeeRating: staffMember.currentEmployeeRating || "",
            performanceScore: staffMember.performanceScore || "",

            // Department Information
            department: staffMember.departmentType || "",
            division: staffMember.division || "",
            locationCode: staffMember.locationCode || "",
            state: staffMember.state || "",
            supervisor: staffMember.supervisor || "",
            payZone: staffMember.payZone || "",

            // Dates Information
            exitDate: staffMember.exitDate || "",
            terminationType: staffMember.terminationDescription || "",

            documentId: staffMember.id,

            // Leave password fields empty in update mode
            password: "••••••••",
            cnfpassword: "••••••••",
          };

          // Ensure dispatch is defined or imported
          // dispatch({ type: "LOAD_STAFF_MEMBER", values: staffData });
        } else {
          setSubmitError("Staff member not found");
          setTimeout(() => {
            navigate("../manageStaff");
          }, 3000);
        }
      } catch (error) {
        setSubmitError("Error loading staff member: " + error.message);
      }
    };

    loadStaffMember();
  }, [id, getStaffById, navigate]);

  const handleRemoveStaff = () => {
    console.log(`Removing staff with ID: ${id}`);
  };

  return (
    <>
      {/* <h1>Remove Staff: {staff?.firstName}</h1> */}
    </>
  );
};

export default RemoveStaff;
