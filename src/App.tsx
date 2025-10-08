import { Toaster } from "@/components/molecules/toaster";
import { Toaster as Sonner } from "@/components/atoms/sonner";
import { TooltipProvider } from "@/components/atoms/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/templates/ProtectedRoute";
import { AppLayout } from "@/components/templates/AppLayout";
import { Login,
        Dashboard,
        Catalog,
        CourseDetail,
        MyLearning,
        Profile,
        AdminUsers,
        AdminModules,
        AdminCourses,
        CourseLearning,
        StudioNew,
        StudioEdit,
        NotFound,
        Register
      } from "@/pages";
import { RoutePermissions } from '@/config/routePermissions';

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
                      {/* Rutas públicas autenticadas */}
                      <Route index element={<Dashboard />} />
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="catalog" element={<Catalog />} />
                      <Route path="courses/:courseId" element={<CourseDetail />} />
                      <Route path="courses/:courseId/learn" element={<CourseLearning />} />
                      <Route path="me/learning" element={<MyLearning />} />
                      <Route path="me/profile" element={<Profile />} />

                      {/* Rutas administrativas */}
                      <Route
                        path="admin/users" 
                        element={
                          <ProtectedRoute roles={RoutePermissions.MANAGE_USERS}>
                            <AdminUsers />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="admin/modules" 
                        element={
                          <ProtectedRoute roles={RoutePermissions.MANAGE_MODULES}>
                            <AdminModules />
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="admin/courses" 
                        element={
                          <ProtectedRoute roles={RoutePermissions.MANAGE_COURSES}>
                            <AdminCourses />
                          </ProtectedRoute>
                        } 
                      />

                      {/* Rutas de instructor */}
                      <Route
                        path="studio/new"
                        element={
                          <ProtectedRoute roles={RoutePermissions.STUDIO_ACCESS}>
                            <StudioNew />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="studio/:courseId/edit"
                        element={
                          <ProtectedRoute roles={RoutePermissions.STUDIO_ACCESS}>
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
