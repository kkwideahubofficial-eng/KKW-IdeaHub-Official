
const mongoose = require('mongoose');

// Configuration
const MONGO_URI = "mongodb+srv://knbire370124_db_user:lhlTtEt9HuuN9ue9@cluster0.veio4af.mongodb.net/idea_hub"; 
const REAL_DRIVER_ID = "69652d4a9336b6198e87cac0"; // Kalpesh's User ID
const MUMBAI_COORDS = [72.8777, 19.0760]; 
const PORTS = [3000, 3001, 3002];

async function run() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to DB");

        const UserSchema = new mongoose.Schema({
            name: String, email: String, role: String, 
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
            items: [],
            paymentMethod: { type: String, default: "cod" }
        }, { collection: 'logistic_orders' });
        const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

        // 1. Prepare Real Driver
        const driver = await User.findById(REAL_DRIVER_ID);
        if (!driver) {
             console.error("Could not find real driver with ID:", REAL_DRIVER_ID);
             return;
        }
        
        console.log(`Found Real Driver: ${driver.name}`);
        console.log(`Current Role: ${driver.role}`);
        console.log(`Current Socket ID: ${driver.socketId || "OFFLINE"}`);
        
        // Ensure Role is correct for Discovery
        if (driver.role !== 'deliveryBoy') {
            console.log(`⚠️ Role '${driver.role}' prevents discovery. Updating to 'deliveryBoy'...`);
            driver.role = 'deliveryBoy';
        }
        
        // Ensure Location for Discovery
        driver.location = { type: "Point", coordinates: MUMBAI_COORDS };
        driver.isOnline = true;
        
        await driver.save();
        console.log("Updated Driver: Role=deliveryBoy, Location=Mumbai, Online=true");

        // 2. Create Test Order
        const order = new Order({
            user: new mongoose.Types.ObjectId(), // Dummy customer 
            address: {
                fullName: "Test Notification",
                fullAddress: "Simulated Location, Mumbai",
                latitude: MUMBAI_COORDS[1],
                longitude: MUMBAI_COORDS[0]
            },
            status: "pending",
            items: [],
            assignment: null 
        });
        await order.save();
        console.log("Created Test Order:", order._id);
        
        await mongoose.disconnect();
        console.log("Triggering API...");

        // 3. Trigger API
        const payload = JSON.stringify({ status: "Processing" });
        
        for (const port of PORTS) {
            console.log(`Trying port ${port}...`);
            try {
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
                    if (res.status === 404) continue;
                    const text = await res.text();
                    console.error(`❌ Error ${res.status} on port ${port}:`, text);
                    break; 
                }
            } catch (e) {
                if (e.cause && e.cause.code === 'ECONNREFUSED') continue;
                console.error("Fetch Error:", e.message);
            }
        }

    } catch (e) {
        console.error("Script Error:", e);
    } 
}

run();
