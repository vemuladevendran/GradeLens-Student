import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, GraduationCap, User, LogOut } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Mock data - replace with actual API calls
const mockAvailableCourses = [
  { id: 1, name: "Introduction to Computer Science", description: "Learn the fundamentals of programming and computational thinking", enrolled: false },
  { id: 2, name: "Data Structures & Algorithms", description: "Master essential data structures and algorithmic problem solving", enrolled: false },
  { id: 3, name: "Web Development", description: "Build modern web applications with React and Node.js", enrolled: false },
  { id: 4, name: "Machine Learning Basics", description: "Introduction to ML concepts and practical applications", enrolled: false },
];

const Home = () => {
  const navigate = useNavigate();
  const [availableCourses, setAvailableCourses] = useState(mockAvailableCourses);
  const [enrolledCourses, setEnrolledCourses] = useState<typeof mockAvailableCourses>([]);

  const handleEnroll = (courseId: number) => {
    // TODO: Replace with actual backend API call
    const course = availableCourses.find(c => c.id === courseId);
    if (course) {
      setEnrolledCourses([...enrolledCourses, { ...course, enrolled: true }]);
      setAvailableCourses(availableCourses.filter(c => c.id !== courseId));
      toast({
        title: "Enrolled successfully",
        description: `You are now enrolled in ${course.name}`,
      });
    }
  };

  const handleViewCourse = (courseId: number) => {
    navigate(`/course/${courseId}`);
  };

  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "See you next time!",
    });
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">Student Portal</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/grades")}>
              <BookOpen className="h-4 w-4 mr-2" />
              Grades
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate("/profile")}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Welcome, Student!</h2>
          <p className="text-muted-foreground">Explore and enroll in courses to begin your learning journey</p>
        </div>

        <Tabs defaultValue="available" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="available">Available Courses</TabsTrigger>
            <TabsTrigger value="enrolled">Enrolled Courses</TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {availableCourses.map((course) => (
                <Card key={course.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl">{course.name}</CardTitle>
                    <CardDescription>{course.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button onClick={() => handleEnroll(course.id)} className="w-full">
                      Enroll Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="enrolled" className="mt-6">
            {enrolledCourses.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground text-center">
                    You haven't enrolled in any courses yet. Browse available courses to get started!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {enrolledCourses.map((course) => (
                  <Card key={course.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-xl">{course.name}</CardTitle>
                      <CardDescription>{course.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button onClick={() => handleViewCourse(course.id)} className="w-full" variant="secondary">
                        View Course
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Home;
