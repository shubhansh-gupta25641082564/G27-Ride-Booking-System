import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('rider');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', { name, email, password, role });
            login(res.data.user, res.data.token);
            if (res.data.user.role === 'rider') {
                navigate('/rider');
            } else {
                navigate('/driver');
            }
        } catch (err) {
            console.error(err);
            alert('Registration failed');
        }
    };

    return (
        <div className="flex justify-center items-center h-screen bg-gray-100 relative">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96 relative z-50">
                <h2 className="text-2xl mb-4 font-bold text-center">Register</h2>
                <div className="mb-4">
                    <label className="block mb-1">Name</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border p-2 rounded" required />
                </div>
                <div className="mb-4">
                    <label className="block mb-1">Email</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border p-2 rounded" required />
                </div>
                <div className="mb-4">
                    <label className="block mb-1">Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border p-2 rounded" required />
                </div>
                <div className="mb-4">
                    <label className="block mb-1">Role</label>
                    <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full border p-2 rounded">
                        <option value="rider">Rider</option>
                        <option value="driver">Driver</option>
                    </select>
                </div>
                <button type="submit" className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600">Register</button>
                <p className="mt-4 text-center">
                    Already have an account? <Link to="/login" className="text-blue-500">Login</Link>
                </p>
            </form>
        </div>
    );
};

export default Register;