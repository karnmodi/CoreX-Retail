import React, { useEffect, useState, useReducer } from "react";
import { useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStaff } from "@/configs/StaffContext";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const initialFormState = {
  firstName: "",
  lastName: "",
  email: "",
  dateOfBirth: "",
  maritalStatus: "",
  gender: "",
  password: "12345678",
  cnfPassword: "12345678",
  race: "",

  //Employment Information
  employeeID: "",
  classificationType: "",
  position: "",
  employeeType: "",
  employeeStatus: "",
  employeeRating: "",
  performanceScore: "",

  //Department Information
  department: "", //dont remove
  division: "", // dont remove
  locationCode: "",
  state: "",
  supervisor: "",
  payZone: "",

  //Dates Information
  // startDate: Timestamp.now(),
  exitDate: "",
  // createdDate : Timestamp.now(),
  terminationType: "",
};

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
  const { deleteStaffMember, getStaffById } = useStaff();
  const hasRun = useRef(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    if (!id) {
      alert("Please select a Staff from the Manage Staff page");
      navigate("../../staff/manage");
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

          dispatch({ type: "LOAD_STAFF_MEMBER", values: staffData });
        } else {
          setSubmitError("Staff member not found");
          setTimeout(() => {
            navigate("../../staff/manage");
          }, 3000);
        }
      } catch (error) {
        setSubmitError("Error loading staff member: " + error.message);
      }
    };

    loadStaffMember();
  }, []);

  const handleRemove = async () => {
    try {
      if (!id) {
        setSubmitError("Invalid staff ID.");
        return;
      }
      await deleteStaffMember(id);
      navigate("../../staff/manage");
      
    } catch (error) {
      setSubmitError("Error removing staff member: " + error.message);
    }
  };

  return (
    <>
      <div className="grid grid-col-1 gap-4">
        <h2 className="text-lg font-medium ">Review Information</h2>
        <Button
          onClick={handleRemove}
          className="bg-indigo-500 hover:bg-fuchsia-500 rounded-xl text-white text-lg font-medium px-6 py-2"
        >
          Remove
        </Button>
      </div>

      <div>
        <div className="border rounded-md p-4 bg-gray-50">
          <h3 className="font-medium mb-2">Personal Information</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Name:</div>
            <div>
              {formState.firstName} {formState.lastName}
            </div>
            <div>Email:</div>
            <div>{formState.email}</div>
            <div>Gender:</div>
            <div>{formState.gender || ""}</div>
            <div>Date of Birth:</div>
            <div>{formState.dateOfBirth}</div>
            <div>Marital Status:</div>
            <div>{formState.maritalStatus || ""}</div>
            <div>Race:</div>
            <div>{formState.race || ""}</div>
          </div>

          <h3 className="font-medium mt-4 mb-2">Employment Information</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Position:</div>
            <div>{formState.position || ""}</div>
            <div>Classification:</div>
            <div>{formState.classificationType || ""}</div>
            <div>Employee Status:</div>
            <div>
              <div>{formState.employeeStatus || ""}</div>
            </div>
          </div>

          <h3 className="font-medium mt-4 mb-2">Department Information</h3>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>Department:</div>
            <div>{formState.department || ""}</div>
            <div>Division:</div>
            <div>{formState.division || ""}</div>
            <div>Supervisor:</div>
            <div>{formState.supervisor || ""}</div>
            <div>Location Code:</div>
            <div>{formState.locationCode}</div>
            <div>State:</div>
            <div>{formState.state}</div>
            <div>Pay Zone:</div>
            <div>{formState.payZone || ""}</div>
          </div>
        </div>
        {/* <div>
          <Button className="bg-indigo-500 hover:bg-fuchsia-500 rounded-xl text-white w-full">
            Remove
          </Button>
        </div> */}

        {submitError && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{submitError}</AlertDescription>
          </Alert>
        )}
      </div>
    </>
  );
};

export default RemoveStaff;
