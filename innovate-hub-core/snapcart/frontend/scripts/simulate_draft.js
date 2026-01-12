
const mongoose = require('mongoose');

// Configuration
const MONGO_URI = "mongodb+srv://studentCR:77440055@cluster0.p710y.mongodb.net/logistic_db?retryWrites=true&w=majority&appName=Cluster0"; // Hardcoded from lib/db.ts
const MUMBAI_COORDS = [72.8777, 19.0760]; // [Lng, Lat]

async function run() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to DB");

        // 1. Create/Update Test Driver
        const User = mongoose.model("User", new mongoose.Schema({
            name: String, email: String, role: String, 
            location: { type: { type: String, enum: ['Point'], default: 'Point' }, coordinates: [Number] },
            socketId: String, isOnline: Boolean
        }, { collection: 'logistic_users' }));

        const driverEmail = "testdriver@example.com";
        let driver = await User.findOne({ email: driverEmail });
        
        if (!driver) {
            driver = new User({
                name: "Test Driver",
                email: driverEmail,
                role: "deliveryBoy",
                location: { type: "Point", coordinates: MUMBAI_COORDS },
                socketId: "TEST_SOCKET_ID_12345", // Mock Socket ID
                isOnline: true
            });
            await driver.save();
            console.log("Created Test Driver:", driver._id);
        } else {
            driver.location = { type: "Point", coordinates: MUMBAI_COORDS };
            driver.socketId = "TEST_SOCKET_ID_12345";
            driver.isOnline = true;
            await driver.save();
            console.log("Updated Test Driver:", driver._id);
        }

        // 2. Create Test Order
        const Order = mongoose.model("Order", new mongoose.Schema({
            address: { 
                latitude: Number, 
                longitude: Number, 
                fullName: String, 
                fullAddress: String 
            },
            status: String,
            user: mongoose.Types.ObjectId,
            assignment: mongoose.Types.ObjectId
        }, { collection: 'logistic_orders' })); // Guessing collection name, usually plural of model name lowercased

        // Note: Check actual collection name if fails. Mongoose defaults to 'orders' or similar. 
        // Based on previous logs, it might be 'orders' or 'logistic_orders' depending on db.ts.
        // Let's assume 'orders' for now or check previous file reads.
        // checking db.ts might be safer but let's try generic first or check file `src/models/order.model.ts`
        
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}
// I need valid schemas to ensure I write to correct collections. 
// I will pause writing this script to double check model definitions and collection names.
