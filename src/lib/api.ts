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
  response?: string | null;
  received_weight?: number;
  feedback?: string | null;
  is_graded?: boolean;
}

export interface TakeExamQuestion {
  id: number;
  question: string;
  question_weight: number;
  min_words: number;
}

export interface TakeExamResponse {
  exam_id: number;
  exam_name: string;
  rubrics: string;
  overall_score: number;
  questions: TakeExamQuestion[];
}

export interface SubmitAnswer {
  question_id: number;
  answer_text: string;
}

export interface SubmitExamPayload {
  answers: SubmitAnswer[];
}

export interface Exam {
  id: number;
  exam_name: string;
  rubrics: string;
  overall_score: number;
  is_taken: boolean;
  received_score?: number;
  overall_feedback?: string | null;
  assessment_questions?: AssessmentQuestion[];
}

export interface Note {
  id: number;
  note_name: string;
  file: string;
  uploaded_at: string;
}

export interface GradeAnswer {
  question_id: number;
  question_text: string;
  question_weight: number;
  min_words: number;
  answer_text: string;
  received_weight: number;
  feedback: string;
  is_graded: boolean;
}

export interface GradeExam {
  course_id: number;
  course_name: string;
  course_code: string;
  exam_id: number;
  exam_name: string;
  submitted_at: string;
  overall_received_score: number;
  overall_feedback: string;
  questions_count: number;
  graded_answers_count: number;
  answers: GradeAnswer[];
}

export interface GradesResponse {
  exams: GradeExam[];
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
    const response = await fetch(`${API_BASE_URL}/api/student/courses/${courseId}/exams/`, {
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

  takeExam: async (token: string, courseId: number, examId: number): Promise<TakeExamResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/exams/${examId}/take/`, {
      method: "GET",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to load exam");
    }

    return response.json();
  },

  submitExam: async (token: string, courseId: number, examId: number, payload: SubmitExamPayload): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/exams/${examId}/submit/`, {
      method: "POST",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to submit exam");
    }

    return response.json();
  },

  getCourseNotes: async (token: string, courseId: number): Promise<Note[]> => {
    const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/notes/`, {
      method: "GET",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch notes");
    }

    return response.json();
  },

  getGrades: async (token: string): Promise<GradesResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/student/exams/grades/`, {
      method: "GET",
      headers: {
        "Authorization": `Token ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch grades");
    }

    return response.json();
  },
};
