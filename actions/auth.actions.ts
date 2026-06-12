"use server";

import { cookies } from "next/headers";
import { User, ActionResponse } from "@/types";

const BACKEND_URL = process.env.BACKEND_API_URL || "http://localhost:8080";
const COOKIE_NAME = "auth_token";

export async function loginAction(
  prevState: any,
  formData: FormData
): Promise<ActionResponse<User>> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const rememberMe = formData.get("rememberMe") === "true";

  if (!email || !password) {
    return { success: false, message: "Email and password are required." };
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      return { success: false, message: json.error || json.message || "Invalid credentials." };
    }

    const { token, user } = json.data;

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      path: "/",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      maxAge: rememberMe ? 60 * 60 * 24 * 30 : undefined, // 30 days or session
      sameSite: "lax",
    });

    return { success: true, message: "Logged in successfully.", data: user };
  } catch (err) {
    return { success: false, message: "Network error. Please make sure the backend is running." };
  }
}

export async function signupAction(
  prevState: any,
  formData: FormData
): Promise<ActionResponse<User>> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!name || !email || !password || !confirmPassword) {
    return { success: false, message: "All fields are required." };
  }

  if (password !== confirmPassword) {
    return { success: false, message: "Passwords do not match." };
  }

  try {
    const registerRes = await fetch(`${BACKEND_URL}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    const registerJson = await registerRes.json();

    if (!registerRes.ok || !registerJson.success) {
      return {
        success: false,
        message: registerJson.error || registerJson.message || "Registration failed.",
      };
    }

    const loginRes = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const loginJson = await loginRes.json();

    if (!loginRes.ok || !loginJson.success) {
      return {
        success: true,
        message: "Account created! Please sign in manually.",
      };
    }

    const { token, user } = loginJson.data;

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      path: "/",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return { success: true, message: "Account created successfully!", data: user };
  } catch (err) {
    return { success: false, message: "Network error. Please make sure the backend is running." };
  }
}

export async function logoutAction(): Promise<ActionResponse<null>> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;

    if (token) {
      await fetch(`${BACKEND_URL}/api/v1/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    }

    cookieStore.delete(COOKIE_NAME);
    return { success: true, message: "Logged out successfully." };
  } catch (err) {
    const cookieStore = await cookies();
    cookieStore.delete(COOKIE_NAME);
    return { success: true, message: "Logged out." };
  }
}

export async function getCurrentUserAction(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const payloadBase64 = token.split(".")[1];
    if (!payloadBase64) return null;
    const decodedJson = Buffer.from(payloadBase64, "base64").toString();
    const payload = JSON.parse(decodedJson);
    const userId = payload.user_id;

    if (!userId) return null;

    const res = await fetch(`${BACKEND_URL}/api/v1/user/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await res.json();
    if (res.ok && json.success) {
      return json.data as User;
    }
    return null;
  } catch {
    return null;
  }
}

export async function verifyOtpAction(
  email: string,
  code: string
): Promise<ActionResponse<User>> {
  if (!email || !code) {
    return { success: false, message: "Email and code are required." };
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      return {
        success: false,
        message: json.error || json.message || "Invalid verification code.",
      };
    }

    const { token, user } = json.data;

    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      path: "/",
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return { success: true, message: "Email verified successfully!", data: user };
  } catch (err) {
    return { success: false, message: "Network error. Please make sure the backend is running." };
  }
}

export async function resendOtpAction(
  email: string
): Promise<ActionResponse<null>> {
  if (!email) {
    return { success: false, message: "Email is required." };
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/v1/auth/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      return {
        success: false,
        message: json.error || json.message || "Failed to resend verification code.",
      };
    }

    return { success: true, message: "Verification code resent successfully!" };
  } catch (err) {
    return { success: false, message: "Network error. Please make sure the backend is running." };
  }
}
