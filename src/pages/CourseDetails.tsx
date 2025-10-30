import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, FileText, GraduationCap, Download } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { api, Exam, EnrolledCourse, Note } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { API_BASE_URL } from "@/lib/config";

const CourseDetails = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [course, setCourse] = useState<EnrolledCourse | null>(null);
  const [exams, setExams] = useState<Exam[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !courseId) {
      navigate("/login", { replace: true });
      return;
    }

    const fetchCourseData = async () => {
      try {
        const [enrolledCourses, examsData, notesData] = await Promise.all([
          api.getEnrolledCourses(token),
          api.getCourseExams(token, parseInt(courseId)),
          api.getCourseNotes(token, parseInt(courseId)),
        ]);
        
        const currentCourse = enrolledCourses.find(c => c.id === parseInt(courseId));
        if (currentCourse) {
          setCourse(currentCourse);
        }
        setExams(examsData);
        setNotes(notesData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load course details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [token, courseId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading course details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Course not found</p>
          <Button onClick={() => navigate("/home")}>Return to Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/home")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-primary">{course.course_name}</h1>
          <p className="text-muted-foreground mt-2">{course.course_description}</p>
          <div className="text-sm text-muted-foreground mt-2">
            <p>Professor: {course.professor_name}</p>
            <p>Institution: {course.institution_name}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="notes" className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-2">
            <TabsTrigger value="notes">
              <FileText className="h-4 w-4 mr-2" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="exams">
              <GraduationCap className="h-4 w-4 mr-2" />
              Exams
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notes" className="mt-6">
            <div className="space-y-4">
              {notes.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                      No notes available for this course.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                notes.map((note) => {
                  const fileName = note.file.split('/').pop() || 'file.pdf';
                  const fileUrl = `${API_BASE_URL}${note.file}`;
                  
                  return (
                    <Card key={note.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <FileText className="h-5 w-5 text-primary mt-1" />
                            <div className="flex-1">
                              <CardTitle className="text-lg">{note.note_name}</CardTitle>
                              <CardDescription className="mt-2">
                                File: {fileName}
                              </CardDescription>
                              <CardDescription className="mt-1">
                                Uploaded: {new Date(note.uploaded_at).toLocaleDateString()}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => window.open(fileUrl, '_blank')}
                            >
                              View
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = fileUrl;
                                link.download = fileName;
                                link.click();
                              }}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>


          <TabsContent value="exams" className="mt-6">
            <div className="space-y-4">
              {exams.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                      No exams available for this course.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                exams.map((exam) => (
                  <Card key={exam.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <GraduationCap className="h-5 w-5 text-primary mt-1" />
                          <div className="flex-1">
                            <CardTitle className="text-lg">{exam.exam_name}</CardTitle>
                            <CardDescription className="mt-2">{exam.rubrics}</CardDescription>
                            <div className="mt-3 text-sm">
                              <span className="text-muted-foreground">
                                Total Score: <span className="font-semibold">{exam.overall_score}</span>
                              </span>
                            </div>
                            {exam.received_score !== undefined && exam.received_score > 0 && (
                              <div className="mt-2 text-sm">
                                <span className="text-primary font-semibold">
                                  Your Score: {exam.received_score}/{exam.overall_score}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => navigate(`/exam/${exam.id}`, { state: { exam, courseId } })}
                          disabled={exam.is_taken}
                        >
                          {exam.is_taken ? "Already Taken" : "Take Test"}
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CourseDetails;
