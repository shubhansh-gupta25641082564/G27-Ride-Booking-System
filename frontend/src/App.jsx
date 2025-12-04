import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const RiderDashboard = lazy(() => import('./pages/RiderDashboard'));
const DriverDashboard = lazy(() => import('./pages/DriverDashboard'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

const Loading = () => <div className="flex justify-center items-center h-screen">Loading...</div>;

function App() {
    return (
        <AuthProvider>
            <Router>
                <Suspense fallback={<Loading />}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/rider" element={<RiderDashboard />} />
                        <Route path="/driver" element={<DriverDashboard />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                    </Routes>
                </Suspense>
            </Router>
        </AuthProvider>
    );
}

export default App;