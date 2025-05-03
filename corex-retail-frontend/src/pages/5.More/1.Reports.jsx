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
  DollarSign,
  FileText,
  ChevronDown,
  Download,
  PieChart,
  Package,
  TrendingUp,
  Filter,
  Loader2,
  Clock,
  BarChart4,
} from "lucide-react";

// Report service - handles API calls
const reportsService = {
  // Get recent reports
  getRecentReports: async () => {
    try {
      const response = await fetch(`/api/report/recent`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch recent reports");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching recent reports:", error);
      throw error;
    }
  },

  // Generate sales report
  generateSalesReport: async (options) => {
    try {
      const { dateRange, reportType, groupBy } = options;

      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        reportType: reportType || "revenue",
        groupBy: groupBy || "daily",
      });

      const response = await fetch(`/api/report/sales?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to generate sales report");
      }

      return await response.json();
    } catch (error) {
      console.error("Error generating sales report:", error);
      throw error;
    }
  },

  // Generate staff report
  generateStaffReport: async (options) => {
    try {
      const { dateRange, reportType, staffMembers } = options;

      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        reportType: reportType || "hours",
      });

      if (staffMembers && staffMembers.length > 0) {
        params.append("staffIds", staffMembers.join(","));
      }

      const response = await fetch(`/api/report/staff?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to generate staff report");
      }

      return await response.json();
    } catch (error) {
      console.error("Error generating staff report:", error);
      throw error;
    }
  },

  // Generate inventory report
  generateInventoryReport: async (options) => {
    try {
      const { reportType, categories } = options;

      const params = new URLSearchParams({
        reportType: reportType || "stock",
      });

      if (categories && categories.length > 0) {
        params.append("categories", categories.join(","));
      }

      const response = await fetch(`/api/report/inventory?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to generate inventory report");
      }

      return await response.json();
    } catch (error) {
      console.error("Error generating inventory report:", error);
      throw error;
    }
  },

  // Generate financial report
  generateFinancialReport: async (options) => {
    try {
      const { dateRange, reportType, detail } = options;

      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        reportType: reportType || "pnl",
        detailLevel: detail || "summary",
      });

      const response = await fetch(`/api/report/financial?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to generate financial report");
      }

      return await response.json();
    } catch (error) {
      console.error("Error generating financial report:", error);
      throw error;
    }
  },

  // Generate operations report
  generateOperationsReport: async (options) => {
    try {
      const { dateRange, reportType, metrics } = options;

      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        reportType: reportType || "efficiency",
      });

      if (metrics && metrics.length > 0) {
        params.append("metrics", metrics.join(","));
      }

      const response = await fetch(`/api/report/operations?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to generate operations report");
      }

      return await response.json();
    } catch (error) {
      console.error("Error generating operations report:", error);
      throw error;
    }
  },

  // Generate custom report
  generateCustomReport: async (options) => {
    try {
      const { dateRange, dataSources } = options;

      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });

      if (dataSources && dataSources.length > 0) {
        params.append("dataSources", dataSources.join(","));
      }

      const response = await fetch(`/api/report/custom?${params}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to generate custom report");
      }

      return await response.json();
    } catch (error) {
      console.error("Error generating custom report:", error);
      throw error;
    }
  },
};

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
          ✕
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
              {option.type === "checkbox" && (
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={option.id}
                    checked={!!selectedOptions[option.id]}
                    onChange={(e) =>
                      setSelectedOptions({
                        ...selectedOptions,
                        [option.id]: e.target.checked,
                      })
                    }
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <label
                    htmlFor={option.id}
                    className="ml-2 text-sm text-gray-700"
                  >
                    {option.checkboxLabel || "Enable"}
                  </label>
                </div>
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
      } catch (error) {
        console.error("Failed to fetch recent reports:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthorized) {
      fetchRecentReports();
    }
  }, [isAuthorized]);

  // Define report types
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
          choices: [
            { label: "Staff Hours Summary", value: "hours" },
            { label: "Schedule Compliance", value: "compliance" },
            { label: "Performance Metrics", value: "performance" },
          ],
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
        {
          id: "includeCharts",
          label: "Include Visualizations",
          type: "checkbox",
          checkboxLabel: "Include charts and graphs",
        },
      ],
    },
    {
      id: "sales",
      title: "Sales Report",
      description: "Analyze sales data by product, category, or time period.",
      icon: DollarSign,
      options: [
        {
          id: "reportType",
          label: "Report Type",
          type: "select",
          choices: [
            { label: "Revenue Summary", value: "revenue" },
            { label: "Sales by Category", value: "category" },
            { label: "Product Performance", value: "product" },
            { label: "Comparison Report", value: "comparison" },
          ],
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
        {
          id: "includeComparison",
          label: "Include Comparison",
          type: "checkbox",
          checkboxLabel: "Compare with previous period",
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
            { label: "Inventory Valuation", value: "valuation" },
            { label: "Product Turnover", value: "turnover" },
            { label: "Low Stock Alert", value: "lowstock" },
          ],
        },
        {
          id: "categories",
          label: "Categories",
          type: "multi-select",
          choices: [
            { label: "All Categories", value: "all" },
            { label: "Beverages", value: "beverages" },
            { label: "Food", value: "food" },
            { label: "Merchandise", value: "merchandise" },
          ],
        },
        {
          id: "includeDetails",
          label: "Include Details",
          type: "checkbox",
          checkboxLabel: "Include detailed product information",
        },
      ],
    },
    {
      id: "financial",
      title: "Financial Report",
      description:
        "Generate financial statements, cost analysis and profit margins.",
      icon: TrendingUp,
      isNew: true,
      options: [
        {
          id: "reportType",
          label: "Report Type",
          type: "select",
          choices: [
            { label: "Profit & Loss Statement", value: "pnl" },
            { label: "Revenue Analysis", value: "revenue" },
            { label: "Cost Analysis", value: "cost" },
            { label: "Margin Report", value: "margin" },
          ],
        },
        {
          id: "detail",
          label: "Detail Level",
          type: "select",
          choices: [
            { label: "Summary", value: "summary" },
            { label: "Detailed", value: "detailed" },
            { label: "Full", value: "full" },
          ],
        },
        {
          id: "includeTrends",
          label: "Include Trends",
          type: "checkbox",
          checkboxLabel: "Include historical trends",
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
          choices: [
            { label: "Staff Efficiency", value: "efficiency" },
            { label: "Resource Utilization", value: "resource" },
            { label: "Operational Costs", value: "costs" },
          ],
        },
        {
          id: "metrics",
          label: "Key Metrics",
          type: "multi-select",
          choices: [
            { label: "Productivity", value: "productivity" },
            { label: "Sales per Hour", value: "sales_per_hour" },
            { label: "Customer Wait Time", value: "wait_time" },
            { label: "Inventory Turnover", value: "turnover" },
          ],
        },
      ],
    },
    {
      id: "custom",
      title: "Custom Report",
      description:
        "Create a fully customized report with your chosen metrics and data.",
      icon: FileText,
      options: [
        {
          id: "dataSources",
          label: "Data Sources",
          type: "multi-select",
          choices: [
            { label: "Sales", value: "sales" },
            { label: "Staff", value: "staff" },
            { label: "Inventory", value: "inventory" },
            { label: "Customer", value: "customer" },
            { label: "Financial", value: "financial" },
          ],
        },
        {
          id: "format",
          label: "Output Format",
          type: "select",
          choices: [
            { label: "JSON Data", value: "json" },
            { label: "CSV Data", value: "csv" },
          ],
        },
        {
          id: "includeRawData",
          label: "Include Raw Data",
          type: "checkbox",
          checkboxLabel: "Attach raw data for further analysis",
        },
      ],
    },
  ];

  // Handle report generation
  const handleGenerateReport = async (options) => {
    if (!activeReport) return;

    setIsGenerating(true);

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
        case "custom":
          result = await reportsService.generateCustomReport(options);
          break;
        default:
          throw new Error("Unknown report type");
      }

      console.log("Report data received:", result);
      setReportData(result);

      // Store as a download if requested
      if (options.format === "csv") {
        const reportType = options.reportType || "general";
        const fileName = `${activeReport.id}_${reportType}_report_${new Date()
          .toISOString()
          .slice(0, 10)}.csv`;

        console.log(`Report ${fileName} would be downloaded here`);
        alert(`Report successfully generated: ${fileName}`);
      } else {
        // Show success message for JSON data
        alert(
          `Report generated successfully with ${
            result.data?.length || 0
          } data points`
        );
      }

      // Refresh recent reports list
      const updatedReports = await reportsService.getRecentReports();
      setRecentReports(updatedReports.reports || []);
    } catch (error) {
      console.error("Error generating report:", error);
      alert(`Failed to generate report: ${error.message}`);
    } finally {
      setIsGenerating(false);
      setActiveReport(null);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
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
              <DollarSign className="h-6 w-6" />
            </div>
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
              Revenue
            </span>
          </div>
          <h3 className="text-2xl font-bold mb-1">
            £{dashboardData?.totalRevenue?.toFixed(2) || "0.00"}
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
              } catch (error) {
                console.error("Failed to refresh reports:", error);
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
                    {report.createdBy || "You"}
                  </div>
                  <div className="col-span-1">
                    <button
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => {
                        // In a real app, you would implement a proper download function
                        alert(`Report would be downloaded: ${report.id}`);
                      }}
                    >
                      <Download className="h-4 w-4" />
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

      {/* Report Data Display - This would show the generated report data */}
      {reportData && (
        <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              {reportData.reportType} Report
            </h2>
            <button
              onClick={() => setReportData(null)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="mb-4">
            <div className="flex gap-4 mb-2">
              <div className="bg-gray-100 rounded-lg p-3 flex-1">
                <p className="text-xs text-gray-500 mb-1">Date Range</p>
                <p className="font-medium">
                  {reportData.dateRange?.startDate} to{" "}
                  {reportData.dateRange?.endDate}
                </p>
              </div>
              <div className="bg-gray-100 rounded-lg p-3 flex-1">
                <p className="text-xs text-gray-500 mb-1">Generated At</p>
                <p className="font-medium">
                  {new Date(reportData.generatedAt).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Summary section */}
          {reportData.summary && (
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
                    <p className="font-medium">
                      {typeof value === "number"
                        ? key.toLowerCase().includes("price") ||
                          key.toLowerCase().includes("revenue") ||
                          key.toLowerCase().includes("value") ||
                          key.toLowerCase().includes("cost")
                          ? `£${value.toFixed(2)}`
                          : value.toLocaleString()
                        : value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data table - shows the actual report data */}
          {reportData.data && reportData.data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {Object.keys(reportData.data[0]).map((key) => (
                      <th
                        key={key}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {reportData.data.map((row, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      {Object.entries(row).map(([key, value]) => (
                        <td
                          key={`${index}-${key}`}
                          className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                        >
                          {typeof value === "object"
                            ? JSON.stringify(value)
                            : typeof value === "number"
                            ? key.toLowerCase().includes("price") ||
                              key.toLowerCase().includes("revenue") ||
                              key.toLowerCase().includes("value") ||
                              key.toLowerCase().includes("cost")
                              ? `£${value.toFixed(2)}`
                              : value.toLocaleString()
                            : value}
                        </td>
                      ))}
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

          <div className="mt-6 flex justify-end">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center"
              onClick={() => {
                alert("Report would be downloaded as a file");
              }}
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
