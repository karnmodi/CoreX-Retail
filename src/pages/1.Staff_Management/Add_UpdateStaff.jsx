import React, { useState, useMemo, useReducer, useId, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import FloatingLabelInput from "@/components/small/FloatingLabelInput";
import FloatingLabelSelect from "../../components/small/FloatingLabelSelect";
import useFetchCounties from "../../components/api_fetch/StateFetch";
import { useStaff } from "../../configs/StaffContext";
import { getFullName } from "../../utils/helpers";
import { AlertCircle } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

const initialFormState = {
  firstName: "Karan",
  lastName: "Modi",
  email: "karan@gmail.com",
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

const FORM_OPTIONS = {
  genderOptions: [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "others", label: "Others" },
  ],

  meritalStatusOptions: [
    { value: "single", label: "Single" },
    { value: "married", label: "Married" },
    { value: "divorced", label: "Divorced" },
    { value: "widowed", label: "Widowed" },
    { value: "unknown", label: "Prefer not to say" },
  ],

  classificationTypeOptions: [
    { value: "part-time", label: "Part Time" },
    { value: "full-time", label: "Full Time" },
    { value: "temporary", label: "Temporary" },
  ],

  positionOptions: [
    { value: "admin", label: "admin" },
    { value: "store manager", label: "store manager" },
    { value: "staff", label: "staff" },
  ],

  employeeRatingOptions: [
    { value: "1", label: "1" },
    { value: "2", label: "2" },
    { value: "3", label: "3" },
    { value: "4", label: "4" },
    { value: "5", label: "5" },
  ],

  employeeStatusOptions: [
    { value: "active", label: "Active" },
    { value: "leave of absence", label: "Leave of Absense" },
    { value: "voluntarily terminated", label: "Voluntarily Terminated" },
    { value: "terminated for cause", label: "Terminated for Cause" },
  ],

  raceOptions: [
    {
      value: "american Indian or alaska native",
      label: "American Indian or Alaska Native",
    },
    { value: "asian", label: "Asian" },
    {
      value: "black or african american",
      label: "Black or African American",
    },
    { value: "white", label: "White" },
    { value: "Hispanic", label: "Hispanic" },
    { value: "two Or More", label: "Two or More reces" },
    { value: "other", label: "Other" },
  ],

  payZoneOptions: [
    { value: "Zone A", label: "Zone A" },
    { value: "Zone B", label: "Zone B" },
    { value: "Zone C", label: "Zone C" },
    { value: "Zone D", label: "Zone D" },
  ],
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

const ValidateStep = (step, formState, isUpdateMode) => {
  const errors = {};

  switch (step) {
    case 1:
      if (!formState.firstName || formState.firstName.length < 2)
        errors.firstName = "First name must be at least 2 characters";

      if (!formState.lastName || formState.lastName.length < 2)
        errors.lastName = "Last name must be at least 2 characters";

      if (!formState.gender) errors.gender = "Please select gender";
      break;
    case 2:
      if (
        !formState.email ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)
      )
        errors.email = "Please enter a valid email address";

      // Only validate password fields if not in update mode
      if (!isUpdateMode) {
        if (!formState.password || formState.password.length < 8)
          errors.password = "Password must be at least 8 characters";

        if (formState.password !== formState.cnfPassword)
          errors.cnfPassword = "Passwords don't match";
      }
      break;

    case 3:
      if (!formState.dateOfBirth)
        errors.dateOfBirth = "Please enter date of birth";

      if (!formState.maritalStatus)
        errors.maritalStatus = "Please select marital status";

      if (!formState.race) errors.race = "Please select race";
      break;
    case 4:
      if (!formState.classificationType)
        errors.classificationType = "Please select classification type";

      if (!formState.position) errors.position = "Please select position";

      if (!formState.employeeStatus)
        errors.employeeStatus = "Please select employee status";
      break;
    case 5:
      if (!formState.department) errors.department = "Please select department";

      if (!formState.division) errors.division = "Please select division";
      break;
    case 6:
      if (!formState.payZone) errors.payZone = "Please select pay zone";

      if (!formState.locationCode)
        errors.locationCode = "Please enter location code";
      break;
  }
  return errors;
};

const Add_Update_StaffPage = () => {
  const [step, setStep] = useState(1);
  const [formState, dispatch] = useReducer(formReducer, initialFormState || {});
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { staff, addStaffMember, updateStaffMember, getStaffById } = useStaff();
  const { stateOptions, loading, error } = useFetchCounties();
  const navigate = useNavigate();
  const { id } = useParams();
  const [isUpdateMode, setIsUpdateMode] = useState(false);

  useEffect(() => {
    const loadStaffMember = async () => {
      if (id) {
        setIsUpdateMode(true);
        try {
          let staffMember = await getStaffById(id);

          if (!staffMember) {
            staffMember = await getStaffById(id);
          }

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
      }
    };

    loadStaffMember();
  }, [id, navigate]);

  const departmentOptions = [];
  if (formState.position === "staff") {
    departmentOptions.push({ value: "generalStaff", label: "General Staff" });
  } else if (formState.position === "store manager") {
    departmentOptions.push({ value: "retail", label: "Retail" });
  } else if (formState.position === "admin") {
    departmentOptions.push({
      value: "administration",
      label: "Administration",
    });
  }

  const divisionOptions = [];
  if (formState.position === "staff") {
    divisionOptions.push({
      value: "Various Departments",
      label: "Various Departments",
    });
  } else if (formState.position === "store manager") {
    divisionOptions.push({
      value: "Store Operations",
      label: "Store Operations",
    });
  } else if (formState.position === "admin") {
    divisionOptions.push({
      value: "Corporate",
      label: "Corporate",
    });
  }

  const supervisorOptions = useMemo(() => {
    return staff
      .filter((member) => member.role === "store manager")
      .map((manager) => ({
        value: getFullName(manager.firstName, manager.lastName),
        label: `${manager.firstName} ${manager.lastName}`,
      }));
  }, [staff]);

  const generateEmployeeID = () => {
    return Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log("Input changed:", name, value);
    
    if (isUpdateMode && (name === "password" || name === "cnfPassword")) {
      return;
    }
    
    console.log("Dispatching update for:", name, value);
    dispatch({ type: "UPDATE_FIELD", field: name, value });
    
    // Remove this if/return statement completely
    // if (loading)
    //   return <div className="text-gray-600">Loading counties...</div>;
    
    setErrors((prevErrors) => {
      const newErrors = ValidateStep(
        step,
        { ...formState, [name]: value },
        isUpdateMode
      );
  
      return {
        ...prevErrors,
        [name]: newErrors[name] || "",
      };
    });
  };

  const nextStep = () => {
    const stepErrors = ValidateStep(step, formState, isUpdateMode);
    if (Object.keys(stepErrors).length === 0) {
      if (step < 7) {
        setStep(step + 1);
      }
    } else {
      setErrors(stepErrors);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const stepErrors = ValidateStep(step, formState, isUpdateMode);

      if (Object.keys(stepErrors).length > 0) {
        setErrors(stepErrors);
        setIsSubmitting(false);
        return;
      }

      const staffData = {
        // Personal information
        firstName: formState.firstName,
        lastName: formState.lastName,
        email: formState.email,
        dateOfBirth: formState.dateOfBirth,
        maritalDesc: formState.maritalStatus,
        genderCode: formState.gender,
        raceDesc: formState.race,

        // Employment Information
        // empId: generateEmployeeID(),
        classificationType: formState.classificationType,
        employeeType: formState.employeeType,
        role: formState.position,
        employeeStatus: formState.employeeStatus,
        currentEmployeeRating: formState.employeeRating,
        performanceScore: formState.performanceScore,

        // Department Information
        departmentType: formState.department,
        division: formState.division,
        locationCode: formState.locationCode,
        state: formState.state,
        supervisor: formState.supervisor,
        payZone: formState.payZone,

        // Dates Information
        terminationDescription: formState.terminationType,
        terminationType: "unk",
      };

      if (isUpdateMode) {
        const documentId = formState.documentId || id;

        await updateStaffMember(documentId, staffData);
        alert("Staff Member Successfully Updated.");
        navigate("../../staff/manage");
      } else {
        staffData.empId = generateEmployeeID();
        const user = await addStaffMember(staffData, formState.password);
        dispatch({ type: "RESET" });
        setStep(1);
        alert("Staff member added successfully.", user);
        navigate("../../staff/manage");
        setErrors({});
      }
    } catch (error) {
      setSubmitError([
        "Error " + (isUpdateMode ? "Updating" : "Adding") + "staff member" &&
          error.message,
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1: // Personal Information (1/3)
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Personal Information (1/3)</h2>

            <FloatingLabelInput
              id="firstNameInput"
              name="firstName"
              value={formState.firstName}
              onChange={handleInputChange}
              label="First Name"
              error={errors.firstName}
            />

            <FloatingLabelInput
              id="lastNameInput"
              name="lastName"
              value={formState.lastName}
              onChange={handleInputChange}
              label="Last Name"
              error={errors.lastName}
            />
            <FloatingLabelSelect
              id="genderSelect"
              name="gender"
              value={formState.gender}
              onChange={handleInputChange}
              label="Gender *"
              options={FORM_OPTIONS?.genderOptions || []}
              error={errors.gender}
            />
          </div>
        );
      case 2: // Personal Information (2/3)
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Personal Information (2/3)</h2>

            <FloatingLabelInput
              id="emailInput"
              name="email"
              value={formState.email}
              onChange={handleInputChange}
              error={errors.email}
              label="Email"
              disabled={isUpdateMode}
            />

            <FloatingLabelInput
              type="password"
              name="password"
              id="passwordInput"
              onChange={handleInputChange}
              value={formState.password}
              label="Password"
              error={errors.password}
              disabled={isUpdateMode}
              readOnly={isUpdateMode}
              className={isUpdateMode ? "bg-gray-100 cursor-not-allowed" : ""}
            />

            <FloatingLabelInput
              type="password"
              name="cnfPassword"
              id="cnfPasswordInput"
              onChange={handleInputChange}
              value={formState.cnfPassword}
              label="Confirm Password"
              error={errors.cnfPassword}
              disabled={isUpdateMode}
              readOnly={isUpdateMode}
              className={isUpdateMode ? "bg-gray-100 cursor-not-allowed" : ""}
            />

            {isUpdateMode && (
              <div className="text-sm text-gray-500 italic">
                Password fields are not editable in update mode.
              </div>
            )}
          </div>
        );
      case 3: // Personal Information (3/3)
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Personal Information (3/3)</h2>

            <FloatingLabelSelect
              id="maritalStatusSelect"
              name="maritalStatus"
              value={formState.maritalStatus}
              onChange={handleInputChange}
              error={errors.maritalStatus}
              label="Marital Status"
              options={FORM_OPTIONS.meritalStatusOptions}
            />

            <FloatingLabelInput
              id="dateOfBirth"
              type="date"
              name="dateOfBirth"
              onChange={handleInputChange}
              value={formState.dateOfBirth}
              label="Date of Birth"
              error={errors.dateOfBirth}
            />

            <FloatingLabelSelect
              id="raceSelect"
              name="race"
              value={formState.race}
              onChange={handleInputChange}
              error={errors.race}
              label="Race"
              options={FORM_OPTIONS.raceOptions}
            />
          </div>
        );
      case 4: // Employment Information
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Employment Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingLabelSelect
                id="classificationTypeSelect"
                name="classificationType"
                value={formState.classificationType}
                onChange={handleInputChange}
                label="Classification Type"
                options={FORM_OPTIONS.classificationTypeOptions}
                error={errors.classificationType}
              />

              <FloatingLabelSelect
                id="positionSelect"
                name="position"
                value={formState.position}
                onChange={handleInputChange}
                label="Position / Role"
                options={FORM_OPTIONS.positionOptions}
                error={errors.position}
              />

              <FloatingLabelSelect
                id="employeeStatusSelect"
                name="employeeStatus"
                value={formState.employeeStatus}
                onChange={handleInputChange}
                label="Employee Status"
                options={FORM_OPTIONS.employeeStatusOptions}
                error={errors.employeeStatus}
              />

              <FloatingLabelSelect
                id="employeeTypeSelect"
                name="employeeType"
                value={formState.employeeType}
                onChange={handleInputChange}
                label="Employee Type"
                options={FORM_OPTIONS.classificationTypeOptions}
                error={errors.employeeType}
              />

              <FloatingLabelSelect
                id="employeeRatingSelect"
                name="employeeRating"
                value={formState.employeeRating}
                onChange={handleInputChange}
                label="Employee Ratings"
                options={FORM_OPTIONS.employeeRatingOptions}
                error={errors.employeeRating}
              />
            </div>
          </div>
        );
      case 5: // Department Information (1/2)
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-medium">
              Department Information (1/2)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingLabelSelect
                id="departmentSelect"
                name="department"
                value={formState.department}
                onChange={handleInputChange}
                label="Department"
                options={departmentOptions || []}
                error={errors.department}
              />

              <FloatingLabelSelect
                id="divisionSelect"
                name="division"
                value={formState.division}
                onChange={handleInputChange}
                label="Division"
                options={divisionOptions || []}
                error={errors.division}
              />

              <FloatingLabelSelect
                id="superviorSelect"
                name="supervisor"
                value={formState.supervisor}
                onChange={handleInputChange}
                label="Supervisor"
                options={supervisorOptions || []}
                error={errors.supervisor}
              />
            </div>
          </div>
        );
      case 6: // Department Information (2/2)
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-medium">
              Department Information (2/2)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FloatingLabelSelect
                id="payZoneSelect"
                name="payZone"
                value={formState.payZone}
                onChange={handleInputChange}
                label="Pay Zone"
                options={FORM_OPTIONS.payZoneOptions}
                error={errors.payZone}
              />

              <FloatingLabelInput
                id="locationCodeInput"
                name="locationCode"
                value={formState.locationCode}
                onChange={handleInputChange}
                label="Location Code"
                error={errors.locationCode}
              />

              <FloatingLabelSelect
                id="stateSelect"
                name="state"
                value={formState.state}
                onChange={handleInputChange}
                label="Select State"
                options={stateOptions}
                className="w-full"
              />
            </div>
          </div>
        );
      case 7: // Review step
        return (
          <div className="space-y-4">
            <h2 className="text-lg font-medium">Review Information</h2>

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
                <div>
                  {FORM_OPTIONS.genderOptions.find(
                    (g) => g.value === formState.gender
                  )?.label || ""}
                </div>
                <div>Date of Birth:</div>
                <div>{formState.dateOfBirth}</div>
                <div>Marital Status:</div>
                <div>
                  {FORM_OPTIONS.meritalStatusOptions.find(
                    (m) => m.value === formState.maritalStatus
                  )?.label || ""}
                </div>
                <div>Race:</div>
                <div>
                  {FORM_OPTIONS.raceOptions.find(
                    (r) => r.value === formState.race
                  )?.label || ""}
                </div>
              </div>

              <h3 className="font-medium mt-4 mb-2">Employment Information</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Position:</div>
                <div>
                  {FORM_OPTIONS.positionOptions.find(
                    (p) => p.value === formState.position
                  )?.label || ""}
                </div>
                <div>Classification:</div>
                <div>
                  {FORM_OPTIONS.classificationTypeOptions.find(
                    (c) => c.value === formState.classificationType
                  )?.label || ""}
                </div>
                <div>Employee Status:</div>
                <div>
                  {FORM_OPTIONS.employeeStatusOptions.find(
                    (s) => s.value === formState.employeeStatus
                  )?.label || ""}
                </div>
              </div>

              <h3 className="font-medium mt-4 mb-2">Department Information</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Department:</div>
                <div>
                  {departmentOptions.find(
                    (d) => d.value === formState.department
                  )?.label || ""}
                </div>
                <div>Division:</div>
                <div>
                  {divisionOptions.find((d) => d.value === formState.division)
                    ?.label || ""}
                </div>
                <div>Supervisor:</div>
                <div>
                  {supervisorOptions.find(
                    (s) => s.value === formState.supervisor
                  )?.label || ""}
                </div>
                <div>Location Code:</div>
                <div>{formState.locationCode}</div>
                <div>State:</div>
                <div>{formState.state}</div>
                <div>Pay Zone:</div>
                <div>
                  {FORM_OPTIONS.payZoneOptions.find(
                    (p) => p.value === formState.payZone
                  )?.label || ""}
                </div>
              </div>
            </div>

            {submitError && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    const stepErrors = ValidateStep(step, formState, isUpdateMode);
    return Object.keys(stepErrors).length === 0;
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="pt-6">
          <div className="text-center">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full px-4 py-8">
      <Card className="w-full max-w-6xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {isUpdateMode ? "Update Staff Member" : "Add New Staff Member"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {submitError && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* //Progress bar */}
            <div className="flex justify-between mb-8">
              {[1, 2, 3, 4, 5, 6, 7].map((stepNumber) => (
                <div
                  key={stepNumber}
                  className={`h-1 rounded cursor-pointer transition-all duration-300 ${
                    stepNumber <= step ? "bg-blue-400" : "bg-gray-200"
                  } ${
                    stepNumber === step ? "w-14 md:w-28 h-3 " : "w-10 md:w-36"
                  }`}
                  onClick={() => stepNumber < step && setStep(stepNumber)}
                />
              ))}
            </div>

            {/* Form Content - Two-column layout on desktop */}
            <div className="md:grid md:grid-cols-12 md:gap-8">
              {/* Sidebar for desktop - shows all sections */}
              <div className="hidden md:block md:col-span-3 space-y-4 border-r pr-6">
                <div
                  className={`py-2 px-4 rounded cursor-pointer ${
                    step === 1
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => step >= 1 && setStep(1)}
                >
                  Personal Info 1/3
                </div>
                <div
                  className={`py-2 px-4 rounded cursor-pointer ${
                    step === 2
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => step >= 2 && setStep(2)}
                >
                  Personal Info 2/3
                </div>
                <div
                  className={`py-2 px-4 rounded cursor-pointer ${
                    step === 3
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => step >= 3 && setStep(3)}
                >
                  Personal Info 3/3
                </div>
                <div
                  className={`py-2 px-4 rounded cursor-pointer ${
                    step === 4
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => step >= 4 && setStep(4)}
                >
                  Employment
                </div>
                <div
                  className={`py-2 px-4 rounded cursor-pointer ${
                    step === 5
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => step >= 5 && setStep(5)}
                >
                  Department 1/2
                </div>
                <div
                  className={`py-2 px-4 rounded cursor-pointer ${
                    step === 6
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => step >= 6 && setStep(6)}
                >
                  Department 2/2
                </div>
                <div
                  className={`py-2 px-4 rounded cursor-pointer ${
                    step === 7
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => step >= 7 && setStep(7)}
                >
                  Review
                </div>
              </div>

              {/* Main content area - wider on desktop */}
              <div className="md:col-span-9">
                <div className="bg-white p-6 rounded-lg">{renderStep()}</div>

                {/* Navigation Buttons */}
                <div className="flex justify-between mt-8">
                  {step > 1 ? (
                    <Button
                      type="button"
                      onClick={prevStep}
                      variant="outline"
                      className="flex items-center"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                  ) : (
                    <div></div>
                  )}

                  {step === 7 ? (
                    <Button
                      type="submit"
                      className="flex items-center ml-auto"
                      disabled={isSubmitting}
                    >
                      {isSubmitting
                        ? "Submitting..."
                        : isUpdateMode
                        ? "Update"
                        : "Submit"}
                      <Check className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={nextStep}
                      className="flex items-center ml-auto"
                      disabled={!isStepValid()}
                    >
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Add_Update_StaffPage;
