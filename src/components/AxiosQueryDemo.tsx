import React, { useState, useEffect } from "react";
import { useAutoRepairs } from "../hooks/useAutoRepairs";

// Define filter types locally since they may not exist in services yet
type VehicleFilters = {
  make?: string;
  model?: string;
  year?: number;
  search?: string;
};

type RepairJobFilters = {
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  estimatedCostMin?: number;
  estimatedCostMax?: number;
  search?: string;
};

type CustomerFilters = {
  search?: string;
  city?: string;
  state?: string;
};

const AxiosQueryDemo: React.FC = () => {
  const {
    isLoading,
    searchResults,
    searchAll,
    loadVehicles,
    loadRepairOrders,
    loadCustomers,
    vehicles,
    customers,
    repairOrders,
  } = useAutoRepairs();

  // Create placeholder functions for missing functionality
  const loadVehiclesWithFilters = async (
    filters: any,
    pagination?: any,
    sorting?: any
  ) => {
    console.log("Loading vehicles with filters:", filters, pagination, sorting);
    return await loadVehicles(filters);
  };

  const loadRepairJobsWithFilters = async (
    filters: any,
    pagination?: any,
    sorting?: any
  ) => {
    console.log(
      "Loading repair jobs with filters:",
      filters,
      pagination,
      sorting
    );
    return await loadRepairOrders(filters);
  };

  const loadCustomersWithFilters = async (
    filters: any,
    pagination?: any,
    sorting?: any
  ) => {
    console.log(
      "Loading customers with filters:",
      filters,
      pagination,
      sorting
    );
    return await loadCustomers(filters);
  };

  const getJobsByStatus = async (status: string) => {
    console.log("Getting jobs by status:", status);
    return repairOrders.filter((job) => job.status === status);
  };

  const getJobsByDateRange = async (from: string, to: string) => {
    console.log("Getting jobs by date range:", from, to);
    return {
      data: repairOrders.filter((job) => {
        const jobDate = job.createdAt ? new Date(job.createdAt) : new Date();
        const fromDate = new Date(from);
        const toDate = new Date(to);
        return jobDate >= fromDate && jobDate <= toDate;
      }),
    };
  };

  const getJobsByPriceRange = async (min: number, max: number) => {
    console.log("Getting jobs by price range:", min, max);
    return {
      data: repairOrders.filter((job) => {
        const cost = (job as any).totalAmount || (job as any).totalCost || 0;
        return cost >= min && cost <= max;
      }),
    };
  };

  const getVehiclesByMakeModel = async (make: string, model?: string) => {
    console.log("Getting vehicles by make/model:", make, model);
    return {
      data: vehicles.filter(
        (vehicle) =>
          vehicle.make?.toLowerCase() === make.toLowerCase() &&
          (!model || vehicle.model?.toLowerCase() === model.toLowerCase())
      ),
    };
  };

  const getDashboardSummary = async () => {
    console.log("Getting dashboard summary");
    return {
      totalVehicles: vehicles.length,
      totalCustomers: customers.length,
      activeJobs: repairOrders.filter((job) => job.status === "in_progress")
        .length,
      revenueThisMonth: repairOrders.reduce(
        (sum, job) =>
          sum + ((job as any).totalAmount || (job as any).totalCost || 0),
        0
      ),
    };
  };

  const getRevenueReport = async (from: string, to: string) => {
    console.log("Getting revenue report:", from, to);
    const jobsInRange = repairOrders.filter((job) => {
      const jobDate = job.createdAt ? new Date(job.createdAt) : new Date();
      const fromDate = new Date(from);
      const toDate = new Date(to);
      return jobDate >= fromDate && jobDate <= toDate;
    });

    const totalRevenue = jobsInRange.reduce(
      (sum, job) =>
        sum + ((job as any).totalAmount || (job as any).totalCost || 0),
      0
    );
    return {
      totalRevenue,
      jobCount: jobsInRange.length,
      averageJobValue:
        jobsInRange.length > 0 ? totalRevenue / jobsInRange.length : 0,
    };
  };

  const getJobStatistics = async (filters: any) => {
    console.log("Getting job statistics:", filters);
    return {
      total: repairOrders.length,
      pending: repairOrders.filter((job) => job.status === "draft").length, // Using 'draft' as the initial status
      completed: repairOrders.filter((job) => job.status === "completed")
        .length,
    };
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [filterResults, setFilterResults] = useState<any>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);

  // Vehicle filters
  const [vehicleFilters, setVehicleFilters] = useState<VehicleFilters>({
    make: "",
    model: "",
    year: undefined,
    search: "",
  });

  // Repair job filters
  const [jobFilters, setJobFilters] = useState<RepairJobFilters>({
    status: undefined,
    dateFrom: "",
    dateTo: "",
    estimatedCostMin: undefined,
    estimatedCostMax: undefined,
    search: "",
  });

  // Customer filters
  const [customerFilters, setCustomerFilters] = useState<CustomerFilters>({
    search: "",
    city: "",
    state: "",
  });

  useEffect(() => {
    // Load dashboard data on component mount
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await getDashboardSummary();
      setDashboardData(data);
    } catch (error) {
      console.error("Error loading dashboard:", error);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      await searchAll(searchQuery);
    }
  };

  const handleVehicleFilter = async () => {
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(vehicleFilters).filter(
          ([_, value]) => value !== "" && value !== undefined
        )
      );

      const result = await loadVehiclesWithFilters(
        cleanFilters,
        { page: 1, limit: 20 },
        { sortBy: "make", sortOrder: "asc" }
      );

      setFilterResults({ type: "vehicles", data: result });
    } catch (error) {
      console.error("Error filtering vehicles:", error);
    }
  };

  const handleJobFilter = async () => {
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(jobFilters).filter(
          ([_, value]) => value !== "" && value !== undefined
        )
      );

      const result = await loadRepairJobsWithFilters(
        cleanFilters,
        { page: 1, limit: 20 },
        { sortBy: "createdAt", sortOrder: "desc" }
      );

      setFilterResults({ type: "jobs", data: result });
    } catch (error) {
      console.error("Error filtering jobs:", error);
    }
  };

  const handleCustomerFilter = async () => {
    try {
      const cleanFilters = Object.fromEntries(
        Object.entries(customerFilters).filter(
          ([_, value]) => value !== "" && value !== undefined
        )
      );

      const result = await loadCustomersWithFilters(
        cleanFilters,
        { page: 1, limit: 20 },
        { sortBy: "name", sortOrder: "asc" }
      );

      setFilterResults({ type: "customers", data: result });
    } catch (error) {
      console.error("Error filtering customers:", error);
    }
  };

  const handleQuickFilters = async (filterType: string) => {
    try {
      let result;

      switch (filterType) {
        case "pending-jobs":
          result = await getJobsByStatus("pending");
          setFilterResults({
            type: "quick-filter",
            data: result,
            label: "Pending Jobs",
          });
          break;

        case "completed-jobs":
          result = await getJobsByStatus("completed");
          setFilterResults({
            type: "quick-filter",
            data: result,
            label: "Completed Jobs",
          });
          break;

        case "this-week":
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          result = await getJobsByDateRange(
            weekAgo.toISOString().split("T")[0],
            new Date().toISOString().split("T")[0]
          );
          setFilterResults({
            type: "quick-filter",
            data: result.data,
            label: "Jobs This Week",
          });
          break;

        case "high-value":
          result = await getJobsByPriceRange(500, 10000);
          setFilterResults({
            type: "quick-filter",
            data: result.data,
            label: "High Value Jobs (>$500)",
          });
          break;

        case "toyota-vehicles":
          result = await getVehiclesByMakeModel("Toyota");
          setFilterResults({
            type: "quick-filter",
            data: result.data,
            label: "Toyota Vehicles",
          });
          break;

        default:
          break;
      }
    } catch (error) {
      console.error("Error applying quick filter:", error);
    }
  };

  const handleGenerateReport = async () => {
    try {
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      const [revenueReport, jobStats] = await Promise.all([
        getRevenueReport(
          lastMonth.toISOString().split("T")[0],
          new Date().toISOString().split("T")[0]
        ),
        getJobStatistics({ dateFrom: lastMonth.toISOString().split("T")[0] }),
      ]);

      setFilterResults({
        type: "report",
        data: { revenue: revenueReport, stats: jobStats },
        label: "Monthly Report",
      });
    } catch (error) {
      console.error("Error generating report:", error);
    }
  };

  return (
    <div className="card" style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <h2>🚀 Axios + Query String Demo</h2>

      {/* Dashboard Summary */}
      {dashboardData && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "10px",
            marginBottom: "20px",
            padding: "15px",
            backgroundColor: "#f5f5f5",
            borderRadius: "5px",
          }}
        >
          <div>
            <strong>Vehicles:</strong> {dashboardData.totalVehicles}
          </div>
          <div>
            <strong>Customers:</strong> {dashboardData.totalCustomers}
          </div>
          <div>
            <strong>Active Jobs:</strong> {dashboardData.activeJobs}
          </div>
          <div>
            <strong>Monthly Revenue:</strong> ${dashboardData.revenueThisMonth}
          </div>
        </div>
      )}

      {/* Search Section */}
      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          border: "1px solid #ddd",
          borderRadius: "5px",
        }}
      >
        <h3>🔍 Global Search</h3>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search across vehicles, customers, and jobs..."
            style={{
              flex: 1,
              padding: "8px",
              borderRadius: "3px",
              border: "1px solid #ccc",
            }}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>

        {(searchResults.vehicles.length > 0 ||
          searchResults.customers.length > 0 ||
          searchResults.repairOrders.length > 0) && (
          <div style={{ marginTop: "10px", fontSize: "0.9em" }}>
            Found: {searchResults.vehicles.length} vehicles,{" "}
            {searchResults.customers.length} customers,{" "}
            {searchResults.repairOrders.length} repair orders
          </div>
        )}
      </div>

      {/* Vehicle Filters */}
      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          border: "1px solid #ddd",
          borderRadius: "5px",
        }}
      >
        <h3>🚗 Vehicle Filters</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "10px",
            marginBottom: "10px",
          }}
        >
          <input
            type="text"
            placeholder="Make (e.g., Toyota)"
            value={vehicleFilters.make || ""}
            onChange={(e) =>
              setVehicleFilters({ ...vehicleFilters, make: e.target.value })
            }
            style={{
              padding: "6px",
              borderRadius: "3px",
              border: "1px solid #ccc",
            }}
          />
          <input
            type="text"
            placeholder="Model (e.g., Camry)"
            value={vehicleFilters.model || ""}
            onChange={(e) =>
              setVehicleFilters({ ...vehicleFilters, model: e.target.value })
            }
            style={{
              padding: "6px",
              borderRadius: "3px",
              border: "1px solid #ccc",
            }}
          />
          <input
            type="number"
            placeholder="Year"
            value={vehicleFilters.year || ""}
            onChange={(e) =>
              setVehicleFilters({
                ...vehicleFilters,
                year: e.target.value ? parseInt(e.target.value) : undefined,
              })
            }
            style={{
              padding: "6px",
              borderRadius: "3px",
              border: "1px solid #ccc",
            }}
          />
          <input
            type="text"
            placeholder="Search VIN/License"
            value={vehicleFilters.search || ""}
            onChange={(e) =>
              setVehicleFilters({ ...vehicleFilters, search: e.target.value })
            }
            style={{
              padding: "6px",
              borderRadius: "3px",
              border: "1px solid #ccc",
            }}
          />
        </div>
        <button onClick={handleVehicleFilter} disabled={isLoading}>
          Filter Vehicles
        </button>
      </div>

      {/* Job Filters */}
      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          border: "1px solid #ddd",
          borderRadius: "5px",
        }}
      >
        <h3>🔧 Job Filters</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "10px",
            marginBottom: "10px",
          }}
        >
          <select
            value={jobFilters.status || ""}
            onChange={(e) =>
              setJobFilters({ ...jobFilters, status: e.target.value as any })
            }
            style={{
              padding: "6px",
              borderRadius: "3px",
              border: "1px solid #ccc",
            }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <input
            type="date"
            placeholder="Date From"
            value={jobFilters.dateFrom || ""}
            onChange={(e) =>
              setJobFilters({ ...jobFilters, dateFrom: e.target.value })
            }
            style={{
              padding: "6px",
              borderRadius: "3px",
              border: "1px solid #ccc",
            }}
          />
          <input
            type="date"
            placeholder="Date To"
            value={jobFilters.dateTo || ""}
            onChange={(e) =>
              setJobFilters({ ...jobFilters, dateTo: e.target.value })
            }
            style={{
              padding: "6px",
              borderRadius: "3px",
              border: "1px solid #ccc",
            }}
          />
          <input
            type="number"
            placeholder="Min Cost"
            value={jobFilters.estimatedCostMin || ""}
            onChange={(e) =>
              setJobFilters({
                ...jobFilters,
                estimatedCostMin: e.target.value
                  ? parseFloat(e.target.value)
                  : undefined,
              })
            }
            style={{
              padding: "6px",
              borderRadius: "3px",
              border: "1px solid #ccc",
            }}
          />
          <input
            type="number"
            placeholder="Max Cost"
            value={jobFilters.estimatedCostMax || ""}
            onChange={(e) =>
              setJobFilters({
                ...jobFilters,
                estimatedCostMax: e.target.value
                  ? parseFloat(e.target.value)
                  : undefined,
              })
            }
            style={{
              padding: "6px",
              borderRadius: "3px",
              border: "1px solid #ccc",
            }}
          />
          <input
            type="text"
            placeholder="Search Description"
            value={jobFilters.search || ""}
            onChange={(e) =>
              setJobFilters({ ...jobFilters, search: e.target.value })
            }
            style={{
              padding: "6px",
              borderRadius: "3px",
              border: "1px solid #ccc",
            }}
          />
        </div>
        <button onClick={handleJobFilter} disabled={isLoading}>
          Filter Jobs
        </button>
      </div>

      {/* Customer Filters */}
      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          border: "1px solid #ddd",
          borderRadius: "5px",
        }}
      >
        <h3>👤 Customer Filters</h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "10px",
            marginBottom: "10px",
          }}
        >
          <input
            type="text"
            placeholder="Search Name/Email/Phone"
            value={customerFilters.search || ""}
            onChange={(e) =>
              setCustomerFilters({ ...customerFilters, search: e.target.value })
            }
            style={{
              padding: "6px",
              borderRadius: "3px",
              border: "1px solid #ccc",
            }}
          />
          <input
            type="text"
            placeholder="City"
            value={customerFilters.city || ""}
            onChange={(e) =>
              setCustomerFilters({ ...customerFilters, city: e.target.value })
            }
            style={{
              padding: "6px",
              borderRadius: "3px",
              border: "1px solid #ccc",
            }}
          />
          <input
            type="text"
            placeholder="State"
            value={customerFilters.state || ""}
            onChange={(e) =>
              setCustomerFilters({ ...customerFilters, state: e.target.value })
            }
            style={{
              padding: "6px",
              borderRadius: "3px",
              border: "1px solid #ccc",
            }}
          />
        </div>
        <button onClick={handleCustomerFilter} disabled={isLoading}>
          Filter Customers
        </button>
      </div>

      {/* Quick Filters */}
      <div
        style={{
          marginBottom: "20px",
          padding: "15px",
          border: "1px solid #ddd",
          borderRadius: "5px",
        }}
      >
        <h3>⚡ Quick Filters</h3>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() => handleQuickFilters("pending-jobs")}
            disabled={isLoading}
          >
            Pending Jobs
          </button>
          <button
            onClick={() => handleQuickFilters("completed-jobs")}
            disabled={isLoading}
          >
            Completed Jobs
          </button>
          <button
            onClick={() => handleQuickFilters("this-week")}
            disabled={isLoading}
          >
            This Week's Jobs
          </button>
          <button
            onClick={() => handleQuickFilters("high-value")}
            disabled={isLoading}
          >
            High Value Jobs
          </button>
          <button
            onClick={() => handleQuickFilters("toyota-vehicles")}
            disabled={isLoading}
          >
            Toyota Vehicles
          </button>
          <button onClick={handleGenerateReport} disabled={isLoading}>
            📊 Monthly Report
          </button>
        </div>
      </div>

      {/* Results Section */}
      {filterResults && (
        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            border: "1px solid #ddd",
            borderRadius: "5px",
            backgroundColor: "#f9f9f9",
          }}
        >
          <h3>📋 Results: {filterResults.label || filterResults.type}</h3>

          {filterResults.type === "report" ? (
            <div>
              <h4>Revenue Report:</h4>
              <p>Total Revenue: ${filterResults.data.revenue.totalRevenue}</p>
              <p>Job Count: {filterResults.data.revenue.jobCount}</p>
              <p>
                Average Job Value: ${filterResults.data.revenue.averageJobValue}
              </p>

              <h4>Statistics:</h4>
              <p>Total Jobs: {filterResults.data.stats.total}</p>
              <p>Pending: {filterResults.data.stats.pending}</p>
              <p>Completed: {filterResults.data.stats.completed}</p>
            </div>
          ) : (
            <div>
              <p>
                <strong>Count:</strong>{" "}
                {Array.isArray(filterResults.data)
                  ? filterResults.data.length
                  : filterResults.data?.data?.length || "N/A"}
              </p>
              {filterResults.data?.total && (
                <>
                  <p>
                    <strong>Total Records:</strong> {filterResults.data.total}
                  </p>
                  <p>
                    <strong>Page:</strong> {filterResults.data.page} of{" "}
                    {filterResults.data.totalPages}
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {isLoading && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(0,0,0,0.8)",
            color: "white",
            padding: "20px",
            borderRadius: "5px",
            zIndex: 1000,
          }}
        >
          Loading...
        </div>
      )}
    </div>
  );
};

export default AxiosQueryDemo;
