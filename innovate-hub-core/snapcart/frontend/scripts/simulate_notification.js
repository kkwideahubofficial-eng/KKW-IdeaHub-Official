
const mongoose = require('mongoose');
// const axios = require('axios'); // Prefer fetch for compatibility if needed, but axios is installed

// Configuration
// Using the string from db.ts fallback
const MONGO_URI = "mongodb+srv://knbire370124_db_user:lhlTtEt9HuuN9ue9@cluster0.veio4af.mongodb.net/idea_hub"; 
const MUMBAI_COORDS = [72.8777, 19.0760]; // [Lng, Lat]
const PORTS = [3000, 3001, 3002];

const driverEmail = "testdriver_sim@example.com";
const userEmail = "testuser_sim@example.com";

async function run() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to DB");

        // 1. Define Schemas (Minimal for Seeding, with strict requirements met)
        const UserSchema = new mongoose.Schema({
            name: String, 
            email: String, 
            role: String, 
            location: { 
                type: { type: String, enum: ['Point'], default: 'Point' }, 
                coordinates: { type: [Number], default: [0, 0] } 
            },
            socketId: String, 
            isOnline: Boolean
        }, { collection: 'logistic_users' });
        const User = mongoose.models.User || mongoose.model("User", UserSchema);

        const OrderSchema = new mongoose.Schema({
            user: mongoose.Schema.Types.ObjectId,
            address: { 
                latitude: Number, 
                longitude: Number, 
                fullName: String, 
                fullAddress: String 
            },
            status: String,
            assignment: { type: mongoose.Schema.Types.ObjectId, default: null },
            items: [], // Validation passes empty array
            paymentMethod: { type: String, default: "cod" }
        }, { collection: 'logistic_orders' });
        const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

        // 2. Create/Update Test Driver
        let driver = await User.findOne({ email: driverEmail });
        if (!driver) {
            driver = new User({
                name: "Test Driver Sim",
                email: driverEmail,
                role: "deliveryBoy",
                location: { type: "Point", coordinates: MUMBAI_COORDS },
                socketId: "TEST_SOCKET_ID_12345", 
                isOnline: true
            });
            await driver.save();
            console.log("Created Test Driver:", driver._id);
        } else {
            driver.location = { type: "Point", coordinates: MUMBAI_COORDS };
            driver.socketId = "TEST_SOCKET_ID_12345";
            driver.role = "deliveryBoy"; // Ensure role
            driver.isOnline = true;
            await driver.save();
            console.log("Updated Test Driver:", driver._id);
        }

        // 3. Create/Update Test User (Customer)
        let user = await User.findOne({ email: userEmail });
         if (!user) {
            user = new User({
                name: "Test User Sim",
                email: userEmail,
                role: "user",
                location: { type: "Point", coordinates: [0, 0] } // Default valid coords
            });
            await user.save();
        }

        // 4. Create Test Order
        const order = new Order({
            user: user._id,
            address: {
                fullName: "Sim Customer",
                fullAddress: "Simulated Address, Mumbai",
                latitude: MUMBAI_COORDS[1],
                longitude: MUMBAI_COORDS[0]
            },
            status: "pending",
            items: [],
            assignment: null // Ensure freshly acceptable
        });
        await order.save();
        console.log("Created Test Order:", order._id);
        
        // Close DB connection before triggering API to avoid hanging process
        await mongoose.disconnect();
        console.log("DB Disconnected. Triggering API...");

        // 5. Trigger API via HTTP
        const payload = JSON.stringify({ status: "Processing" });
        
        for (const port of PORTS) {
            console.log(`Trying port ${port}...`);
            try {
                // Using built-in fetch (Node 18+)
                const res = await fetch(`http://localhost:${port}/api/admin/update-order-status/${order._id}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: payload
                });

                if (res.ok) {
                    const data = await res.json();
                    console.log("✅ Success on port", port);
                    console.log("API Response:", JSON.stringify(data, null, 2));
                    break;
                } else {
                    if (res.status === 404) {
                        console.log(`Port ${port}: 404 Not Found (Wrong Service)`);
                        continue;
                    }
                    const text = await res.text();
                    console.error(`❌ Error ${res.status} on port ${port}:`, text);
                    break; // Server found but error
                }
            } catch (e) {
                if (e.cause && e.cause.code === 'ECONNREFUSED') {
                    // console.log(`Port ${port}: Connection Refused`);
                    continue;
                }
                console.error("Fetch Error:", e.message);
            }
        }

    } catch (e) {
        console.error("Script Error:", e);
    } 
}

run();
