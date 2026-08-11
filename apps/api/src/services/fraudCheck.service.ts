import axios from "axios";

interface FraudCheckResult {
  phone: string;
  riskLevel: "low" | "medium" | "high";
  totalOrders: number;
  successRate: number;
  provider: string;
  details?: string;
}

// Steadfast API fraud check
async function checkWithSteadfast(
  phone: string,
  apiEndpoint: string,
  apiKey: string,
  apiSecret: string
): Promise<FraudCheckResult> {
  try {
    const response = await axios.post(
      `${apiEndpoint}/api/v1/consignment/check-fraud`,
      { phone },
      {
        headers: {
          "Api-Key": apiKey,
          "Secret-Key": apiSecret,
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    );

    const data = response.data;
    const riskScore = data.risk_score || 0;
    let riskLevel: "low" | "medium" | "high" = "low";
    
    if (riskScore > 70) {
      riskLevel = "high";
    } else if (riskScore > 40) {
      riskLevel = "medium";
    }

    return {
      phone,
      riskLevel,
      totalOrders: data.total_orders || 0,
      successRate: data.success_rate || 0,
      provider: "steadfast",
      details: data.message
    };
  } catch (error) {
    throw new Error("Failed to check with Steadfast API");
  }
}

// Pathao API fraud check
async function checkWithPathao(
  phone: string,
  apiEndpoint: string,
  apiKey: string,
  apiSecret: string
): Promise<FraudCheckResult> {
  try {
    // First get access token
    const tokenResponse = await axios.post(
      `${apiEndpoint}/merchant/auth/token`,
      {
        client_id: apiKey,
        client_secret: apiSecret
      },
      { timeout: 10000 }
    );

    const accessToken = tokenResponse.data.data.access_token;

    // Then check fraud
    const response = await axios.get(
      `${apiEndpoint}/merchant/phone-check/${phone}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    );

    const data = response.data;
    const riskScore = data.risk_score || 0;
    let riskLevel: "low" | "medium" | "high" = "low";
    
    if (riskScore > 70) {
      riskLevel = "high";
    } else if (riskScore > 40) {
      riskLevel = "medium";
    }

    return {
      phone,
      riskLevel,
      totalOrders: data.total_orders || 0,
      successRate: data.success_rate || 0,
      provider: "pathao",
      details: data.message
    };
  } catch (error) {
    throw new Error("Failed to check with Pathao API");
  }
}

// Generic fraud check (fallback)
async function checkGeneric(
  phone: string,
  _apiEndpoint: string,
  _apiKey: string,
  _apiSecret: string
): Promise<FraudCheckResult> {
  // Simulate fraud check for unknown providers
  const totalOrders = Math.floor(Math.random() * 50);
  const successRate = Math.random() * 100;
  
  let riskLevel: "low" | "medium" | "high" = "low";
  if (successRate < 50) {
    riskLevel = "high";
  } else if (successRate < 75) {
    riskLevel = "medium";
  }

  return {
    phone,
    riskLevel,
    totalOrders,
    successRate,
    provider: "generic",
    details: "Simulated fraud check"
  };
}

export async function checkPhoneFraud(
  phone: string,
  courierName: string,
  apiEndpoint: string,
  apiKey: string,
  apiSecret: string
): Promise<FraudCheckResult> {
  const normalizedCourier = courierName.toLowerCase();
  
  if (normalizedCourier.includes("steadfast")) {
    return checkWithSteadfast(phone, apiEndpoint, apiKey, apiSecret);
  } else if (normalizedCourier.includes("pathao")) {
    return checkWithPathao(phone, apiEndpoint, apiKey, apiSecret);
  } else {
    return checkGeneric(phone, apiEndpoint, apiKey, apiSecret);
  }
}
