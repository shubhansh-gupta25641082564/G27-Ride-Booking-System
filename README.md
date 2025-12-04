## 🚕 Taxi / Ride Booking System (Basic Ola/Uber Lite)

### 1. 🌆 Background
Urban commuters often struggle with finding reliable transportation, negotiating prices, and estimating arrival times. Traditional taxi services lack transparency, while drivers often roam empty streets looking for passengers. A digital platform is needed to bridge this gap efficiently.  

### 2. 🎯 Challenge
Develop a real-time ride-hailing platform that connects riders with nearby drivers. The system must handle geolocation updates, fair pricing estimation, and live trip tracking to ensure a safe and transparent travel experience for both parties.  

### 3. 👥 User Roles & Flow

#### 🧍 Rider (Passenger)
- Location Setup: Selects pickup and drop-off locations on a map.  
- Fare Estimate: Views estimated price and time before confirming the booking.  
- Booking: Requests a ride and waits for driver acceptance.  
- Live Tracking: Tracks the driver's location in real-time as they approach.  
- Payment & Rating: Pays via digital wallet/cash and rates the driver after the trip.  

#### 🚖 Driver
- Availability Toggle: Goes "Online" to receive ride requests.  
- Ride Request: Receives a popup with pickup distance and estimated fare.  
- Accept/Reject: Has a limited time (e.g., 15 seconds) to accept the ride.  
- Navigation: Gets turn-by-turn navigation to the pickup point and destination.  
- Trip Management: Marks trip as "Started" and "Completed".  

#### 🛡️ Admin
- User Management: Verifies driver documents (License, Vehicle Registration).  
- Ride History: Views all active and past trips.  
- Price Control: Sets base rates and per-kilometer charges.  

### 4. 🧩 Core Requirements

#### ✅ Functional
- Geolocation Service: precise handling of latitude/longitude for tracking.  
- Matching Algorithm: Find the nearest available driver within a specific radius (e.g., 5km).  
- Real-Time Updates: Instant status changes (Driver Found → Arriving → Trip Started) without page reloads.  
- Fare Calculator: Logic to calculate cost based on distance and duration.  
- Ride History: A log of past trips for both users.  

#### ⚙️ Non-Functional
- Low Latency: Driver location updates on the rider's map must be smooth (websocket implementation).  
- Concurrency: System must handle multiple booking requests simultaneously without locking.  
- Accuracy: Route optimization to ensure the shortest/fastest path is taken.
