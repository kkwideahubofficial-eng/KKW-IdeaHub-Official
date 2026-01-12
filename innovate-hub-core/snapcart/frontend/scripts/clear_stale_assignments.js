
const mongoose = require('mongoose');

// Configuration
const MONGO_URI = "mongodb+srv://knbire370124_db_user:lhlTtEt9HuuN9ue9@cluster0.veio4af.mongodb.net/idea_hub"; 
const TARGET_USER_ID = "69652d4a9336b6198e87cac0"; // From user logs

async function run() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to DB");

        const DeliveryAssignmentSchema = new mongoose.Schema({
            assignedTo: mongoose.Schema.Types.ObjectId,
            status: String
        }, { collection: 'deliveryassignments' }); // Guessing collection name. usually plural.
        // Wait, 'DeliveryAssignment' model name. default collection 'deliveryassignments'?
        // Or 'logistic_deliveryassignments'?
        // db.ts fallbacks don't show it.
        // I will try to list collections or guess. 'delivery_assignments'?
        // I'll try generic name.
        
        // Let's use mongoose.connection.db.listCollections() to be sure
        const collections = await mongoose.connection.db.listCollections().toArray();
        const assignmentCollection = collections.find(c => c.name.toLowerCase().includes('assignment'));
        
        if(!assignmentCollection) {
             console.error("Could not find assignment collection. Available:", collections.map(c=>c.name));
             return;
        }
        console.log("Using collection:", assignmentCollection.name);

        const DeliveryAssignment = mongoose.model("DeliveryAssignment", DeliveryAssignmentSchema, assignmentCollection.name);

        // Find stale assignments
        const assignments = await DeliveryAssignment.find({ assignedTo: TARGET_USER_ID, status: { $ne: 'completed' } });
        console.log(`Found ${assignments.length} active/stale assignments for user.`);

        if(assignments.length > 0) {
            const res = await DeliveryAssignment.deleteMany({ _id: { $in: assignments.map(a => a._id) } });
            console.log("Deleted count:", res.deletedCount);
        }

        // Also ensure user is not stuck?
        // User model update not needed if 'busy' logic is purely based on active assignments check.
        
    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}

run();
