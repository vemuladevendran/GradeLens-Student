import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Send, Upload, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { api, TakeExamResponse } from "@/lib/api";
import * as pdfjsLib from "pdfjs-dist";

// Configure PDF.js worker for Vite
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

const Exam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const [exam, setExam] = useState<TakeExamResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [wordCounts, setWordCounts] = useState<Record<number, number>>({});
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const courseId = location.state?.courseId;

  useEffect(() => {
    if (!token || !examId || !courseId) {
      navigate("/home", { replace: true });
      return;
    }
    
    const fetchExamData = async () => {
      try {
        const examData = await api.takeExam(token, parseInt(courseId), parseInt(examId));
        setExam(examData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load exam. Please try again.",
          variant: "destructive",
        });
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    fetchExamData();
  }, [token, examId, courseId, navigate]);

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers({ ...answers, [questionId]: value });
    const wordCount = value.trim().split(/\s+/).filter(word => word.length > 0).length;
    setWordCounts({ ...wordCounts, [questionId]: wordCount });
  };

  const handleSubmit = async () => {
    if (!token || !examId || !courseId) return;

    setSubmitting(true);
    try {
      const payload = {
        answers: Object.entries(answers).map(([questionId, answerText]) => ({
          question_id: parseInt(questionId),
          answer_text: answerText,
        })),
      };

      await api.submitExam(token, parseInt(courseId), parseInt(examId), payload);
      
      toast({
        title: "Exam Submitted Successfully!",
        description: "Your answers have been submitted and will be graded soon.",
      });
      
      navigate(`/course/${courseId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit exam. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || file.type !== "application/pdf") {
      toast({
        title: "Invalid file",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
      return;
    }

    setUploadedFile(file);
    setIsParsing(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";

      // Extract text from all pages
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(" ");
        fullText += pageText + "\n";
      }

      console.log("Extracted text from PDF:", fullText);

      // Parse answers from the extracted text
      const parsedAnswers = parseAnswersFromText(fullText);
      console.log("Parsed answers:", parsedAnswers);
      
      // Map question numbers to question IDs and calculate word counts
      const mappedAnswers: Record<number, string> = {};
      const mappedWordCounts: Record<number, number> = {};
      
      exam?.questions?.forEach((question, index) => {
        const questionNumber = index + 1;
        const answer = parsedAnswers[questionNumber];
        if (answer) {
          mappedAnswers[question.id] = answer;
          const wordCount = answer.trim().split(/\s+/).filter(word => word.length > 0).length;
          mappedWordCounts[question.id] = wordCount;
        }
      });
      
      setAnswers(mappedAnswers);
      setWordCounts(mappedWordCounts);

      toast({
        title: "PDF parsed successfully!",
        description: `Extracted ${Object.keys(mappedAnswers).length} answers from the PDF.`,
      });
    } catch (error) {
      console.error("Error parsing PDF:", error);
      toast({
        title: "Error parsing PDF",
        description: "Failed to extract answers from the PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsParsing(false);
    }
  };

  const parseAnswersFromText = (text: string): Record<number, string> => {
    const parsedAnswers: Record<number, string> = {};
    const numQuestions = exam?.questions?.length || 0;

    // Strategy A: Capture blocks starting with "Question <n>" until next "Question <m>" or end
    const blockRegex = /Question\s*(\d+)\s*[:\.]?\s*([\s\S]*?)(?=Question\s*\d+\s*[:\.]?|$)/gi;
    let m: RegExpExecArray | null;
    while ((m = blockRegex.exec(text)) !== null) {
      const qNum = parseInt(m[1]);
      const ans = (m[2] || "").trim();
      if (qNum && ans && qNum <= numQuestions) {
        parsedAnswers[qNum] = ans;
      }
    }

    // Strategy B: If not found, match common prefixes like "Q1:", "Answer 1:", or numeric lists
    if (Object.keys(parsedAnswers).length === 0) {
      const questionPattern = /(?:question|answer|q\.?|a\.?)\s*(\d+)\s*[:\.]?\s*([\s\S]*?)(?=(?:question|answer|q\.?|a\.?)\s*\d+\s*[:\.]?|$)/gi;
      let match;
      while ((match = questionPattern.exec(text)) !== null) {
        const questionNum = parseInt(match[1]);
        const answer = (match[2] || "").trim();
        if (questionNum && answer && questionNum <= numQuestions) {
          parsedAnswers[questionNum] = answer;
        }
      }
    }

    // Strategy C: Numbered lines fallback (1., 1), 1:, or 1 <space>)
    if (Object.keys(parsedAnswers).length === 0) {
      const lines = text.split(/\r?\n/);
      let currentQuestion = 0;
      let currentAnswer = "";

      lines.forEach((line) => {
        const trimmedLine = line.trim();
        const numberMatch = trimmedLine.match(/^(\d+)[\.\):\s]+(.*)$/);
        if (numberMatch) {
          if (currentQuestion > 0 && currentAnswer) {
            parsedAnswers[currentQuestion] = currentAnswer.trim();
          }
          currentQuestion = parseInt(numberMatch[1]);
          currentAnswer = numberMatch[2] || "";
        } else if (currentQuestion > 0 && trimmedLine) {
          currentAnswer += (currentAnswer ? " " : "") + trimmedLine;
        }
      });

      if (currentQuestion > 0 && currentAnswer) {
        parsedAnswers[currentQuestion] = currentAnswer.trim();
      }
    }

    return parsedAnswers;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading exam...</p>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Exam not found</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-primary">{exam.exam_name}</h1>
          <p className="text-sm text-muted-foreground mt-1">{exam.rubrics}</p>
          <p className="text-sm text-muted-foreground">Total Score: {exam.overall_score}</p>
          <p className="text-sm text-muted-foreground">Questions: {exam.questions?.length || 0}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
          {/* PDF Upload Section */}
          <Card className="border-2 border-dashed border-primary/30 bg-accent/10">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <FileText className="h-8 w-8" />
                  <h3 className="text-lg font-semibold">Upload Answer PDF</h3>
                </div>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  Upload a PDF containing your answers and we'll automatically fill in the answer fields below.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isParsing}
                  size="lg"
                  variant="outline"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {isParsing ? "Parsing PDF..." : uploadedFile ? "Change PDF" : "Upload PDF"}
                </Button>
                {uploadedFile && (
                  <p className="text-xs text-muted-foreground">
                    Selected: {uploadedFile.name}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
          {exam.questions?.map((question, index) => (
            <Card key={question.id}>
              <CardHeader>
                <CardTitle className="text-xl">
                  Question {index + 1}
                </CardTitle>
                <p className="text-base font-normal mt-2">{question.question}</p>
                <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                  <span>Weight: {question.question_weight} points</span>
                  <span>Min words: {question.min_words}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor={`answer-${question.id}`}>Your Answer</Label>
                    <span className="text-xs text-muted-foreground">
                      {wordCounts[question.id] || 0} words (min: {question.min_words})
                    </span>
                  </div>
                  <Textarea
                    id={`answer-${question.id}`}
                    placeholder={`Type your answer here (minimum ${question.min_words} words)...`}
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
                <Button onClick={handleSubmit} size="lg" disabled={submitting}>
                  <Send className="h-4 w-4 mr-2" />
                  {submitting ? "Submitting..." : "Submit Exam"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Exam;
