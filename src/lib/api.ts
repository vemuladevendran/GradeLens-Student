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

export interface Course {
  id: number;
  course_name: string;
  course_code: string;
  course_description: string;
  exams: any[];
}

export interface EnrolledCourse {
  id: number;
  course_name: string;
  course_code: string;
  course_description: string;
  professor_name: string;
  institution_name: string;
}

export interface AssessmentQuestion {
  id: number;
  question: string;
  question_weight: number;
  min_words: number;
  response: string | null;
  received_weight: number;
  feedback: string | null;
  is_graded: boolean;
}

export interface Exam {
  id: number;
  exam_name: string;
  rubrics: string;
  overall_score: number;
  received_score: number;
  overall_feedback: string | null;
  assessment_questions: AssessmentQuestion[];
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

  getCourses: async (token: string): Promise<Course[]> => {
    const response = await fetch(`${API_BASE_URL}/api/courses/`, {
      method: "GET",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch courses");
    }

    return response.json();
  },

  enrollCourse: async (token: string, courseId: number): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/enroll/`, {
      method: "POST",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to enroll in course");
    }

    return response.json();
  },

  getEnrolledCourses: async (token: string): Promise<EnrolledCourse[]> => {
    const response = await fetch(`${API_BASE_URL}/api/student/enrolled-courses/`, {
      method: "GET",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch enrolled courses");
    }

    return response.json();
  },

  unenrollCourse: async (token: string, courseId: number): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/unenroll/`, {
      method: "DELETE",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to unenroll from course");
    }

    return response.json();
  },

  getCourseExams: async (token: string, courseId: number): Promise<Exam[]> => {
    const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/exams/`, {
      method: "GET",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch exams");
    }

    return response.json();
  },
};
