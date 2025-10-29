import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, GraduationCap, User, LogOut } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { api, Course, EnrolledCourse } from "@/lib/api";

const Home = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<number | null>(null);

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const fetchData = async () => {
      try {
        const [coursesData, enrolledData] = await Promise.all([
          api.getCourses(token),
          api.getEnrolledCourses(token),
        ]);
        setCourses(coursesData);
        setEnrolledCourses(enrolledData);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load courses. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, navigate]);

  const isEnrolled = (courseId: number) => {
    return enrolledCourses.some(course => course.id === courseId);
  };

  const handleEnrollCourse = async (courseId: number) => {
    if (!token) return;
    
    setEnrolling(courseId);
    try {
      await api.enrollCourse(token, courseId);
      toast({
        title: "Enrolled successfully",
        description: "You have been enrolled in the course.",
      });
      
      // Refresh enrolled courses
      const enrolledData = await api.getEnrolledCourses(token);
      setEnrolledCourses(enrolledData);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to enroll in course.",
        variant: "destructive",
      });
    } finally {
      setEnrolling(null);
    }
  };

  const handleViewCourse = (courseId: number) => {
    navigate(`/course/${courseId}`);
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "See you next time!",
    });
    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 100);
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
          <h2 className="text-3xl font-bold mb-2">Welcome, {user?.full_name}!</h2>
          <p className="text-muted-foreground">Manage your courses</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <p className="text-muted-foreground">Loading courses...</p>
          </div>
        ) : (
          <Tabs defaultValue="available" className="w-full">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="available">Available Courses</TabsTrigger>
              <TabsTrigger value="enrolled">Enrolled Courses</TabsTrigger>
            </TabsList>
            
            <TabsContent value="available" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {courses.length === 0 ? (
                  <Card className="col-span-full">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground text-center">
                        No courses available at the moment.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  courses.map((course) => {
                    const enrolled = isEnrolled(course.id);
                    return (
                      <Card key={course.id} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <CardTitle className="text-xl">{course.course_name}</CardTitle>
                          <div className="text-sm font-mono text-muted-foreground">{course.course_code}</div>
                          <CardDescription>{course.course_description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button 
                            onClick={() => handleEnrollCourse(course.id)} 
                            className="w-full"
                            disabled={enrolling === course.id || enrolled}
                          >
                            {enrolled ? "Already Enrolled" : enrolling === course.id ? "Enrolling..." : "Enroll"}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="enrolled" className="mt-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {enrolledCourses.length === 0 ? (
                  <Card className="col-span-full">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-muted-foreground text-center">
                        You haven't enrolled in any courses yet.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  enrolledCourses.map((course) => (
                    <Card key={course.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-xl">{course.course_name}</CardTitle>
                        <div className="text-sm font-mono text-muted-foreground">{course.course_code}</div>
                        <CardDescription>{course.course_description}</CardDescription>
                        <div className="text-sm text-muted-foreground mt-2">
                          <p>Professor: {course.professor_name}</p>
                          <p>Institution: {course.institution_name}</p>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Button onClick={() => handleViewCourse(course.id)} className="w-full">
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Home;
