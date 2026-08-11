import axios from "axios";

interface WooCommerceOrder {
  id: number;
  number: string;
  status: string;
  billing: {
    first_name: string;
    last_name: string;
    phone: string;
    email: string;
  };
  shipping: {
    first_name: string;
    last_name: string;
    address_1: string;
    city: string;
  };
  line_items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: string;
  currency: string;
  customer_note: string;
  date_created: string;
}

export async function testWooCommerceConnection(
  storeUrl: string,
  consumerKey: string,
  consumerSecret: string
): Promise<{ success: boolean; message: string }> {
  try {
    const url = `${storeUrl}/wp-json/wc/v3/system_status`;
    const response = await axios.get(url, {
      auth: {
        username: consumerKey,
        password: consumerSecret
      },
      timeout: 10000
    });
    return { success: true, message: `Connected: ${response.data.store_name || "WooCommerce store"}` };
  } catch (error) {
    return { success: false, message: "Failed to connect to WooCommerce store" };
  }
}

export async function fetchWooCommerceOrders(
  storeUrl: string,
  consumerKey: string,
  consumerSecret: string,
  page: number = 1,
  perPage: number = 50
): Promise<{ orders: WooCommerceOrder[]; total: number; totalPages: number }> {
  const url = `${storeUrl}/wp-json/wc/v3/orders`;
  const response = await axios.get(url, {
    auth: {
      username: consumerKey,
      password: consumerSecret
    },
    params: {
      page,
      per_page: perPage,
      orderby: "date",
      order: "desc"
    },
    timeout: 30000
  });

  return {
    orders: response.data,
    total: parseInt(response.headers["x-wp-total"] || "0"),
    totalPages: parseInt(response.headers["x-wp-totalpages"] || "0")
  };
}
