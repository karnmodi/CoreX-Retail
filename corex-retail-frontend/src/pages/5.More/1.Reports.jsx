import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../configs/AuthContext";
import { useRoster } from "../../configs/RostersContext";
import { useStaff } from "../../configs/StaffContext";
import { useSales } from "../../configs/SalesContext";
import { useInventory } from "../../configs/InventoryContext";
import {
  Calendar,
  Users,
  PoundSterling,
  FileText,
  ChevronDown,
  Download,
  PieChart,
  Package,
  TrendingUp,
  Filter,
  Loader2,
  BarChart4,
  Printer,
  Share2,
  Eye,
  X,
} from "lucide-react";
import reportsService from "../../services/reportAPI";

// Report Card Component
const ReportCard = ({
  icon: Icon,
  title,
  description,
  onClick,
  isNew = false,
}) => (
  <button
    onClick={onClick}
    className="w-full bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 text-left"
  >
    <div className="p-6 flex flex-col h-full">
      <div className="flex items-start justify-between mb-3">
        <div className="bg-blue-50 rounded-lg p-3">
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
        {isNew && (
          <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-1 rounded-full">
            New
          </span>
        )}
      </div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-4 flex-1">{description}</p>
      <div className="text-blue-600 text-sm font-medium flex items-center">
        Generate Report
        <ChevronDown className="h-4 w-4 ml-1" />
      </div>
    </div>
  </button>
);

// Report Options Panel
const ReportOptions = ({
  isOpen,
  title,
  onClose,
  onGenerate,
  options,
  loading,
}) => {
  const [selectedOptions, setSelectedOptions] = useState({});
  const [dateRange, setDateRange] = useState({
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  // Handle generation
  const handleGenerate = () => {
    onGenerate({
      ...selectedOptions,
      dateRange,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-bold text-gray-800 mb-4">{title}</h2>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <div className="flex gap-2">
              <div className="w-1/2">
                <label className="block text-xs text-gray-500 mb-1">From</label>
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, startDate: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                />
              </div>
              <div className="w-1/2">
                <label className="block text-xs text-gray-500 mb-1">To</label>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, endDate: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                />
              </div>
            </div>
          </div>

          {options.map((option) => (
            <div key={option.id}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {option.label}
              </label>
              {option.type === "select" && (
                <select
                  value={selectedOptions[option.id] || ""}
                  onChange={(e) =>
                    setSelectedOptions({
                      ...selectedOptions,
                      [option.id]: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                >
                  <option value="">Select {option.label}</option>
                  {option.choices.map((choice) => (
                    <option key={choice.value} value={choice.value}>
                      {choice.label}
                    </option>
                  ))}
                </select>
              )}
              {option.type === "multi-select" && (
                <select
                  multiple
                  value={selectedOptions[option.id] || []}
                  onChange={(e) => {
                    const values = Array.from(
                      e.target.selectedOptions,
                      (option) => option.value
                    );
                    setSelectedOptions({
                      ...selectedOptions,
                      [option.id]: values,
                    });
                  }}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm h-32"
                >
                  {option.choices.map((choice) => (
                    <option key={choice.value} value={choice.value}>
                      {choice.label}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Generating...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Reports Page Component
const ReportsPage = () => {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const { staff } = useStaff();
  const { employees } = useRoster();
  const { dashboardData } = useSales();
  const { inventoryValue } = useInventory();

  const [activeReport, setActiveReport] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [recentReports, setRecentReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [error, setError] = useState(null);
  const [showCharts, setShowCharts] = useState(false);

  // Check authorization
  useEffect(() => {
    if (userData) {
      const authorizedRoles = ["admin", "manager", "store manager"];
      setIsAuthorized(authorizedRoles.includes(userData.role?.toLowerCase()));

      if (!authorizedRoles.includes(userData.role?.toLowerCase())) {
        navigate("/dashboard");
      }
    }
  }, [userData, navigate]);

  // Fetch recent reports
  useEffect(() => {
    const fetchRecentReports = async () => {
      if (!isAuthorized) return;

      try {
        setIsLoading(true);
        const data = await reportsService.getRecentReports();
        setRecentReports(data.reports || []);
        setError(null);
      } catch (error) {
        console.error("Failed to fetch recent reports:", error);
        setError("Failed to fetch recent reports. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthorized) {
      fetchRecentReports();
    }
  }, [isAuthorized]);

  // Define report types - aligned with controller functionality
  const reportTypes = [
    {
      id: "staff",
      title: "Staff Report",
      description:
        "Generate reports on staff hours, schedules, and performance metrics.",
      icon: Users,
      options: [
        {
          id: "reportType",
          label: "Report Type",
          type: "select",
          choices: [{ label: "Staff Hours Summary", value: "hours" }],
        },
        {
          id: "staffMembers",
          label: "Staff Members",
          type: "multi-select",
          choices: (employees || []).map((employee) => ({
            label: `${employee.firstName} ${employee.lastName}`,
            value: employee.id,
          })),
        },
      ],
    },
    {
      id: "sales",
      title: "Sales Report",
      description: "Analyze sales data by product, category, or time period.",
      icon: PoundSterling,
      options: [
        {
          id: "reportType",
          label: "Report Type",
          type: "select",
          choices: [{ label: "Revenue Summary", value: "revenue" }],
        },
        {
          id: "groupBy",
          label: "Group By",
          type: "select",
          choices: [
            { label: "Daily", value: "daily" },
            { label: "Weekly", value: "weekly" },
            { label: "Monthly", value: "monthly" },
          ],
        },
      ],
    },
    {
      id: "inventory",
      title: "Inventory Report",
      description:
        "Get insights on stock levels, valuation and product movement.",
      icon: Package,
      options: [
        {
          id: "reportType",
          label: "Report Type",
          type: "select",
          choices: [
            { label: "Stock Levels", value: "stock" },
            { label: "Low Stock Alert", value: "lowstock" },
          ],
        },
        {
          id: "categories",
          label: "Categories",
          type: "multi-select",
          choices: [
            { label: "All Categories", value: "all" },
            { label: "Phones", value: "Phones" },
            { label: "Tabs", value: "Tabs" },
            { label: "Watches", value: "Watches" },
            { label: "Earbuds", value: "Earbuds" },
            { label: "Others", value: "Others" },
          ],
        },
      ],
    },
    {
      id: "financial",
      title: "Financial Report",
      description:
        "Generate financial statements, cost analysis and profit margins.",
      icon: TrendingUp,
      options: [
        {
          id: "reportType",
          label: "Report Type",
          type: "select",
          choices: [{ label: "Profit & Loss Statement", value: "pnl" }],
        },
        {
          id: "detail",
          label: "Detail Level",
          type: "select",
          choices: [{ label: "Full", value: "full" }],
        },
      ],
    },
    {
      id: "operations",
      title: "Operations Report",
      description:
        "Analyze operational efficiency, staffing, and resource allocation.",
      icon: BarChart4,
      options: [
        {
          id: "reportType",
          label: "Report Type",
          type: "select",
          choices: [{ label: "Staff Efficiency", value: "efficiency" }],
        },
        {
          id: "metrics",
          label: "Key Metrics",
          type: "multi-select",
          choices: [
            { label: "Productivity", value: "productivity" },
            { label: "Sales per Hour", value: "sales_per_hour" },
          ],
        },
      ],
    },
  ];

  // Handle report generation
  const handleGenerateReport = async (options) => {
    if (!activeReport) return;

    setIsGenerating(true);
    setError(null);

    try {
      console.log("Generating report:", activeReport.id);
      console.log("With options:", options);

      let result;
      const reportId = activeReport.id;

      switch (reportId) {
        case "sales":
          result = await reportsService.generateSalesReport(options);
          break;
        case "staff":
          result = await reportsService.generateStaffReport(options);
          break;
        case "inventory":
          result = await reportsService.generateInventoryReport(options);
          break;
        case "financial":
          result = await reportsService.generateFinancialReport(options);
          break;
        case "operations":
          result = await reportsService.generateOperationsReport(options);
          break;

        default:
          throw new Error("Unknown report type");
      }

      console.log("Report data received:", result);
      setReportData(result);

      // Refresh recent reports list
      const updatedReports = await reportsService.getRecentReports();
      setRecentReports(updatedReports.reports || []);
    } catch (error) {
      console.error("Error generating report:", error);
      setError(`Failed to generate report: ${error.message}`);
      alert(`Failed to generate report: ${error.message}`);
    } finally {
      setIsGenerating(false);
      setActiveReport(null);
    }
  };

  // Handle report download - client-side implementation
  const handleDownloadReport = (report) => {
    if (!report || !report.data) {
      alert("No report data available to download");
      return;
    }

    try {
      // Convert report data to CSV
      const csvData = convertToCSV(report.data);

      // Create blob and download
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const fileName = `${report.reportType || "report"}_${
        new Date().toISOString().split("T")[0]
      }.csv`;

      link.setAttribute("href", url);
      link.setAttribute("download", fileName);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading report:", error);
      alert("Failed to download report. Please try again.");
    }
  };

  // Convert JSON data to CSV format
  const convertToCSV = (data) => {
    if (!data || !data.length) return "";

    // Get headers (excluding nested objects)
    const headers = Object.keys(data[0]).filter(
      (key) => typeof data[0][key] !== "object" || data[0][key] === null
    );

    // Create CSV rows
    const csvRows = [];

    // Add header row
    csvRows.push(headers.join(","));

    // Add data rows
    for (const row of data) {
      const values = headers.map((header) => {
        const value = row[header];

        // Handle different data types
        if (value === null || value === undefined) return "";
        if (typeof value === "string") return `"${value.replace(/"/g, '""')}"`;
        return value;
      });

      csvRows.push(values.join(","));
    }

    return csvRows.join("\n");
  };

  // Handle print report
  const handlePrintReport = () => {
    if (!reportData) return;

    // Create a print-friendly version
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      alert("Please allow pop-ups to print reports");
      return;
    }

    // Generate print content
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportData.reportType} Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1, h2 { color: #333; }
          table { border-collapse: collapse; width: 100%; margin: 20px 0; }
          th { background-color: #f2f2f2; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          .summary { background-color: #f7f7f7; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
          .meta { display: flex; gap: 20px; margin-bottom: 20px; }
          .meta-item { background-color: #f2f2f2; padding: 10px; border-radius: 5px; }
          @media print {
            body { margin: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>${
          reportData.reportType
            ? reportData.reportType.charAt(0).toUpperCase() +
              reportData.reportType.slice(1)
            : "Report"
        }</h1>
        
        <div class="meta">
          ${
            reportData.dateRange
              ? `
            <div class="meta-item">
              <div style="font-size:12px;color:#666;">Date Range</div>
              <div>${reportData.dateRange.startDate} to ${reportData.dateRange.endDate}</div>
            </div>
          `
              : ""
          }
          
          <div class="meta-item">
            <div style="font-size:12px;color:#666;">Generated At</div>
            <div>${new Date(reportData.generatedAt).toLocaleString()}</div>
          </div>
          
          ${
            reportData.groupBy
              ? `
            <div class="meta-item">
              <div style="font-size:12px;color:#666;">Grouped By</div>
              <div>${reportData.groupBy}</div>
            </div>
          `
              : ""
          }
        </div>
        
        ${
          reportData.summary && Object.keys(reportData.summary).length > 0
            ? `
          <div class="summary">
            <h2>Summary</h2>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 15px;">
              ${Object.entries(reportData.summary)
                .map(
                  ([key, value]) => `
                <div>
                  <div style="font-size:12px;color:#666;">${key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}</div>
                  <div style="font-weight:bold;">
                    ${
                      typeof value === "number" &&
                      (key.toLowerCase().includes("price") ||
                        key.toLowerCase().includes("revenue") ||
                        key.toLowerCase().includes("value") ||
                        key.toLowerCase().includes("cost"))
                        ? "£" + value.toFixed(2)
                        : typeof value === "number"
                        ? value.toLocaleString()
                        : value
                    }
                  </div>
                </div>
              `
                )
                .join("")}
            </div>
          </div>
        `
            : ""
        }
        
        ${
          reportData.data && reportData.data.length > 0
            ? `
          <h2>Data</h2>
          <table>
            <thead>
              <tr>
                ${Object.keys(reportData.data[0])
                  .filter(
                    (key) =>
                      typeof reportData.data[0][key] !== "object" ||
                      reportData.data[0][key] === null
                  )
                  .map(
                    (key) =>
                      `<th>${key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}</th>`
                  )
                  .join("")}
              </tr>
            </thead>
            <tbody>
              ${reportData.data
                .map(
                  (row, index) => `
                <tr>
                  ${Object.entries(row)
                    .filter(
                      ([key, value]) =>
                        typeof value !== "object" || value === null
                    )
                    .map(([key, value]) => {
                      const isCurrency =
                        key.toLowerCase().includes("price") ||
                        key.toLowerCase().includes("revenue") ||
                        key.toLowerCase().includes("value") ||
                        key.toLowerCase().includes("cost");

                      return `<td>
                        ${
                          typeof value === "number"
                            ? isCurrency
                              ? "£" + value.toFixed(2)
                              : value.toLocaleString()
                            : value || "N/A"
                        }
                      </td>`;
                    })
                    .join("")}
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        `
            : "<p>No data available for this report</p>"
        }
        
        <button onclick="window.print()">Print Report</button>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);

    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Format currency values
  const formatCurrency = (value) => {
    if (typeof value !== "number") return value;
    return `£${value.toFixed(2)}`;
  };

  // Determine if a value should be displayed as currency
  const isCurrency = (key) => {
    return (
      key.toLowerCase().includes("price") ||
      key.toLowerCase().includes("revenue") ||
      key.toLowerCase().includes("sales") ||
      key.toLowerCase().includes("cost") ||
      key.toLowerCase().includes("value")
    );
  };

  // Format value based on key name and value type
  const formatValue = (key, value) => {
    if (value === null || value === undefined) return "N/A";

    if (typeof value === "object") {
      return JSON.stringify(value);
    }

    if (typeof value === "number") {
      return isCurrency(key) ? formatCurrency(value) : value.toLocaleString();
    }

    return value;
  };

  if (!isAuthorized) {
    return <div className="p-8 text-center">Checking authorization...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Reports</h1>
        <p className="text-gray-600">
          Generate detailed reports on various aspects of your business
        </p>
      </div>

      {/* Error display */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-md">
          <p>{error}</p>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 rounded-full p-3">
              <Users className="h-6 w-6" />
            </div>
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
              Staff
            </span>
          </div>
          <h3 className="text-2xl font-bold mb-1">{staff?.length || 0}</h3>
          <p className="text-sm text-blue-100">Active team members</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 rounded-full p-3">
              <PoundSterling className="h-6 w-6" />
            </div>
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
              Revenue
            </span>
          </div>
          <h3 className="text-2xl font-bold mb-1">
            £{dashboardData?.totalRevenue?.toFixed(2) || "85128541.00"}
          </h3>
          <p className="text-sm text-green-100">Monthly revenue</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 rounded-full p-3">
              <Package className="h-6 w-6" />
            </div>
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
              Inventory
            </span>
          </div>
          <h3 className="text-2xl font-bold mb-1">
            £{inventoryValue?.currentValue?.toFixed(2) || "0.00"}
          </h3>
          <p className="text-sm text-purple-100">Current inventory value</p>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((report) => (
          <ReportCard
            key={report.id}
            title={report.title}
            description={report.description}
            icon={report.icon}
            isNew={report.isNew}
            onClick={() => setActiveReport(report)}
          />
        ))}
      </div>

      {/* Recently Generated Reports */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Recent Reports</h2>
          <button
            className="text-blue-600 text-sm flex items-center"
            onClick={async () => {
              try {
                setIsLoading(true);
                const data = await reportsService.getRecentReports();
                setRecentReports(data.reports || []);
                setError(null);
              } catch (error) {
                console.error("Failed to refresh reports:", error);
                setError("Failed to refresh reports. Please try again.");
              } finally {
                setIsLoading(false);
              }
            }}
          >
            Refresh <ChevronDown className="h-4 w-4 ml-1" />
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 text-sm font-medium text-gray-500 grid grid-cols-12 gap-4">
            <div className="col-span-5">Report Name</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2">Generated</div>
            <div className="col-span-2">Generated By</div>
            <div className="col-span-1">Action</div>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
              <p className="text-gray-500">Loading recent reports...</p>
            </div>
          ) : recentReports.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No recent reports found. Generate a report to see it here.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {recentReports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 text-sm grid grid-cols-12 gap-4 items-center hover:bg-gray-50"
                >
                  <div className="col-span-5 font-medium text-gray-800">
                    {report.name || `${report.reportType} Report`}
                  </div>
                  <div className="col-span-2 text-gray-600">
                    {report.reportType}
                  </div>
                  <div className="col-span-2 text-gray-600">
                    {formatDate(report.generatedAt)}
                  </div>
                  <div className="col-span-2 text-gray-600">
                    {report.createdBy.firstName || "You"}
                  </div>
                  <div className="col-span-1 flex space-x-2">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => {
                        setReportData(report);
                      }}
                      title="View"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Report Options Modal */}
      {activeReport && (
        <ReportOptions
          isOpen={!!activeReport}
          title={`Generate ${activeReport.title}`}
          onClose={() => setActiveReport(null)}
          onGenerate={handleGenerateReport}
          options={activeReport.options || []}
          loading={isGenerating}
        />
      )}

      {/* Report Data Display - Shows the generated report data */}
      {reportData && (
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              {reportData.reportType
                ? `${reportData.reportType
                    .charAt(0)
                    .toUpperCase()}${reportData.reportType.slice(1)} Report`
                : "Report"}
            </h2>
            <div className="flex space-x-2">
              <button
                onClick={handlePrintReport}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                title="Print Report"
              >
                <Printer className="h-5 w-5" />
              </button>
              <button
                onClick={() => handleDownloadReport(reportData)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                title="Download Report"
              >
                <Download className="h-5 w-5" />
              </button>
              <button
                onClick={() => setReportData(null)}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
                title="Close Report"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex gap-4 mb-2">
              {reportData.dateRange && (
                <div className="bg-gray-100 rounded-lg p-3 flex-1">
                  <p className="text-xs text-gray-500 mb-1">Date Range</p>
                  <p className="font-medium">
                    {formatDate(reportData.dateRange.startDate)} to{" "}
                    {formatDate(reportData.dateRange.endDate)}
                  </p>
                </div>
              )}
              <div className="bg-gray-100 rounded-lg p-3 flex-1">
                <p className="text-xs text-gray-500 mb-1">Generated At</p>
                <p className="font-medium">
                  {formatDate(reportData.generatedAt)}
                </p>
              </div>
              {reportData.groupBy && (
                <div className="bg-gray-100 rounded-lg p-3 flex-1">
                  <p className="text-xs text-gray-500 mb-1">Grouped By</p>
                  <p className="font-medium capitalize">{reportData.groupBy}</p>
                </div>
              )}
            </div>
          </div>

          {/* Summary section */}
          {reportData.summary && Object.keys(reportData.summary).length > 0 && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-md font-semibold text-blue-800 mb-2">
                Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(reportData.summary).map(([key, value]) => (
                  <div key={key}>
                    <p className="text-xs text-gray-500 mb-1">
                      {key
                        .replace(/([A-Z])/g, " $1")
                        .replace(/^./, (str) => str.toUpperCase())}
                    </p>
                    <p className="font-medium">{formatValue(key, value)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data table - shows the actual report data */}
          {reportData.data && reportData.data.length > 0 ? (
            <div className="overflow-x-auto">
              <h3 className="text-md font-semibold text-gray-800 mb-2">
                Report Data
              </h3>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(reportData.data[0]).map((key) => {
                      // Skip rendering nested objects as separate columns
                      if (
                        typeof reportData.data[0][key] === "object" &&
                        reportData.data[0][key] !== null
                      )
                        return null;

                      return (
                        <th
                          key={key}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {key
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.data.map((row, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      {Object.entries(row).map(([key, value]) => {
                        // Skip rendering nested objects as separate cells
                        if (typeof value === "object" && value !== null)
                          return null;

                        return (
                          <td
                            key={`${index}-${key}`}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                          >
                            {typeof value === "number"
                              ? isCurrency(key)
                                ? formatCurrency(value)
                                : value.toLocaleString()
                              : value || "N/A"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center p-8 text-gray-500">
              No data available for this report
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-3">
            <button
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg flex items-center"
              onClick={() => setReportData(null)}
            >
              Close
            </button>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center"
              onClick={() => handleDownloadReport(reportData)}
            >
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
