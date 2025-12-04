import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
    const [rides, setRides] = useState([]);
    const [users, setUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('rides');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // We need to create these endpoints in backend
            const ridesRes = await axios.get('http://localhost:5000/api/admin/rides');
            const usersRes = await axios.get('http://localhost:5000/api/admin/users');
            setRides(ridesRes.data);
            setUsers(usersRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>

            <div className="flex gap-4 mb-6">
                <button
                    onClick={() => setActiveTab('rides')}
                    className={`px-6 py-2 rounded font-bold ${activeTab === 'rides' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                >
                    All Rides
                </button>
                <button
                    onClick={() => setActiveTab('users')}
                    className={`px-6 py-2 rounded font-bold ${activeTab === 'users' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'}`}
                >
                    All Users
                </button>
            </div>

            {activeTab === 'rides' && (
                <div className="bg-white rounded shadow overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4 font-semibold">ID</th>
                                <th className="p-4 font-semibold">Rider</th>
                                <th className="p-4 font-semibold">Driver</th>
                                <th className="p-4 font-semibold">Vehicle</th>
                                <th className="p-4 font-semibold">Fare</th>
                                <th className="p-4 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rides.map(ride => (
                                <tr key={ride._id} className="border-b hover:bg-gray-50">
                                    <td className="p-4 text-sm text-gray-500">{ride._id.slice(-6)}</td>
                                    <td className="p-4">{ride.rider?.name || 'N/A'}</td>
                                    <td className="p-4">{ride.driver?.name || 'Pending'}</td>
                                    <td className="p-4 capitalize">{ride.vehicleType}</td>
                                    <td className="p-4">₹{ride.fare}</td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${ride.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                ride.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                    'bg-blue-100 text-blue-800'
                                            }`}>
                                            {ride.status.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="bg-white rounded shadow overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-4 font-semibold">Name</th>
                                <th className="p-4 font-semibold">Email</th>
                                <th className="p-4 font-semibold">Role</th>
                                <th className="p-4 font-semibold">Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user._id} className="border-b hover:bg-gray-50">
                                    <td className="p-4 font-medium">{user.name}</td>
                                    <td className="p-4 text-gray-600">{user.email}</td>
                                    <td className="p-4 capitalize">{user.role}</td>
                                    <td className="p-4 text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;