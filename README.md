# 🎓 GradeLens – Student Portal  
### AI-Powered Assignment Submission & Feedback Platform  
*Frontend built with React.js*

The GradeLens Student Portal allows students to submit assignments, track grading status, and view AI-generated feedback based on the instructor’s rubric.  
It provides a simple, intuitive interface to interact with the GradeLens auto-grading ecosystem.

---

## 🚀 Features

### 🏠 **Student Dashboard**
- View enrolled courses  
- See active, upcoming, and completed assignments  
- Quick view of grading status: *Not Submitted, Submitted, Graded*  

### 📤 **Submit Assignments**
- Upload PDF or text-based submissions  
- Drag-and-drop or file-picker upload  
- Validations for file size, format, and required fields  
- Real-time upload progress display  

### 🧾 **Submission Management**
- View submission history for each assignment  
- Replace submission before deadline  
- Timestamp for each upload  
- Submission status tracking (Submitted → Grading → Completed)  

### 📝 **View AI-Generated Feedback**
Once grading is completed by GradeLens backend:
- View rubric-wise scoring  
- Strengths and weaknesses of your answer  
- Suggestions for improvement  
- Similarity score vs. reference solution  
- Downloadable feedback report (PDF/CSV if enabled)

### 🔔 **Notifications**
- Alerts for graded assignments  
- Upcoming deadlines  
- Submission reminders  

### 🧭 **Clean & Responsive UI**
- Mobile-friendly layout  
- Smooth transitions and loaders  
- Accessible components and readable typography  

---

## 🛠️ Technologies Used (Frontend – React.js)

### **Core Framework**
- React.js (v18+)  
- Functional components + Hooks  

### **State Management**
- Zustand for lightweight global store  

### **Routing**
- React Router DOM  

### **HTTP Requests**
- Axios for API calls  
- Authorization headers managed automatically  

### **UI Tools**
- React Icons  
- Custom CSS / utility classes  
- Toast notifications  

### **Build Tools**
- Node.js  
- NPM  

---


---

## 🔧 How It Works – Student Workflow

### **1. Login**
- Student authenticates with JWT  
- Token is stored in Zustand store  

### **2. View Courses & Assignments**
- All courses pulled from backend  
- Assignments grouped as:
  - Active  
  - Completed  
  - Due Soon  

### **3. Submit Assignment**
- Upload PDF/text  
- File is validated & uploaded to backend  
- Student sees “Submitted” status  

### **4. Auto-Grading (Backend Process)**
While backend handles:
- Text extraction  
- RAG retrieval from vector DB  
- LLM evaluation  
- PiScore rubric grading  

### **5. View Feedback**
Once graded:
- Student sees rubric scores  
- AI feedback: strengths, improvements  
- Summary visualization  
- Downloadable report  

---


