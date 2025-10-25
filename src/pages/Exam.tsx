import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Send } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Mock data - replace with actual API calls
const mockExam = {
  id: 1,
  title: "Midterm Exam",
  questions: [
    {
      id: 1,
      text: "Explain the concept of Object-Oriented Programming and its main principles.",
      rubric: "Points: 10. Should cover encapsulation, inheritance, polymorphism, and abstraction.",
    },
    {
      id: 2,
      text: "Write a function that reverses a string without using built-in reverse methods.",
      rubric: "Points: 15. Code should be clean, efficient, and handle edge cases.",
    },
    {
      id: 3,
      text: "What are the differences between stack and heap memory allocation?",
      rubric: "Points: 10. Should explain key differences, use cases, and implications.",
    },
  ],
};

const Exam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSubmit = async () => {
    // TODO: Replace with actual backend API call
    // Example: await fetch('YOUR_BACKEND_URL/api/submit-exam', { method: 'POST', body: JSON.stringify({ examId, answers }) })
    
    setShowConfirmation(true);
  };

  const handleConfirmSubmit = () => {
    toast({
      title: "Exam submitted successfully!",
      description: "Your answers have been recorded. You can view your grades once grading is complete.",
    });
    navigate("/grades");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-primary">{mockExam.title}</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {mockExam.questions.map((question, index) => (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle className="text-xl">
                  Question {index + 1}
                </CardTitle>
                <p className="text-base font-normal mt-2">{question.text}</p>
                <p className="text-sm text-muted-foreground mt-2 italic">{question.rubric}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor={`answer-${question.id}`}>Your Answer</Label>
                  <Textarea
                    id={`answer-${question.id}`}
                    placeholder="Type your answer here..."
                    value={answers[question.id] || ""}
                    onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                    className="min-h-[150px]"
                  />
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="bg-accent/20 border-primary">
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Make sure to review all answers before submitting
                </p>
                <Button onClick={handleSubmit} size="lg">
                  <Send className="h-4 w-4 mr-2" />
                  Submit Exam
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Exam Submitted Successfully!</AlertDialogTitle>
            <AlertDialogDescription>
              Your answers have been submitted successfully. The AI auto-grader will evaluate your responses and you can view your results in the Grades section.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleConfirmSubmit}>
              View Grades
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Exam;
