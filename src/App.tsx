import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Catalog from "./pages/Catalog";
import CourseDetail from "./pages/CourseDetail";
import MyLearning from "./pages/MyLearning";
import Profile from "./pages/Profile";
import AdminUsers from "./pages/AdminUsers";
import AdminModules from "./pages/AdminModules";
import AdminCourses from "./pages/AdminCourses";
import Notifications from "./pages/Notifications";
import CourseLearning from "./pages/CourseLearning";
import StudioNew from "./pages/StudioNew";
import StudioEdit from "./pages/StudioEdit";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/catalog" element={<Catalog />} />
                      <Route path="/courses/:courseId" element={<CourseDetail />} />
                      <Route path="/courses/:courseId/learn" element={<CourseLearning />} />
                      <Route path="/me/learning" element={<MyLearning />} />
                      <Route path="/me/profile" element={<Profile />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route
                        path="/admin/users" 
                        element={
                          <ProtectedRoute roles={['ADMIN']}>
                            <AdminUsers />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/modules" 
                        element={
                          <ProtectedRoute roles={['ADMIN']}>
                            <AdminModules />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="/admin/courses" 
                        element={
                          <ProtectedRoute roles={['ADMIN']}>
                            <AdminCourses />
                          </ProtectedRoute>
                        } 
                      />
                      <Route
                        path="/studio/new"
                        element={
                          <ProtectedRoute roles={['INSTRUCTOR', 'ADMIN']}>
                            <StudioNew />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/studio/:courseId/edit"
                        element={
                          <ProtectedRoute roles={['INSTRUCTOR', 'ADMIN']}>
                            <StudioEdit />
                          </ProtectedRoute>
                        }
                      />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </AppLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
