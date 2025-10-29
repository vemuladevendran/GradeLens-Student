import { API_BASE_URL } from "./config";

export interface SignupData {
  full_name: string;
  email: string;
  student_id?: string;
  password: string;
  confirm_password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user_type: string;
  id: number;
  full_name: string;
  email: string;
}

export interface SignupResponse {
  id: number;
  full_name: string;
  email: string;
  student_id?: string;
}

export const api = {
  signup: async (data: SignupData): Promise<SignupResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/students/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Signup failed");
    }

    return response.json();
  },

  login: async (data: LoginData): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    return response.json();
  },
};
