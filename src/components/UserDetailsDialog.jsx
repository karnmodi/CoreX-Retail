import { React, useState } from "react";
import { X, Pencil, Printer, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import InfoTag from "./InfoTag";
import EmployeeSection from "@/components/small/EmployeeSection";
import {
  getFullName,
  getRoleBadgeColor,
  getStatusColor,
} from "../utils/helpers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";

const UserDetailsDialog = ({ open, onClose, user, sections = {} }) => {
  const [showPersonalDetails, setShowPersonalDetails] = useState(true);
  const [showEmploymentInformation, setShowEmploymentInformation] =
    useState(false);
  const [showDepartmentInformation, setShowDepartmentInformation] =
    useState(false);
  const [showDatesInformation, setShowDatesInformation] = useState(false);
  const navigate = useNavigate();
  if (!user) return null;

  const tooltipText = () => (
    <span>
      Zone - Range <br />
      -----------------
      <br />
      zone a - 0:40k <br />
      zone b - 0:35k <br />
      zone c - 0:30k <br />
      zone d - 0:25k <br />
    </span>
  );

  const InfoItem = ({ label, value, colSpan }) => (
    <div
      className={`bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-200 ${
        colSpan ? `${colSpan}` : ""
      }`}
    >
      <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
      <p
        className="text-base font-semibold text-gray-900 truncate"
        title={value}
      >
        {value || "N/A"}
      </p>
    </div>
  );

  const handleToggle = (section) => {
    setShowPersonalDetails(section === "personal");
    setShowEmploymentInformation(section === "employment");
    setShowDepartmentInformation(section === "department");
    setShowDatesInformation(section === "dates");
  };

  const handleEditClick = () => {
    onClose();
    navigate(`../addUpdate/${user.id}`);
  };

  const handleDeleteClick = () => {
    onClose();
    navigate(`../remove/${user.id}`);
  };

  const handlePrint = () => {
    const printContent = `
      <html>
        <head>
          <title>Employee Details - ${getFullName(
            user.firstName,
            user.lastName
          )}</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              padding: 20px;
              line-height: 1.5;
              max-width: 1000px;
              margin: 0 auto;
            }
            .section-title {
              grid-column: span 2;
              font-size: 1.2rem;
              font-weight: bold;
              color: #1f2937;
              border-bottom: 2px solid #e5e7eb;
              margin-top: 1.5rem;
              padding-bottom: 0.5rem;
            }
            .section-title:first-of-type {
              margin-top: 0;
            }
            .header {
              border-bottom: 2px solid #eee;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .emp-id {
              color: #991b1b;
              font-weight: bold;
            }
            .role {
              background: #e0e7ff;
              padding: 4px 8px;
              border-radius: 4px;
              color: #4338ca;
            }
            .status {
              background: ${
                user.employeeStatus === "active" ? "#dcfce7" : "#fee2e2"
              };
              padding: 4px 8px;
              border-radius: 4px;
              color: ${
                user.employeeStatus === "active" ? "#166534" : "#991b1b"
              };
            }
            .grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 16px;
              margin-top: 20px;
            }
            .info-item {
              background: #f9fafb;
              padding: 12px;
              border-radius: 8px;
            }
            .label {
              color: #6b7280;
              font-size: 0.875rem;
              margin-bottom: 4px;
            }
            .value {
              font-weight: 600;
              color: #111827;
            }
            .notes {
              grid-column: span 2;
              margin-top: 16px;
            }
            @media print {
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>
              <span class="emp-id">#${user.empId}</span>
              ${getFullName(user.firstName, user.lastName)}
            </h1>
            <span class="role">${user.role}</span>
            <span class="status">${user.employeeStatus}</span>
          </div>
          <div class="grid">
            <!-- Personal Information -->
            <div class="section-title">Personal Information</div>
            <div class="section-title"></div>
            
            <div class="info-item">
              <div class="label">First Name</div>
              <div class="value">${user.firstName || "N/A"}</div>
            </div>
            <div class="info-item">
              <div class="label">Last Name</div>
              <div class="value">${user.lastName || "N/A"}</div>
            </div>
            <div class="info-item">
              <div class="label">Email</div>
              <div class="value">${user.email || "N/A"}</div>
            </div>
            <div class="info-item">
              <div class="label">Date of Birth</div>
              <div class="value">${user.dateOfBirth || "N/A"}</div>
            </div>
            <div class="info-item">
              <div class="label">Gender</div>
              <div class="value">${user.genderCode || "N/A"}</div>
            </div>
            <div class="info-item">
              <div class="label">Marital Status</div>
              <div class="value">${user.maritalDesc || "N/A"}</div>
            </div>
            <div class="info-item">
              <div class="label">Race</div>
              <div class="value">${user.raceDesc || "N/A"}</div>
            </div>

            <!-- Employment Information -->
            <div class="section-title">Employment Information</div>
            <div class="section-title"></div>

            <div class="info-item">
              <div class="label">Employee ID</div>
              <div class="value">${user.empId || "N/A"}</div>
            </div>
            <div class="info-item">
              <div class="label">Classification Type</div>
              <div class="value">${user.classificationType || "N/A"}</div>
            </div>
            <div class="info-item">
              <div class="label">Employee Type</div>
              <div class="value">${user.employeeType || "N/A"}</div>
            </div>
            <div class="info-item">
              <div class="label">Employee Status</div>
              <div class="value">${user.employeeStatus || "N/A"}</div>
            </div>
            <div class="info-item">
              <div class="label">Current Employee Rating</div>
              <div class="value">${user.currentEmployeeRating || "N/A"}</div>
            </div>
            <div class="info-item">
              <div class="label">Performance Score</div>
              <div class="value">${user.performanceScore || "N/A"}</div>
            </div>

            <!-- Department Information -->
            <div class="section-title">Department Information</div>
            <div class="section-title"></div>

            <div class="info-item">
              <div class="label">Department</div>
              <div class="value">${user.departmentType || "N/A"}</div>
            </div>
            <div class="info-item">
              <div class="label">Division</div>
              <div class="value">${user.division || "N/A"}</div>
            </div>
            <div class="info-item">
              <div class="label">Location Code</div>
              <div class="value">${user.locationCode || "N/A"}</div>
            </div>
            <div class="info-item">
              <div class="label">State</div>
              <div class="value">${user.state || "N/A"}</div>
            </div>
            <div class="info-item">
              <div class="label">Supervisor</div>
              <div class="value">${user.supervisor || "N/A"}</div>
            </div>
            <div class="info-item">
              <div class="label">Pay Zone</div>
              <div class="value">${user.payZone || "N/A"}</div>
            </div>

            <!-- Dates Information -->
            <div class="section-title">Dates Information</div>
            <div class="section-title"></div>

            <div class="info-item">
              <div class="label">Start Date</div>
              <div class="value">${user.startDate || "N/A"}</div>
            </div>
            <div class="info-item">
              <div class="label">Created At</div>
              <div class="value">${
                user.createdAt
                  ? new Date(user.createdAt.toDate()).toLocaleDateString()
                  : "N/A"
              }</div>
            </div>
            <div class="info-item">
              <div class="label">Exit Date</div>
              <div class="value">${user.exitDate || "N/A"}</div>
            </div>
            <div class="info-item">
              <div class="label">Termination Type</div>
              <div class="value">${user.terminationType || "N/A"}</div>
            </div>

            ${
              user.notes
                ? `
            <div class="info-item notes">
              <div class="label">Notes</div>
              <div class="value">${user.notes}</div>
            </div>
            `
                : ""
            }
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
    };
  };

  return (
    <Dialog open={open} onOpenChange={onClose} className="rounded-xl">
      <DialogContent className="max-w-3xl bg-white rounded-2xl shadow-2xl border-0 rounded-xl overflow-y-auto max-h-[90vh]">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-2xl p-4 sm:p-6 border-b border-gray-200 sticky top-0 z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
              <DialogTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex flex-wrap items-center gap-2">
                <span className="text-red-800">#{user.empId}</span>
                <span>{getFullName(user.firstName, user.lastName)}</span>
              </DialogTitle>
              
              <div className="flex flex-wrap gap-2 mt-2 sm:mt-0">
                <Badge
                  className={`${getRoleBadgeColor(
                    user.role
                  )} px-2 py-1 text-sm sm:text-base font-medium`}
                >
                  {user.role}
                </Badge>
                <Badge
                  label="status"
                  className={`${getStatusColor(
                    user.employeeStatus
                  )} px-2 py-1 text-sm sm:text-base font-medium`}
                >
                  {user.employeeStatus}
                </Badge>
              </div>
            </div>
  
            <div className="flex items-center gap-2 mt-3 sm:mt-0">
              <button // Print Button
                onClick={handlePrint}
                className="hover:bg-white/80 rounded-xl p-2 transition-colors duration-200 text-yellow-600 flex items-center gap-2"
                title={`Print All Details of ${getFullName(
                  user.firstName,
                  user.lastName
                )}`}
              >
                <Printer className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
  
              <button
                onClick={handleEditClick}
                title={`Edit ${getFullName(user.firstName, user.lastName)}`}
                className="hover:bg-white/80 rounded-xl p-2 transition-colors duration-200 text-blue-600 flex items-center gap-2"
              >
                <Pencil className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <button
                onClick={handleDeleteClick}
                title={`Delete ${getFullName(user.firstName, user.lastName)}`}
                className="hover:bg-white/80 rounded-xl p-2 transition-colors duration-200 text-red-600 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
  
              <button // Close Button
                onClick={onClose}
                className="hover:bg-white/80 rounded-xl p-2 transition-colors duration-200"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
  
        <div className="px-4 py-2 sm:px-6 sm:py-4">
          {/* Personal Information of Employee */}
          <EmployeeSection
            title="Personal Information"
            show={showPersonalDetails}
            toggle={() => handleToggle("personal")}
          >
            <InfoItem
              label="Full Name"
              value={`${user.firstName} ${user.lastName}`}
            />
            <InfoItem label="Email" value={user.email} />
            <InfoItem
              label="DOB"
              value={
                user.dateOfBirth
                  ? new Date(user.dateOfBirth).toLocaleDateString("en-GB")
                  : "N/A"
              }
            />
            <InfoItem label="Gender" value={user.genderCode} />
            <InfoItem label="Marital Status" value={user.maritalDesc} />
            <InfoItem label="Race" value={user.raceDesc} />
          </EmployeeSection>
  
          {/* Employee Information Section */}
          <EmployeeSection
            title="Employment Information"
            show={showEmploymentInformation}
            toggle={() => handleToggle("employment")}
          >
            <InfoItem label="Employee ID" value={user.empId} />
            <InfoItem
              label="Classification Type"
              value={user.classificationType}
            />
            <InfoItem label="Employee Type" value={user.employeeType} />
            <InfoItem label="Employee Status" value={user.employeeStatus} />
            <InfoItem
              label="Employee Rating"
              value={user.currentEmployeeRating}
            />
            <InfoItem label="Performance Score" value={user.performanceScore} />
            {user.notes && (
              <div className="col-span-1 sm:col-span-2 lg:col-span-3 bg-gray-50 rounded-xl p-4 mt-2 border border-gray-100">
                <p className="text-sm font-medium text-gray-500 mb-2">Notes</p>
                <p className="text-base text-gray-900 whitespace-pre-wrap">
                  {user.notes}
                </p>
              </div>
            )}
          </EmployeeSection>
  
          {/* Department Information of Employee */}
          <EmployeeSection
            title="Department Information"
            show={showDepartmentInformation}
            toggle={() => handleToggle("department")}
          >
            <InfoItem label="Department" value={user.departmentType} />
            <InfoItem label="Division" value={user.division} />
            <InfoItem label="Location Code" value={user.locationCode} />
            <InfoItem label="State" value={user.state} />
            <InfoItem label="Supervisor" value={user.supervisor} />
            {user.payZone && (
              <InfoItem
                label={
                  <InfoTag
                    text="Payzone"
                    tooltipText={tooltipText()}
                  />
                }
                value={user.payZone}
              />
            )}
          </EmployeeSection>
  
          {/* Dates Information of Employee */}
          <EmployeeSection
            title="Dates Information"
            show={showDatesInformation}
            toggle={() => handleToggle("dates")}
          >
            <InfoItem
              label="Last Update Date"
              value={
                user.updatedAt
                  ? user.updatedAt.toDate().toLocaleDateString("en-GB")
                  : "N/A"
              }
            />
            <InfoItem
              label="Start Date"
              value={
                user.startDate
                  ? new Date(user.startDate).toLocaleDateString("en-GB")
                  : "N/A"
              }
            />
            <InfoItem
              label="Created At"
              value={
                user.createdAt
                  ? user.createdAt.toDate().toLocaleDateString("en-GB")
                  : "N/A"
              }
            />
            <InfoItem
              label="Exit Date"
              value={
                user.exitDate
                  ? new Date(user.exitDate).toLocaleDateString("en-GB")
                  : "N/A"
              }
            />
            <InfoItem label="Termination Type" value={user.terminationType} />
          </EmployeeSection>
        </div>
      </DialogContent>
    </Dialog>
  )
};

export default UserDetailsDialog;
