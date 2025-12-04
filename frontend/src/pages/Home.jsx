import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <h1 className="text-5xl font-bold mb-8">Taxi App</h1>
            <p className="text-xl mb-8">Fast, Reliable, and Safe Rides</p>
            <div className="space-x-4">
                <Link to="/login" className="bg-white text-blue-600 px-6 py-3 rounded font-bold hover:bg-gray-100">Login</Link>
                <Link to="/register" className="bg-transparent border border-white px-6 py-3 rounded font-bold hover:bg-white hover:text-blue-600">Register</Link>
            </div>
        </div>
    );
};

export default Home;