import React, { useState, useEffect, useContext } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, Polyline } from 'react-leaflet';
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

const LocationMarker = ({ setLocation, type }) => {
    useMapEvents({
        click(e) {
            setLocation(e.latlng);
        },
    });
    return null;
};

const RiderDashboard = () => {
    const { user } = useContext(AuthContext);
    const [pickup, setPickup] = useState(null);
    const [dropoff, setDropoff] = useState(null);
    const [pickupAddress, setPickupAddress] = useState('');
    const [dropoffAddress, setDropoffAddress] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [activeSearch, setActiveSearch] = useState(null); // 'pickup' or 'dropoff'
    const [vehicleType, setVehicleType] = useState('bike');
    const [routePositions, setRoutePositions] = useState([]);
    const [distance, setDistance] = useState(0);
    const [fare, setFare] = useState(0);
    const [status, setStatus] = useState('idle');
    const [ride, setRide] = useState(null);

    // Socket Listener
    useEffect(() => {
        if (user) {
            socket.emit('join', user.id);
        }
        socket.on('ride_accepted', (updatedRide) => {
            if (updatedRide.rider === user.id) {
                setRide(updatedRide);
                setStatus('accepted');
                alert('Driver accepted your ride!');
            }
        });
        return () => socket.off('ride_accepted');
    }, [user]);

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (activeSearch === 'pickup' && pickupAddress.length > 2) {
                searchAddress(pickupAddress, 'pickup');
            } else if (activeSearch === 'dropoff' && dropoffAddress.length > 2) {
                searchAddress(dropoffAddress, 'dropoff');
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [pickupAddress, dropoffAddress, activeSearch]);

    const searchAddress = async (query, type) => {
        try {
            const res = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
            setSearchResults(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleInput = (e, type) => {
        if (type === 'pickup') setPickupAddress(e.target.value);
        else setDropoffAddress(e.target.value);
        setActiveSearch(type);
    };

    const selectAddress = (result) => {
        const latlng = { lat: parseFloat(result.lat), lng: parseFloat(result.lon) };
        if (activeSearch === 'pickup') {
            setPickup(latlng);
            setPickupAddress(result.display_name);
        } else {
            setDropoff(latlng);
            setDropoffAddress(result.display_name);
        }
        setSearchResults([]);
        setActiveSearch(null);
    };

    // Calculate Route & Fare
    useEffect(() => {
        if (pickup && dropoff) {
            const fetchRoute = async () => {
                try {
                    const res = await axios.get(`http://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${dropoff.lng},${dropoff.lat}?overview=full&geometries=geojson`);
                    const route = res.data.routes[0];
                    const coords = route.geometry.coordinates.map(c => [c[1], c[0]]); // Swap for Leaflet
                    setRoutePositions(coords);
                    setDistance(route.distance / 1000); // meters to km

                    // Estimate Fare
                    const rates = { bike: 10, auto: 15, car: 25 };
                    const baseFare = { bike: 20, auto: 30, car: 50 };
                    const estimated = Math.round(baseFare[vehicleType] + (rates[vehicleType] * (route.distance / 1000)));
                    setFare(estimated);
                } catch (err) {
                    console.error(err);
                }
            };
            fetchRoute();
        }
    }, [pickup, dropoff, vehicleType]);

    const requestRide = async () => {
        if (!pickup || !dropoff) return;
        try {
            setStatus('requesting');
            const res = await axios.post('http://localhost:5000/api/rides/request', {
                riderId: user.id,
                pickup: { coordinates: [pickup.lng, pickup.lat], address: pickupAddress },
                dropoff: { coordinates: [dropoff.lng, dropoff.lat], address: dropoffAddress },
                distance,
                vehicleType
            });
            setRide(res.data);
            alert('Ride requested!');
        } catch (err) {
            console.error(err);
            setStatus('idle');
            alert('Error requesting ride');
        }
    };

    return (
        <div className="h-screen flex flex-col md:flex-row">
            {/* Sidebar / Bottom Sheet */}
            <div className="w-full md:w-1/3 bg-white p-4 shadow-lg z-20 overflow-y-auto">
                <h1 className="text-2xl font-bold mb-4">Rider Panel</h1>

                {status === 'idle' && (
                    <>
                        <div className="mb-4 relative">
                            <label className="block text-sm font-bold mb-1">Pickup</label>
                            <input
                                type="text"
                                value={pickupAddress}
                                onChange={(e) => handleInput(e, 'pickup')}
                                className="w-full p-2 border rounded"
                                placeholder="Search pickup..."
                            />
                            {activeSearch === 'pickup' && searchResults.length > 0 && (
                                <ul className="absolute bg-white border w-full z-50 max-h-40 overflow-y-auto shadow-lg">
                                    {searchResults.map(res => (
                                        <li key={res.place_id} onClick={() => selectAddress(res)} className="p-2 hover:bg-gray-100 cursor-pointer text-sm">
                                            {res.display_name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="mb-4 relative">
                            <label className="block text-sm font-bold mb-1">Dropoff</label>
                            <input
                                type="text"
                                value={dropoffAddress}
                                onChange={(e) => handleInput(e, 'dropoff')}
                                className="w-full p-2 border rounded"
                                placeholder="Search dropoff..."
                            />
                            {activeSearch === 'dropoff' && searchResults.length > 0 && (
                                <ul className="absolute bg-white border w-full z-50 max-h-40 overflow-y-auto shadow-lg">
                                    {searchResults.map(res => (
                                        <li key={res.place_id} onClick={() => selectAddress(res)} className="p-2 hover:bg-gray-100 cursor-pointer text-sm">
                                            {res.display_name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {distance > 0 && (
                            <div className="mb-6">
                                <h3 className="font-bold mb-2">Select Vehicle</h3>
                                <div className="flex gap-2">
                                    {['bike', 'auto', 'car'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setVehicleType(type)}
                                            className={`flex-1 p-2 rounded border ${vehicleType === type ? 'bg-yellow-400 border-yellow-500' : 'bg-gray-50'}`}
                                        >
                                            <div className="text-center capitalize font-bold">{type}</div>
                                            <div className="text-center text-sm">₹{Math.round(20 + (type === 'bike' ? 10 : type === 'auto' ? 15 : 25) * distance)}</div>
                                        </button>
                                    ))}
                                </div>
                                <div className="mt-2 text-sm text-gray-500">Distance: {distance.toFixed(2)} km</div>
                            </div>
                        )}

                        <button
                            onClick={requestRide}
                            disabled={!pickup || !dropoff}
                            className="w-full bg-black text-white py-3 rounded font-bold text-lg disabled:bg-gray-300"
                        >
                            Request {vehicleType.toUpperCase()}
                        </button>
                    </>
                )}

                {status !== 'idle' && (
                    <div className="text-center">
                        <h2 className="text-xl font-bold mb-2">Ride Status: {status.toUpperCase()}</h2>
                        {ride && (
                            <div className="text-left bg-gray-50 p-4 rounded">
                                <p><strong>Vehicle:</strong> {ride.vehicleType}</p>
                                <p><strong>Fare:</strong> ₹{ride.fare}</p>
                                <p><strong>OTP:</strong> {ride._id.slice(-4)}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Map */}
            <div className="flex-1 relative z-0">
                <MapContainer center={[28.6139, 77.2090]} zoom={13} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; OpenStreetMap contributors'
                    />
                    <LocationMarker setLocation={!pickup ? setPickup : setDropoff} />

                    {pickup && <Marker position={pickup}><Popup>Pickup</Popup></Marker>}
                    {dropoff && <Marker position={dropoff}><Popup>Dropoff</Popup></Marker>}
                    {routePositions.length > 0 && <Polyline positions={routePositions} color="blue" />}
                </MapContainer>
            </div>
        </div>
    );
};

export default RiderDashboard;