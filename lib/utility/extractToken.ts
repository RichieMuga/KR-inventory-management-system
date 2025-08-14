type TokenPayload = {
  payrollNumber?: string;
  role?: string;
  [key: string]: unknown;
};

export function extractRoleAndPayrollFromJWT(token: string) {
  try {
    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) throw new Error("Invalid JWT format");

    // Decode Base64URL → string
    const payloadJson = Buffer.from(payloadBase64, "base64url").toString(
      "utf8",
    );
    const decoded: TokenPayload = JSON.parse(payloadJson);

    return {
      payrollNumber: decoded.payrollNumber || null,
      role: decoded.role || null,
    };
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}
