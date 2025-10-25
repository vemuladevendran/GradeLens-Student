import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, FileText, ClipboardList, GraduationCap, Download } from "lucide-react";

// Mock data - replace with actual API calls
const mockCourse = {
  id: 1,
  name: "Introduction to Computer Science",
  description: "Learn the fundamentals of programming and computational thinking",
  notes: [
    { id: 1, title: "Course Syllabus", type: "PDF", url: "#" },
    { id: 2, title: "Week 1 - Introduction to Programming", type: "PDF", url: "#" },
    { id: 3, title: "Week 2 - Variables and Data Types", type: "PDF", url: "#" },
  ],
  assignments: [
    { id: 1, title: "Assignment 1 - Hello World", dueDate: "2025-11-01" },
    { id: 2, title: "Assignment 2 - Variables Practice", dueDate: "2025-11-08" },
    { id: 3, title: "Assignment 3 - Control Flow", dueDate: "2025-11-15" },
  ],
  exams: [
    { id: 1, title: "Midterm Exam", date: "2025-11-20" },
    { id: 2, title: "Final Exam", date: "2025-12-15" },
  ],
};

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  // TODO: Fetch course details from backend using courseId

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/home")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-primary">{mockCourse.name}</h1>
          <p className="text-muted-foreground mt-2">{mockCourse.description}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="notes" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger value="notes">
              <FileText className="h-4 w-4 mr-2" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="assignments">
              <ClipboardList className="h-4 w-4 mr-2" />
              Assignments
            </TabsTrigger>
            <TabsTrigger value="exams">
              <GraduationCap className="h-4 w-4 mr-2" />
              Exams
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="mt-6">
            <div className="space-y-4">
              {mockCourse.notes.map((note) => (
                <Card key={note.id}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-lg">{note.title}</CardTitle>
                        <CardDescription>{note.type}</CardDescription>
                      </div>
                    </div>
                    <Button size="sm" variant="secondary">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="assignments" className="mt-6">
            <div className="space-y-4">
              {mockCourse.assignments.map((assignment) => (
                <Card key={assignment.id}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex items-center gap-3">
                      <ClipboardList className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-lg">{assignment.title}</CardTitle>
                        <CardDescription>Due: {assignment.dueDate}</CardDescription>
                      </div>
                    </div>
                    <Button size="sm">Open</Button>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="exams" className="mt-6">
            <div className="space-y-4">
              {mockCourse.exams.map((exam) => (
                <Card key={exam.id}>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div className="flex items-center gap-3">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-lg">{exam.title}</CardTitle>
                        <CardDescription>Scheduled: {exam.date}</CardDescription>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => navigate(`/exam/${exam.id}`)}>
                      Start Exam
                    </Button>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CourseDetails;
