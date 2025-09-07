import Home from "./pages/home"
import Register from "./pages/register";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/admin/dashboard";
import Login from "./pages/login";
import AdminProtectedRoute from "./ProtectedRoutes/admin";
import TeacherProtectedRoute from "./ProtectedRoutes/teacher";
import StudentProtectedRoute from "./ProtectedRoutes/student";
import RedirectIfLoggedIn from "./ProtectedRoutes/RedirectIfLoggedIn";
import ManageSubjects from "./pages/admin/manageSubjects";
import ManageTeachers from "./pages/admin/manageTeachers";
import ManageClasses from "./pages/admin/manageClasses";
import ManageStudents from "./pages/admin/manageStudents";
import ManageFees from "./pages/admin/manageFees";
import TeacherDashboard from "./pages/teacher/dashboard";
import MarkAttendance from "./pages/teacher/markAttendance";
import MyClasses from "./pages/teacher/myClasses";
import Reports from "./pages/teacher/reports";
import TeacherProfile from "./pages/teacher/profile";
import ManageGrades from "./pages/teacher/manageGrades";
import ManageSchedule from "./pages/teacher/manageSchedule";
import StudentDashboard from "./pages/student/dashboard";
import ViewAttendance from "./pages/student/viewAttendance";
import Schedule from "./pages/student/schedule";
import Grades from "./pages/student/grades";
import StudentProfile from "./pages/student/profile";
import Fees from "./pages/student/fees";
import About from "./pages/about";
import Contact from "./pages/contact";
import ForgotPassword from "./pages/forgotPassword";
function App() {
    return <>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/contact" element={<Contact />} />
                <Route
                    path="/login"
                    element={
                        <RedirectIfLoggedIn>
                            <Login />
                        </RedirectIfLoggedIn>
                    }
                />

                <Route
                    path="/register"
                    element={
                        <RedirectIfLoggedIn>
                            <Register/>
                        </RedirectIfLoggedIn>
                    }
                />

                <Route
                    path="/forgot-password"
                    element={
                        <RedirectIfLoggedIn>
                            <ForgotPassword />
                        </RedirectIfLoggedIn>
                    }
                />

                <Route path="/admin" element={
                    <AdminProtectedRoute>
                        <Dashboard />

                    </AdminProtectedRoute>
                } />
                <Route path="/admin/subjects" element={
                    <AdminProtectedRoute>
                        <ManageSubjects />
                    </AdminProtectedRoute>
                } />
                <Route path ="/admin/teachers" element={
                    <AdminProtectedRoute>
                        <ManageTeachers />
                    </AdminProtectedRoute>
                } />
                <Route path ="/admin/classes" element={
                    <AdminProtectedRoute>
                        <ManageClasses />
                    </AdminProtectedRoute>
                } />
                <Route path ="/admin/students" element={
                    <AdminProtectedRoute>
                        <ManageStudents />
                    </AdminProtectedRoute>
                } />
                <Route path ="/admin/fees" element={
                    <AdminProtectedRoute>
                        <ManageFees />
                    </AdminProtectedRoute>
                } />

                {/* Teacher Routes */}
                <Route path="/teacher" element={
                    <TeacherProtectedRoute>
                        <TeacherDashboard />
                    </TeacherProtectedRoute>
                } />
                <Route path="/teacher/attendance" element={
                    <TeacherProtectedRoute>
                        <MarkAttendance />
                    </TeacherProtectedRoute>
                } />
                <Route path="/teacher/classes" element={
                    <TeacherProtectedRoute>
                        <MyClasses />
                    </TeacherProtectedRoute>
                } />
                <Route path="/teacher/reports" element={
                    <TeacherProtectedRoute>
                        <Reports />
                    </TeacherProtectedRoute>
                } />
                <Route path="/teacher/profile" element={
                    <TeacherProtectedRoute>
                        <TeacherProfile />
                    </TeacherProtectedRoute>
                } />
                <Route path="/teacher/grades" element={
                    <TeacherProtectedRoute>
                        <ManageGrades />
                    </TeacherProtectedRoute>
                } />
                <Route path="/teacher/schedule" element={
                    <TeacherProtectedRoute>
                        <ManageSchedule />
                    </TeacherProtectedRoute>
                } />

                {/* Student Routes */}
                <Route path="/student" element={
                    <StudentProtectedRoute>
                        <StudentDashboard />
                    </StudentProtectedRoute>
                } />
                <Route path="/student/attendance" element={
                    <StudentProtectedRoute>
                        <ViewAttendance />
                    </StudentProtectedRoute>
                } />
                <Route path="/student/schedule" element={
                    <StudentProtectedRoute>
                        <Schedule />
                    </StudentProtectedRoute>
                } />
                <Route path="/student/grades" element={
                    <StudentProtectedRoute>
                        <Grades />
                    </StudentProtectedRoute>
                } />
                <Route path="/student/fees" element={
                    <StudentProtectedRoute>
                        <Fees />
                    </StudentProtectedRoute>
                } />
                <Route path="/student/profile" element={
                    <StudentProtectedRoute>
                        <StudentProfile />
                    </StudentProtectedRoute>
                } />
            </Routes>
        </BrowserRouter>
    </>
}

export default App;
