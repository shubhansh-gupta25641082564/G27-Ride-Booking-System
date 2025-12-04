import React, { useState, useEffect, useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import io from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const socket = io('http://localhost:5000');

const DriverDashboard = () => {
    const { user } = useContext(AuthContext);
    const [isOnline, setIsOnline] = useState(false);
    const [availableRides, setAvailableRides] = useState([]);
    const [currentRide, setCurrentRide] = useState(null);
    const [routePositions, setRoutePositions] = useState([]);

    useEffect(() => {
        if (user) {
            socket.emit('join', user.id);
        }
        fetchAvailableRides();

        socket.on('ride_requested', (newRide) => {
            setAvailableRides(prev => [...prev, newRide]);
        });

        return () => {
            socket.off('ride_requested');
        };
    }, [user]);

    // Fetch Route when ride is accepted
    useEffect(() => {
        if (currentRide) {
            const fetchRoute = async () => {
                try {
                    const pickup = currentRide.pickupLocation.coordinates;
                    const dropoff = currentRide.dropoffLocation.coordinates;
                    // OSRM expects lng,lat
                    const res = await axios.get(`http://router.project-osrm.org/route/v1/driving/${pickup[0]},${pickup[1]};${dropoff[0]},${dropoff[1]}?overview=full&geometries=geojson`);
                    const route = res.data.routes[0];
                    const coords = route.geometry.coordinates.map(c => [c[1], c[0]]);
                    setRoutePositions(coords);
                } catch (err) {
                    console.error(err);
                }
            };
            fetchRoute();
        } else {
            setRoutePositions([]);
        }
    }, [currentRide]);

    const fetchAvailableRides = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/rides/available');
            setAvailableRides(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const acceptRide = async (rideId) => {
        try {
            const res = await axios.put(`http://localhost:5000/api/rides/${rideId}/accept`, { driverId: user.id });
            setCurrentRide(res.data);
            setAvailableRides(availableRides.filter(r => r._id !== rideId));
        } catch (err) {
            console.error(err);
            alert('Error accepting ride');
        }
    };

    const updateStatus = async (status) => {
        try {
            const res = await axios.put(`http://localhost:5000/api/rides/${currentRide._id}/status`, { status });
            setCurrentRide(res.data);
            if (status === 'completed') {
                alert(`Ride Completed! Fare: ₹${currentRide.fare}`);
                setCurrentRide(null);
                fetchAvailableRides();
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="h-screen flex flex-col md:flex-row">
            <div className="w-full md:w-1/3 bg-white p-4 shadow-lg z-20 overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold">Driver Panel</h1>
                    <button
                        onClick={() => setIsOnline(!isOnline)}
                        className={`px-4 py-2 rounded text-white font-bold ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}
                    >
                        {isOnline ? 'GO ONLINE' : 'GO OFFLINE'}
                    </button>
                </div>

                {isOnline && !currentRide && (
                    <div className="mt-4">
                        <h2 className="font-bold mb-2 text-gray-600">NEARBY REQUESTS</h2>
                        <div className="space-y-2">
                            {availableRides.length === 0 ? <p className="text-gray-400">Searching for rides...</p> : availableRides.map(ride => (
                                <div key={ride._id} className="border p-3 rounded shadow-sm bg-gray-50 hover:bg-gray-100 transition">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg">₹{ride.fare}</h3>
                                            <p className="text-sm text-gray-500 capitalize">{ride.vehicleType} • {ride.distance} km</p>
                                        </div>
                                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">New</span>
                                    </div>
                                    <div className="mt-2 text-sm">
                                        <p><strong>From:</strong> {ride.pickupLocation.address}</p>
                                        <p><strong>To:</strong> {ride.dropoffLocation.address}</p>
                                    </div>
                                    <button
                                        onClick={() => acceptRide(ride._id)}
                                        className="w-full mt-3 bg-black text-white py-2 rounded font-bold hover:bg-gray-800"
                                    >
                                        Accept Ride
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {currentRide && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded shadow-md">
                        <h2 className="font-bold text-blue-800 text-lg mb-2">Current Trip</h2>
                        <div className="mb-4">
                            <p className="text-sm text-gray-600">Status</p>
                            <p className="font-bold text-xl capitalize">{currentRide.status}</p>
                        </div>

                        <div className="space-y-2 mb-4">
                            <div>
                                <p className="text-xs text-gray-500">PICKUP</p>
                                <p className="font-medium">{currentRide.pickupLocation.address}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">DROPOFF</p>
                                <p className="font-medium">{currentRide.dropoffLocation.address}</p>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            {currentRide.status === 'accepted' && (
                                <button onClick={() => updateStatus('started')} className="flex-1 bg-green-600 text-white py-3 rounded font-bold hover:bg-green-700">
                                    Start Trip
                                </button>
                            )}
                            {currentRide.status === 'started' && (
                                <button onClick={() => updateStatus('completed')} className="flex-1 bg-red-600 text-white py-3 rounded font-bold hover:bg-red-700">
                                    End Trip
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-1 relative z-0">
                <MapContainer center={[28.6139, 77.2090]} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap contributors'
                    />
                    {/* Show pickup markers for available rides */}
                    {!currentRide && availableRides.map(ride => (
                        <Marker key={ride._id} position={[ride.pickupLocation.coordinates[1], ride.pickupLocation.coordinates[0]]}>
                            <Popup>
                                <p className="font-bold">₹{ride.fare}</p>
                                <button onClick={() => acceptRide(ride._id)} className="bg-blue-500 text-white px-2 py-1 rounded text-xs">Accept</button>
                            </Popup>
                        </Marker>
                    ))}

                    {/* Show current ride markers and route */}
                    {currentRide && (
                        <>
                            <Marker position={[currentRide.pickupLocation.coordinates[1], currentRide.pickupLocation.coordinates[0]]}>
                                <Popup>Pickup</Popup>
                            </Marker>
                            <Marker position={[currentRide.dropoffLocation.coordinates[1], currentRide.dropoffLocation.coordinates[0]]}>
                                <Popup>Dropoff</Popup>
                            </Marker>
                            {routePositions.length > 0 && <Polyline positions={routePositions} color="blue" weight={5} />}
                        </>
                    )}
                </MapContainer>
            </div>
        </div>
    );
};

export default DriverDashboard;