import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Eye, Download } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// Mock data - replace with actual API calls
const mockGrades = [
  {
    id: 1,
    course: "Introduction to Computer Science",
    assignment: "Midterm Exam",
    score: 85,
    maxScore: 100,
    feedback: {
      question1: { score: 8, maxScore: 10, comment: "Good explanation of OOP principles. Could expand on polymorphism." },
      question2: { score: 12, maxScore: 15, comment: "Code works but could be more efficient. Consider edge cases." },
      question3: { score: 9, maxScore: 10, comment: "Excellent explanation of memory allocation differences." },
    },
  },
  {
    id: 2,
    course: "Data Structures & Algorithms",
    assignment: "Assignment 1",
    score: 92,
    maxScore: 100,
    feedback: {
      overall: "Excellent work! Implementation is clean and efficient.",
    },
  },
];

const Grades = () => {
  const navigate = useNavigate();
  const [selectedGrade, setSelectedGrade] = useState<typeof mockGrades[0] | null>(null);

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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course</TableHead>
                    <TableHead>Assignment/Exam</TableHead>
                    <TableHead className="text-center">Score</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockGrades.map((grade) => (
                    <TableRow key={grade.id}>
                      <TableCell className="font-medium">{grade.course}</TableCell>
                      <TableCell>{grade.assignment}</TableCell>
                      <TableCell className="text-center">
                        <span className={`font-semibold ${grade.score >= 90 ? 'text-green-600' : grade.score >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {grade.score}/{grade.maxScore}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex gap-2 justify-center">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="secondary" onClick={() => setSelectedGrade(grade)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Feedback
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>{grade.assignment}</DialogTitle>
                                <DialogDescription>{grade.course}</DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 mt-4">
                                <div className="p-4 bg-accent/30 rounded-lg">
                                  <p className="font-semibold text-lg">
                                    Total Score: {grade.score}/{grade.maxScore}
                                  </p>
                                </div>
                                <div className="space-y-3">
                                  <h3 className="font-semibold">AI Feedback:</h3>
                                  {Object.entries(grade.feedback).map(([key, value]) => (
                                    <div key={key} className="p-3 border rounded-lg">
                                      <p className="font-medium capitalize mb-1">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                      </p>
                                      {typeof value === 'object' && 'score' in value ? (
                                        <>
                                          <p className="text-sm text-muted-foreground mb-1">
                                            Score: {value.score}/{value.maxScore}
                                          </p>
                                          <p className="text-sm">{value.comment}</p>
                                        </>
                                      ) : (
                                        <p className="text-sm">{value}</p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Grades;
