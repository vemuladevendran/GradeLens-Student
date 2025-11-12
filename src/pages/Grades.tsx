import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Eye, Loader2, BarChart3 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api, GradeExam } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Grades = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [grades, setGrades] = useState<GradeExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState<GradeExam | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [selectedExam, setSelectedExam] = useState<string>("all");
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    const fetchGrades = async () => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        const response = await api.getGrades(token);
        setGrades(response.exams);
      } catch (error: any) {
        toast.error(error.message || "Failed to load grades");
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [token, navigate]);

  // Get unique courses and exams for filters
  const courses = useMemo(() => {
    const uniqueCourses = new Map<string, { id: number; name: string; code: string }>();
    grades.forEach(grade => {
      uniqueCourses.set(`${grade.course_id}`, {
        id: grade.course_id,
        name: grade.course_name,
        code: grade.course_code
      });
    });
    return Array.from(uniqueCourses.values());
  }, [grades]);

  const exams = useMemo(() => {
    const uniqueExams = new Map<string, { id: number; name: string }>();
    grades.forEach(grade => {
      uniqueExams.set(`${grade.exam_id}`, {
        id: grade.exam_id,
        name: grade.exam_name
      });
    });
    return Array.from(uniqueExams.values());
  }, [grades]);

  // Filter grades based on selected course and exam
  const filteredGrades = useMemo(() => {
    return grades.filter(grade => {
      const courseMatch = selectedCourse === "all" || grade.course_id.toString() === selectedCourse;
      const examMatch = selectedExam === "all" || grade.exam_id.toString() === selectedExam;
      return courseMatch && examMatch;
    });
  }, [grades, selectedCourse, selectedExam]);

  // Calculate analytics
  const analytics = useMemo(() => {
    if (filteredGrades.length === 0) return null;

    const gradedExams = filteredGrades.filter(g => g.graded_answers_count === g.questions_count);
    const totalExams = filteredGrades.length;
    const pendingExams = totalExams - gradedExams.length;

    if (gradedExams.length === 0) return { totalExams, pendingExams, averageScore: 0, highestScore: 0, lowestScore: 0 };

    const scores = gradedExams.map(g => {
      const totalScore = g.answers.reduce((sum, a) => sum + a.question_weight, 0);
      return totalScore > 0 ? (g.overall_received_score / totalScore) * 100 : 0;
    });

    return {
      totalExams,
      pendingExams,
      averageScore: scores.reduce((sum, s) => sum + s, 0) / scores.length,
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores)
    };
  }, [filteredGrades]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/home")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
          <h1 className="text-3xl font-bold text-primary">My Grades</h1>
          <p className="text-muted-foreground mt-2">View your grades and AI-generated feedback</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Analytics Card */}
        {showAnalytics && analytics && (
          <Card>
            <CardHeader>
              <CardTitle>Grade Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="p-4 bg-primary/5 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Total Exams</p>
                  <p className="text-2xl font-bold text-primary">{analytics.totalExams}</p>
                </div>
                <div className="p-4 bg-yellow-500/10 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">{analytics.pendingExams}</p>
                </div>
                <div className="p-4 bg-blue-500/10 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Average Score</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-500">{analytics.averageScore.toFixed(1)}%</p>
                </div>
                <div className="p-4 bg-green-500/10 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Highest Score</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-500">{analytics.highestScore.toFixed(1)}%</p>
                </div>
                <div className="p-4 bg-red-500/10 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Lowest Score</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-500">{analytics.lowestScore.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Grades Table Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>Grade Summary</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAnalytics(!showAnalytics)}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                {showAnalytics ? "Hide" : "Show"} Analytics
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : grades.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No graded exams yet
              </div>
            ) : (
              <>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Filter by course" />
                      </SelectTrigger>
                      <SelectContent className="bg-card z-50">
                        <SelectItem value="all">All Courses</SelectItem>
                        {courses.map(course => (
                          <SelectItem key={course.id} value={course.id.toString()}>
                            {course.name} ({course.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <Select value={selectedExam} onValueChange={setSelectedExam}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Filter by exam" />
                      </SelectTrigger>
                      <SelectContent className="bg-card z-50">
                        <SelectItem value="all">All Exams</SelectItem>
                        {exams.map(exam => (
                          <SelectItem key={exam.id} value={exam.id.toString()}>
                            {exam.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {filteredGrades.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No exams match the selected filters
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Course</TableHead>
                      <TableHead>Exam</TableHead>
                      <TableHead className="text-center">Score</TableHead>
                      <TableHead className="text-center">Graded</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredGrades.map((grade) => {
                      const totalScore = grade.answers.reduce((sum, a) => sum + a.question_weight, 0);
                      const percentage = totalScore > 0 ? (grade.overall_received_score / totalScore) * 100 : 0;
                      const isFullyGraded = grade.graded_answers_count === grade.questions_count;
                      
                      return (
                        <TableRow key={`${grade.course_id}-${grade.exam_id}`}>
                          <TableCell className="font-medium">
                            <div>
                              <div>{grade.course_name}</div>
                              <div className="text-xs text-muted-foreground">{grade.course_code}</div>
                            </div>
                          </TableCell>
                          <TableCell>{grade.exam_name}</TableCell>
                          <TableCell className="text-center">
                            {isFullyGraded ? (
                              <span className={`font-semibold ${
                                percentage >= 90 ? 'text-green-600 dark:text-green-500' : 
                                percentage >= 70 ? 'text-yellow-600 dark:text-yellow-500' : 
                                'text-red-600 dark:text-red-500'
                              }`}>
                                {grade.overall_received_score.toFixed(1)}/{totalScore}
                              </span>
                            ) : (
                              <span className="font-semibold text-yellow-600 dark:text-yellow-500">
                                Pending
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-sm text-muted-foreground">
                              {grade.graded_answers_count}/{grade.questions_count}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="secondary" onClick={() => setSelectedGrade(grade)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Feedback
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>{grade.exam_name}</DialogTitle>
                                  <DialogDescription>
                                    {grade.course_name} ({grade.course_code})
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 mt-4">
                                  <div className="p-4 bg-accent/30 rounded-lg">
                                    <p className="font-semibold text-lg mb-1">
                                      Total Score: {grade.overall_received_score.toFixed(1)}/{totalScore}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      Submitted: {new Date(grade.submitted_at).toLocaleString()}
                                    </p>
                                    {grade.overall_feedback && (
                                      <p className="text-sm mt-2 pt-2 border-t">
                                        <span className="font-medium">Overall Feedback: </span>
                                        {grade.overall_feedback}
                                      </p>
                                    )}
                                  </div>
                                  <div className="space-y-3">
                                    <h3 className="font-semibold">Question-by-Question Feedback:</h3>
                                    {grade.answers.map((answer, idx) => (
                                      <div key={answer.question_id} className="p-4 border rounded-lg space-y-2">
                                        <div className="flex justify-between items-start gap-4">
                                          <p className="font-medium flex-1">
                                            Question {idx + 1}: {answer.question_text}
                                          </p>
                                          <span className={`font-semibold text-sm whitespace-nowrap ${
                                            (answer.received_weight / answer.question_weight) >= 0.9 ? 'text-green-600 dark:text-green-500' :
                                            (answer.received_weight / answer.question_weight) >= 0.7 ? 'text-yellow-600 dark:text-yellow-500' :
                                            'text-red-600 dark:text-red-500'
                                          }`}>
                                            {answer.received_weight.toFixed(1)}/{answer.question_weight}
                                          </span>
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                          Min words: {answer.min_words}
                                        </div>
                                        <div className="p-3 bg-muted/50 rounded text-sm">
                                          <p className="font-medium mb-1">Your Answer:</p>
                                          <p className="whitespace-pre-wrap">{answer.answer_text}</p>
                                        </div>
                                        {answer.feedback && (
                                          <div className="p-3 bg-primary/5 border-l-2 border-primary rounded text-sm">
                                            <p className="font-medium mb-1">AI Feedback:</p>
                                            <p>{answer.feedback}</p>
                                          </div>
                                        )}
                                        {!answer.is_graded && (
                                          <div className="text-xs text-muted-foreground">
                                            Not yet graded
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Grades;
