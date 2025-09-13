import { toast } from "react-toastify";
import type {
  CreateRepairOrderData,
  ItemResponse,
  RepairOrder,
  RepairOrderDetailsResponse,
  RepairOrderItem,
  RepairOrderItemResponse,
  RepairOrderListResponse,
  RepairOrderQuery,
  RepairOrderResponse,
  RepairOrderStats,
  RepairOrderStatsResponse,
  TopServiceResponse,
  UpdateRepairOrderData,
} from "../types/repairOrders";
import { apiGet, apiPost, apiPut, apiDelete } from "../utils/api";

// Repair Order Management Service
export const repairOrderMngtService = {
  // Get all repair orders with filtering and pagination
  getRepairOrders: async (
    query: RepairOrderQuery = {}
  ): Promise<RepairOrderListResponse> => {
    try {
      toast.info("🔧 Loading repair orders with query:");

      const params = new URLSearchParams();

      if (query.page) params.append("page", query.page.toString());
      if (query.limit) params.append("limit", query.limit.toString());
      if (query.search) params.append("search", query.search);
      if (query.customerId) params.append("customer_id", query.customerId);
      if (query.vehicleId) params.append("vehicle_id", query.vehicleId);
      if (query.technicianId)
        params.append("technician_id", query.technicianId);
      if (query.status) params.append("status", query.status);
      if (query.priority) params.append("priority", query.priority);
      if (query.dateFrom) params.append("date_from", query.dateFrom);
      if (query.dateTo) params.append("date_to", query.dateTo);
      if (query.sortBy) params.append("sort_by", query.sortBy);
      if (query.sortOrder) params.append("sort_order", query.sortOrder);
      if (query.minAmount)
        params.append("min_amount", query.minAmount.toString());
      if (query.maxAmount)
        params.append("max_amount", query.maxAmount.toString());

      const queryString = params.toString();
      const endpoint = `/shop/repair-orders/${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await apiGet<RepairOrderResponse>(endpoint);

      toast("✅ Repair orders loaded successfully");

      // Handle different response structures
      const ordersArray =
        response.results || response.repair_orders || response || [];

      return {
        repairOrders: ordersArray.map((order: RepairOrderDetailsResponse) => ({
          id: order.id?.toString() || "",
          customerId: order.customer_id?.toString() || "",
          vehicleId: order.vehicle_id?.toString() || "",
          appointmentId: order.appointment_id?.toString(),
          orderNumber: order.order_number || `RO-${order.id}`,
          status: order.status || "pending",
          priority: order.priority || "medium",
          description: order.description || "",
          diagnosis: order.diagnosis,
          recommendations: order.recommendations,
          items: ((order.items as unknown as ItemResponse[]) || [])?.map(
            (item) => ({
              id: item.id?.toString() || "",
              type: item.type || "service",
              description: item.description || "",
              quantity:
                typeof item.quantity === "string"
                  ? Number(item.quantity)
                  : item.quantity ?? 1,
              unitPrice:
                typeof item.unit_price === "string"
                  ? Number(item.unit_price)
                  : item.unit_price ?? 0,
              totalPrice:
                typeof item.total_price === "string"
                  ? Number(item.total_price)
                  : item.total_price ?? 0,
              partNumber: item.part_number,
              laborHours:
                typeof item.labor_hours === "string"
                  ? Number(item.labor_hours)
                  : item.labor_hours,
              discount:
                typeof item.discount === "string"
                  ? Number(item.discount)
                  : item.discount ?? 0,
              taxRate:
                typeof item.tax_rate === "string"
                  ? Number(item.tax_rate)
                  : item.tax_rate ?? 0,
              notes: item.notes,
              repairOrderId: item.repair_order_id?.toString() || "",
              taxable: item.taxable ?? false,
              createdAt: item.created_at || new Date().toISOString(),
              updatedAt: item.updated_at || new Date().toISOString(),
            })
          ),
          subtotal: order.subtotal || 0,
          tax: order.tax || 0,
          discount: order.discount || 0,
          total: order.total || 0,
          estimatedCompletionDate: order.estimated_completion_date,
          actualCompletionDate: order.actual_completion_date,
          assignedTechnician: order.assigned_technician?.toString(),
          authorizedBy: order.authorized_by?.toString(),
          authorizedAt: order.authorized_at,
          createdAt: order.created_at || new Date().toISOString(),
          updatedAt: order.updated_at || new Date().toISOString(),
          customer: order.customer
            ? {
                id: order.customer.id?.toString() || "",
                name: order.customer.name || "",
                email: order.customer.email || "",
                phone: order.customer.phone_number || "",
                address: order.customer.address,
                isActive: order.customer.is_active,
                createdAt: order.customer.created_at,
                updatedAt: order.customer.updated_at,
              }
            : undefined,
          vehicle: order.vehicle
            ? {
                id: order.vehicle.id?.toString() || "",
                make: order.vehicle.make || "",
                model: order.vehicle.model || "",
                year: order.vehicle.year || new Date().getFullYear(),
                licensePlate: order.vehicle.license_plate || "",
                vin: order.vehicle.vin || "",
                customerId: order.vehicle.customer_id,
                createdAt: order.vehicle.created_at,
                updatedAt: order.vehicle.updated_at,
                isActive: order.vehicle.is_active,
              }
            : undefined,
          technician: order.technician
            ? {
                id: order.technician.id?.toString() || "",
                firstName: order.technician.first_name || "",
                lastName: order.technician.last_name || "",
                specialties: order.technician.specialties || [],
              }
            : undefined,
          notes: order.notes,
          images: order.images || [],
          warranty: order.warranty
            ? {
                type: order.warranty.type || "",
                duration: order.warranty.duration || 0,
                description: order.warranty.description || "",
              }
            : undefined,
        })),
        total: response.count || ordersArray.length,
        page: query.page || 1,
        limit: query.limit || 10,
        totalPages: Math.ceil(
          (response.count || ordersArray.length) / (query.limit || 10)
        ),
      };
    } catch (error) {
      toast.error(
        "❌ Error loading repair orders: " +
          (error instanceof Error ? error.message : String(error)),
        { type: "error" }
      );

      // Check if it's a server error (500) and try alternative endpoints
      if (
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        typeof (error as { status?: unknown }).status === "number" &&
        (error as { status: number }).status === 500
      ) {
        toast.warning(
          "🚧 Main repair orders endpoint returned 500 error - trying fallback approaches..."
        );

        try {
          // Try the active orders endpoint as fallback
          toast.info("🔄 Trying active repair orders endpoint as fallback...");
          const activeResponse = await apiGet<RepairOrderDetailsResponse[]>(
            "/shop/repair-orders/active/"
          );
          const activeOrders = Array.isArray(activeResponse)
            ? activeResponse
            : (activeResponse as unknown as { results?: RepairOrderDetailsResponse[] }).results || [];

          toast.info(
            `✅ Active orders fallback successful - found ${activeOrders.length} active orders`
          );

          return {
            repairOrders: activeOrders.map((order: RepairOrderDetailsResponse) => ({
              id: order.id?.toString() || "",
              customerId: order.customer_id?.toString() || "",
              vehicleId: order.vehicle_id?.toString() || "",
              appointmentId: order.appointment_id?.toString(),
              orderNumber: order.order_number || `RO-${order.id}`,
              status: order.status || "pending",
              priority: order.priority || "medium",
              description: order.description || "",
              diagnosis: order.diagnosis,
              recommendations: order.recommendations,
              items: [],
              subtotal: order.subtotal || 0,
              tax: order.tax || 0,
              discount: order.discount || 0,
              total: order.total || 0,
              estimatedCompletionDate: order.estimated_completion_date,
              actualCompletionDate: order.actual_completion_date,
              assignedTechnician: order.assigned_technician?.toString(),
              authorizedBy: order.authorized_by?.toString(),
              authorizedAt: order.authorized_at,
              createdAt: order.created_at || new Date().toISOString(),
              updatedAt: order.updated_at || new Date().toISOString(),
              notes: order.notes,
              images: [],
              warranty: undefined,
            })),
            total: activeOrders.length,
            page: query.page || 1,
            limit: query.limit || 10,
            totalPages: Math.ceil(activeOrders.length / (query.limit || 10)),
          };
        } catch (fallbackError) {
          // toast.warn("❌ Active orders fallback also failed:", fallbackError);
          toast.warn(
              "❌ Alternative endpoint also failed: " +
                (fallbackError instanceof Error
                  ? fallbackError.message
                  : String(fallbackError))
            );

          // Try one more alternative approach - use a different endpoint pattern
          try {
            toast.info(
              "🔄 Trying alternative repair orders endpoint pattern..."
            );
            const altResponse = await apiGet<RepairOrderDetailsResponse[] | { results?: RepairOrderDetailsResponse[]; repairOrders?: RepairOrderDetailsResponse[] }>(
              "/shop/repair-orders/",
              {
                status: "pending",
                limit: query.limit || 10,
              }
            );
            const altOrders = Array.isArray(altResponse)
              ? altResponse
              : altResponse.results || altResponse.repairOrders || [];

            toast.info(
              `✅ Alternative endpoint successful - found ${altOrders.length} orders`
            );

            return {
              repairOrders: altOrders.map((order: RepairOrderDetailsResponse) => ({
                id: order.id?.toString() || "",
                customerId: order.customer_id?.toString() || "",
                vehicleId: order.vehicle_id?.toString() || "",
                appointmentId: order.appointment_id?.toString(),
                orderNumber: order.order_number || `RO-${order.id}`,
                status: order.status || "pending",
                priority: order.priority || "medium",
                description: order.description || "Repair Service",
                diagnosis: order.diagnosis,
                recommendations: order.recommendations,
                items: [],
                subtotal: order.subtotal || 0,
                tax: order.tax || 0,
                discount: order.discount || 0,
                total: order.total || 0,
                estimatedCompletionDate: order.estimated_completion_date,
                actualCompletionDate: order.actual_completion_date,
                assignedTechnician: order.assigned_technician?.toString(),
                authorizedBy: order.authorized_by?.toString(),
                authorizedAt: order.authorized_at,
                createdAt: order.created_at || new Date().toISOString(),
                updatedAt: order.updated_at || new Date().toISOString(),
                notes: order.notes,
                images: [],
                warranty: undefined,
              })),
              total: altOrders.length,
              page: query.page || 1,
              limit: query.limit || 10,
              totalPages: Math.ceil(altOrders.length / (query.limit || 10)),
            };
          } catch (altError) {
            toast.warn(
              "❌ Alternative endpoint also failed: " +
                (altError instanceof Error ? altError.message : String(altError))
            );

            // Final fallback - return empty result
            toast.warn(
              "🚧 All repair order endpoints failed - returning empty result"
            );
            return {
              repairOrders: [],
              total: 0,
              page: query.page || 1,
              limit: query.limit || 10,
              totalPages: 0,
            };
          }
        }
      }

      // For other errors, still throw to let caller handle
      throw error;
    }
  },

  // Get repair order by ID
  getRepairOrderById: async (repairOrderId: string): Promise<RepairOrder> => {
    const response = await apiGet<RepairOrderDetailsResponse>(
      `/shop/repair-orders/${repairOrderId}/`
    );

    return {
      id: response.id?.toString() || "",
      customerId: response.customer_id?.toString() || "",
      vehicleId: response.vehicle_id?.toString() || "",
      appointmentId: response.appointment_id?.toString(),
      orderNumber: response.order_number || "",
      status: response.status || "pending",
      priority: response.priority || "medium",
      description: response.description || "",
      diagnosis: response.diagnosis,
      recommendations: response.recommendations,
      items:
        response.items?.map((item: RepairOrderItemResponse) => ({
          id: item.id?.toString() || "",
          type: item.type || "service",
          description: item.description || "",
          quantity: item.quantity || 1,
          unitPrice: item.unit_price || 0,
          totalPrice: item.total_price || 0,
          partNumber: item.part_number,
          laborHours: item.labor_hours,
          discount: item.discount || 0,
          taxRate: item.tax_rate || 0,
          notes: item.notes,
          repairOrderId: item.repair_order_id,
          taxable: item.taxable,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        })) || [],
      subtotal: response.subtotal || 0,
      tax: response.tax || 0,
      discount: response.discount || 0,
      total: response.total || 0,
      estimatedCompletionDate: response.estimated_completion_date,
      actualCompletionDate: response.actual_completion_date,
      assignedTechnician: response.assigned_technician?.toString(),
      authorizedBy: response.authorized_by?.toString(),
      authorizedAt: response.authorized_at,
      createdAt: response.created_at || new Date().toISOString(),
      updatedAt: response.updated_at || new Date().toISOString(),
      customer: response.customer
        ? {
            id: response.customer.id?.toString() || "",
            name: response.customer.name || "",
            email: response.customer.email || "",
            phone: response.customer.phone_number || "",
            address: response.customer.address,
            isActive: response.customer.is_active,
            createdAt: response.customer.created_at,
            updatedAt: response.customer.updated_at,
          }
        : undefined,
      vehicle: response.vehicle
        ? {
            id: response.vehicle.id?.toString() || "",
            make: response.vehicle.make || "",
            model: response.vehicle.model || "",
            year: response.vehicle.year || new Date().getFullYear(),
            licensePlate: response.vehicle.license_plate || "",
            vin: response.vehicle.vin || "",
            customerId: response.vehicle.customer_id,
            createdAt: response.vehicle.created_at,
            updatedAt: response.vehicle.updated_at,
            isActive: response.vehicle.is_active,
          }
        : undefined,
      technician: response.technician
        ? {
            id: response.technician.id?.toString() || "",
            firstName: response.technician.first_name || "",
            lastName: response.technician.last_name || "",
            specialties: response.technician.specialties || [],
          }
        : undefined,
      notes: response.notes,
      images: response.images || [],
      warranty: response.warranty
        ? {
            type: response.warranty.type || "",
            duration: response.warranty.duration || 0,
            description: response.warranty.description || "",
          }
        : undefined,
    };
  },

  // Create new repair order
  createRepairOrder: async (
    repairOrderData: CreateRepairOrderData
  ): Promise<RepairOrder> => {
    const createData = {
      customer_id: repairOrderData.customerId,
      vehicle_id: repairOrderData.vehicleId,
      appointment_id: repairOrderData.appointmentId,
      priority: repairOrderData.priority || "medium",
      description: repairOrderData.description,
      diagnosis: repairOrderData.diagnosis,
      recommendations: repairOrderData.recommendations,
      items:
        repairOrderData.items?.map((item) => ({
          type: item.type,
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.totalPrice,
          part_number: item.partNumber,
          labor_hours: item.laborHours,
          discount: item.discount || 0,
          tax_rate: item.taxRate || 0,
          notes: item.notes,
        })) || [],
      estimated_completion_date: repairOrderData.estimatedCompletionDate,
      assigned_technician: repairOrderData.assignedTechnician,
      notes: repairOrderData.notes,
      warranty: repairOrderData.warranty,
    };

    const response = await apiPost<RepairOrderDetailsResponse>(
      "/shop/repair-orders/",
      createData
    );

    return {
      id: response.id?.toString() || "",
      customerId: response.customer_id?.toString() || "",
      vehicleId: response.vehicle_id?.toString() || "",
      appointmentId: response.appointment_id?.toString(),
      orderNumber: response.order_number || "",
      status: response.status || "pending",
      priority: response.priority || "medium",
      description: response.description || "",
      diagnosis: response.diagnosis,
      recommendations: response.recommendations,
      items:
        response.items?.map((item: RepairOrderItemResponse) => ({
          id: item.id?.toString() || "",
          type: item.type || "service",
          description: item.description || "",
          quantity: item.quantity || 1,
          unitPrice: item.unit_price || 0,
          totalPrice: item.total_price || 0,
          partNumber: item.part_number,
          laborHours: item.labor_hours,
          discount: item.discount || 0,
          taxRate: item.tax_rate || 0,
          notes: item.notes,
          repairOrderId: item.repair_order_id,
          taxable: item.taxable,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        })) || [],
      subtotal: response.subtotal || 0,
      tax: response.tax || 0,
      discount: response.discount || 0,
      total: response.total || 0,
      estimatedCompletionDate: response.estimated_completion_date,
      actualCompletionDate: response.actual_completion_date,
      assignedTechnician: response.assigned_technician?.toString(),
      authorizedBy: response.authorized_by?.toString(),
      authorizedAt: response.authorized_at,
      createdAt: response.created_at || new Date().toISOString(),
      updatedAt: response.updated_at || new Date().toISOString(),
      notes: response.notes,
      images: response.images || [],
      warranty: response.warranty
        ? {
            type: response.warranty.type || "",
            duration: response.warranty.duration || 0,
            description: response.warranty.description || "",
          }
        : undefined,
    };
  },

  // Update repair order
  updateRepairOrder: async (
    repairOrderId: string,
    repairOrderData: UpdateRepairOrderData
  ): Promise<RepairOrder> => {
    const updateData = {
      customer_id: repairOrderData.customerId,
      vehicle_id: repairOrderData.vehicleId,
      status: repairOrderData.status,
      priority: repairOrderData.priority,
      description: repairOrderData.description,
      diagnosis: repairOrderData.diagnosis,
      recommendations: repairOrderData.recommendations,
      items: repairOrderData.items?.map((item) => ({
        id: item.id,
        type: item.type,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total_price: item.totalPrice,
        part_number: item.partNumber,
        labor_hours: item.laborHours,
        discount: item.discount || 0,
        tax_rate: item.taxRate || 0,
        notes: item.notes,
      })),
      estimated_completion_date: repairOrderData.estimatedCompletionDate,
      actual_completion_date: repairOrderData.actualCompletionDate,
      assigned_technician: repairOrderData.assignedTechnician,
      authorized_by: repairOrderData.authorizedBy,
      notes: repairOrderData.notes,
      images: repairOrderData.images,
      warranty: repairOrderData.warranty,
    };

    // Remove undefined fields
    Object.keys(updateData).forEach((key) => {
      if (updateData[key as keyof typeof updateData] === undefined) {
        delete updateData[key as keyof typeof updateData];
      }
    });

    const response = await apiPut<RepairOrderDetailsResponse>(
      `/shop/repair-orders/${repairOrderId}/`,
      updateData
    );

    return {
      id: response.id?.toString() || "",
      customerId: response.customer_id?.toString() || "",
      vehicleId: response.vehicle_id?.toString() || "",
      appointmentId: response.appointment_id?.toString(),
      orderNumber: response.order_number || "",
      status: response.status || "pending",
      priority: response.priority || "medium",
      description: response.description || "",
      diagnosis: response.diagnosis,
      recommendations: response.recommendations,
      items:
        response.items?.map((item: RepairOrderItemResponse) => ({
          id: item.id?.toString() || "",
          type: item.type || "service",
          description: item.description || "",
          quantity: item.quantity || 1,
          unitPrice: item.unit_price || 0,
          totalPrice: item.total_price || 0,
          partNumber: item.part_number,
          laborHours: item.labor_hours,
          discount: item.discount || 0,
          taxRate: item.tax_rate || 0,
          notes: item.notes,
          repairOrderId: item.repair_order_id,
          taxable: item.taxable,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        })) || [],
      subtotal: response.subtotal || 0,
      tax: response.tax || 0,
      discount: response.discount || 0,
      total: response.total || 0,
      estimatedCompletionDate: response.estimated_completion_date,
      actualCompletionDate: response.actual_completion_date,
      assignedTechnician: response.assigned_technician?.toString(),
      authorizedBy: response.authorized_by?.toString(),
      authorizedAt: response.authorized_at,
      createdAt: response.created_at || new Date().toISOString(),
      updatedAt: response.updated_at || new Date().toISOString(),
      customer: response.customer
        ? {
            id: response.customer.id?.toString() || "",
            name: response.customer.name || "",
            email: response.customer.email || "",
            phone: response.customer.phone_number || "",
            address: response.customer.address,
            isActive: response.customer.is_active,
            createdAt: response.customer.created_at,
            updatedAt: response.customer.updated_at,
          }
        : undefined,
      vehicle: response.vehicle
        ? {
            id: response.vehicle.id?.toString() || "",
            make: response.vehicle.make || "",
            model: response.vehicle.model || "",
            year: response.vehicle.year || new Date().getFullYear(),
            licensePlate: response.vehicle.license_plate || "",
            vin: response.vehicle.vin || "",
            customerId: response.vehicle.customer_id,
            createdAt: response.vehicle.created_at,
            updatedAt: response.vehicle.updated_at,
            isActive: response.vehicle.is_active,
          }
        : undefined,
      technician: response.technician
        ? {
            id: response.technician.id?.toString() || "",
            firstName: response.technician.first_name || "",
            lastName: response.technician.last_name || "",
            specialties: response.technician.specialties || [],
          }
        : undefined,
      notes: response.notes,
      images: response.images || [],
      warranty: response.warranty
        ? {
            type: response.warranty.type || "",
            duration: response.warranty.duration || 0,
            description: response.warranty.description || "",
          }
        : undefined,
    };
  },

  // Delete repair order
  deleteRepairOrder: async (repairOrderId: string): Promise<void> => {
    await apiDelete(`/shop/repair-orders/${repairOrderId}/`);
  },

  // Approve repair order
  approveRepairOrder: async (
    repairOrderId: string,
    authorizedBy: string
  ): Promise<RepairOrder> => {
    return await repairOrderMngtService.updateRepairOrder(repairOrderId, {
      status: "waiting_approval",
      authorizedBy,
      authorizedAt: new Date().toISOString(),
    });
  },

  // Start repair order work
  startRepairOrder: async (repairOrderId: string): Promise<RepairOrder> => {
    return await repairOrderMngtService.updateRepairOrder(repairOrderId, {
      status: "pending",
    });
  },

  // Complete repair order
  completeRepairOrder: async (repairOrderId: string): Promise<RepairOrder> => {
    return await repairOrderMngtService.updateRepairOrder(repairOrderId, {
      status: "completed",
      actualCompletionDate: new Date().toISOString(),
    });
  },

  // Put repair order on hold
  holdRepairOrder: async (
    repairOrderId: string,
    reason?: string
  ): Promise<RepairOrder> => {
    const updateData: UpdateRepairOrderData = { status: "on_hold" };
    if (reason) {
      updateData.notes = reason;
    }

    return await repairOrderMngtService.updateRepairOrder(
      repairOrderId,
      updateData
    );
  },

  // Cancel repair order
  cancelRepairOrder: async (
    repairOrderId: string,
    reason?: string
  ): Promise<RepairOrder> => {
    const updateData: UpdateRepairOrderData = { status: "cancelled" };
    if (reason) {
      updateData.notes = reason;
    }

    return await repairOrderMngtService.updateRepairOrder(
      repairOrderId,
      updateData
    );
  },

  // Get active repair orders
  getActiveRepairOrders: async (): Promise<RepairOrder[]> => {
    try {
      toast.info("🔄 Loading active repair orders from backend...");

      // Use the new backend endpoint that handles filtering efficiently
      const response = await apiGet<RepairOrder[]>(
        "/shop/repair-orders/active/"
      );

      toast.info(
        `✅ Loaded ${response.length} active repair orders from backend`
      );
      return response;
    } catch (error: unknown) {
      toast.error(
        "❌ Error loading active repair orders:" +
          (error instanceof Error ? ` ${error.message}` : ""),
        { type: "error" }
      );

      // Fallback: get recent repair orders if active endpoint fails
      toast.info("🔄 Falling back to recent repair orders...");
      try {
        const query: RepairOrderQuery = {
          sortBy: "date_created",
          sortOrder: "desc",
          limit: 10,
        };
        const fallbackResponse = await repairOrderMngtService.getRepairOrders(
          query
        );
        toast.info(
          `✅ Fallback: Loaded ${fallbackResponse.repairOrders.length} recent repair orders`
        );
        return fallbackResponse.repairOrders;
      } catch (fallbackError) {
        toast.error(
          "❌ Fallback also failed: " +
            (fallbackError instanceof Error
              ? fallbackError.message
              : String(fallbackError)),
          { type: "error" }
        );
        return [];
      }
    }
  },

  // Get today's revenue (handle null completion dates)
  getTodaysRevenue: async (): Promise<number> => {
    try {
      const today = new Date().toISOString().split('T')[0];
      console.log(`🔍 getTodaysRevenue called for date: ${today}`);
      
      // Get all completed orders (no date filtering since backend dates are null)
      const endpoint = `/shop/repair-orders/?status=completed&limit=100`;
      console.log(`📡 Calling API endpoint: ${endpoint}`);
      
      const response = await apiGet<any>(endpoint);
      console.log(`📥 API response received. Type:`, typeof response, `Keys:`, Object.keys(response || {}));
      
      // Handle both array and object responses
      const ordersArray = Array.isArray(response) ? response : (response.results || response.repairOrders || response.repair_orders || []);
      console.log(`📋 Found ${ordersArray.length} completed orders`);
      
      if (ordersArray.length === 0) {
        console.log(`📭 No completed orders found`);
        return 0;
      }
      
      // Check if any orders have valid completion dates
      const ordersWithDates = ordersArray.filter((order: any) => {
        const completionDate = order.actual_completion_date || 
                             order.completed_at || 
                             order.completedAt ||
                             order.updated_at ||
                             order.updatedAt ||
                             order.created_at ||
                             order.createdAt;
        return completionDate && completionDate.trim() !== '';
      });
      
      console.log(`📅 Found ${ordersWithDates.length} orders with valid dates out of ${ordersArray.length} total`);
      
      let todaysRevenue = 0;
      
      if (ordersWithDates.length === 0) {
        // FALLBACK: All completion dates are null - treat all completed orders as today's revenue
        console.log(`⚠️ No completion dates in backend data - using all completed orders as fallback`);
        todaysRevenue = ordersArray.reduce((sum: number, order: any) => {
          const amount = Number(order.total_cost || order.total || 0);
          console.log(`💰 Fallback: Adding $${amount} from order ${order.id}`);
          return sum + amount;
        }, 0);
        console.log(`💵 Fallback total revenue: $${todaysRevenue}`);
      } else {
        // Normal date filtering for orders with valid dates
        const todaysOrders = ordersWithDates.filter((order: any) => {
          const completionDate = order.actual_completion_date || 
                               order.completed_at || 
                               order.completedAt ||
                               order.updated_at ||
                               order.updatedAt ||
                               order.created_at ||
                               order.createdAt;
          
          const orderDate = completionDate.split('T')[0];
          const isToday = orderDate === today;
          
          console.log(`📅 Order ${order.id}: Date=${orderDate}, IsToday=${isToday}`);
          return isToday;
        });
        
        console.log(`📊 Found ${todaysOrders.length} orders completed today`);
        
        todaysRevenue = todaysOrders.reduce((sum: number, order: any) => {
          const amount = Number(order.total_cost || order.total || 0);
          console.log(`💰 Adding $${amount} from order ${order.id}`);
          return sum + amount;
        }, 0);
        console.log(`💵 Total today's revenue: $${todaysRevenue}`);
      }
      
      console.log(`✅ getTodaysRevenue returning: ${todaysRevenue}`);
      return todaysRevenue;
      
    } catch (error) {
      console.error("❌ Failed to get today's revenue:", error);
      toast.error("Failed to load today's revenue");
      return 0;
    }
  },

  // Get repair order statistics
  getRepairOrderStats: async (): Promise<RepairOrderStats> => {
    try {
      toast.info("📊 Loading repair order statistics...");
      const response = await apiGet<RepairOrderStatsResponse>(
        "/shop/repair-orders/stats/"
      );

      toast.info("✅ Repair order stats loaded");

      return {
        totalOrders: response.total_orders || 0,
        activeOrders: response.active_orders || 0,
        completedThisMonth: response.completed_this_month || 0,
        totalRevenueThisMonth: response.total_revenue_this_month || 0,
        averageOrderValue: response.average_order_value || 0,
        ordersByStatus: {
          in_progress: response.orders_by_status?.in_progress || 0,
          pending: response.orders_by_status?.pending || 0,
          approved: response.orders_by_status?.approved || 0,
          completed: response.orders_by_status?.completed || 0,
          on_hold: response.orders_by_status?.on_hold || 0,
          cancelled: response.orders_by_status?.cancelled || 0,
        },
        topServices:
          response.top_services?.map((service: TopServiceResponse) => ({
            service: service.service || "",
            count: service.count || 0,
            revenue: service.revenue || 0,
          })) || [],
      };
    } catch (error: unknown) {
      toast.error(
        "❌ Error loading repair order stats:" +
          (error instanceof Error ? ` ${error.message}` : ""),
        { type: "error" }
      );

      // If stats endpoint fails, return default values instead of throwing
      if (
        typeof error === "object" &&
        error !== null &&
        "status" in error &&
        (error as { status?: number }).status !== undefined &&
        ((error as { status: number }).status === 500 ||
          (error as { status: number }).status === 404)
      ) {
        toast.warn(
          "🚧 Repair order stats endpoint failed - returning default values as fallback"
        );
        return {
          totalOrders: 0,
          activeOrders: 0,
          completedThisMonth: 0,
          totalRevenueThisMonth: 0,
          averageOrderValue: 0,
          ordersByStatus: {
            pending: 0,
            approved: 0,
            in_progress: 0,
            completed: 0,
            on_hold: 0,
            cancelled: 0,
          },
          topServices: [],
        };
      }

      // For other errors, still throw to let caller handle
      throw error;
    }
  },

  // Add item to repair order
  addRepairOrderItem: async (
    repairOrderId: string,
    item: Omit<RepairOrderItem, "id">
  ): Promise<RepairOrder> => {
    const currentOrder = await repairOrderMngtService.getRepairOrderById(
      repairOrderId
    );
    const newItems = [
      ...(currentOrder.items ?? []),
      { ...item, id: Date.now().toString() },
    ];

    return await repairOrderMngtService.updateRepairOrder(repairOrderId, {
      items: newItems,
    });
  },

  // Remove item from repair order
  removeRepairOrderItem: async (
    repairOrderId: string,
    itemId: string
  ): Promise<RepairOrder> => {
    const currentOrder = await repairOrderMngtService.getRepairOrderById(
      repairOrderId
    );
    const newItems = (currentOrder.items ?? []).filter(
      (item) => item.id !== itemId
    );

    return await repairOrderMngtService.updateRepairOrder(repairOrderId, {
      items: newItems,
    });
  },

  // Generate repair order PDF
  generateRepairOrderPDF: async (repairOrderId: string): Promise<Blob> => {
    const response = await fetch(`/shop/repair-orders/${repairOrderId}/pdf/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      throw new Error("PDF generation failed");
    }

    return await response.blob();
  },

  // Search repair orders
  searchRepairOrders: async (
    searchTerm: string,
    options: { limit?: number; status?: RepairOrder["status"] } = {}
  ): Promise<RepairOrder[]> => {
    const query: RepairOrderQuery = {
      search: searchTerm,
      limit: options.limit || 10,
    };

    if (options.status) {
      query.status = options.status;
    }

    const response = await repairOrderMngtService.getRepairOrders(query);
    return response.repairOrders;
  },
};
