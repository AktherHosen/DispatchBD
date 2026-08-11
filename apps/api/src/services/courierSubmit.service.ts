import axios from "axios";

interface CourierSubmissionResult {
  success: boolean;
  consignmentId: string;
  message: string;
}

interface SteadfastResponse {
  status: number;
  message: string;
  consignment_id?: string;
}

interface PathaoResponse {
  data?: {
    consignment_id?: string;
  };
  message?: string;
}

export async function submitToSteadfast(
  apiKey: string,
  apiSecret: string,
  order: {
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    customerCity: string;
    amount: number;
    note?: string;
  }
): Promise<CourierSubmissionResult> {
  try {
    const response = await axios.post<SteadfastResponse>(
      "https://openapi.steadfast.com.bd/api/v1/create_order",
      {
        invoice: order.orderNumber,
        recipient_name: order.customerName,
        recipient_phone: order.customerPhone,
        recipient_address: order.customerAddress,
        recipient_city: order.customerCity || "Dhaka",
        cod_amount: order.amount,
        note: order.note || ""
      },
      {
        headers: {
          "Api-Key": apiKey,
          "Secret-Key": apiSecret,
          "Content-Type": "application/json"
        },
        timeout: 15000
      }
    );

    if (response.data.status === 200 && response.data.consignment_id) {
      return {
        success: true,
        consignmentId: response.data.consignment_id,
        message: "Order submitted successfully"
      };
    }

    return {
      success: false,
      consignmentId: "",
      message: response.data.message || "Failed to submit order"
    };
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to connect to Steadfast";
    return { success: false, consignmentId: "", message };
  }
}

export async function submitToPathao(
  apiKey: string,
  apiSecret: string,
  order: {
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    customerCity: string;
    amount: number;
    note?: string;
  }
): Promise<CourierSubmissionResult> {
  try {
    // Get token first
    const tokenResponse = await axios.post(
      "https://merchant-api-pilot.pathao.com/auth/v1/token",
      {
        client_id: apiKey,
        client_secret: apiSecret,
        grant_type: "client_credentials"
      },
      { timeout: 10000 }
    );

    const token = tokenResponse.data?.data?.access_token;
    if (!token) {
      return { success: false, consignmentId: "", message: "Failed to get Pathao token" };
    }

    const response = await axios.post<PathaoResponse>(
      "https://merchant-api-pilot.pathao.com/store/v1/orders",
      {
        merchant_order_id: order.orderNumber,
        recipient_name: order.customerName,
        recipient_phone: order.customerPhone,
        recipient_address: order.customerAddress,
        recipient_city: order.customerCity || "Dhaka",
        cod_amount: order.amount,
        note: order.note || ""
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        timeout: 15000
      }
    );

    const consignmentId = response.data?.data?.consignment_id;
    if (consignmentId) {
      return {
        success: true,
        consignmentId: String(consignmentId),
        message: "Order submitted successfully"
      };
    }

    return {
      success: false,
      consignmentId: "",
      message: response.data?.message || "Failed to submit order"
    };
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to connect to Pathao";
    return { success: false, consignmentId: "", message };
  }
}
