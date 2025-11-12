import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Eye, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { api, GradeExam } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Grades = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [grades, setGrades] = useState<GradeExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGrade, setSelectedGrade] = useState<GradeExam | null>(null);

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
      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Grade Summary</CardTitle>
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
                    {grades.map((grade) => {
                      const totalScore = grade.answers.reduce((sum, a) => sum + a.question_weight, 0);
                      const percentage = totalScore > 0 ? (grade.overall_received_score / totalScore) * 100 : 0;
                      
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
                            <span className={`font-semibold ${
                              percentage >= 90 ? 'text-green-600 dark:text-green-500' : 
                              percentage >= 70 ? 'text-yellow-600 dark:text-yellow-500' : 
                              'text-red-600 dark:text-red-500'
                            }`}>
                              {grade.overall_received_score.toFixed(1)}/{totalScore}
                            </span>
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
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Grades;
