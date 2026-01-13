import { NextResponse } from "next/server";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import Order from "@/models/order.model";
import DeliveryAssignment from "@/models/deliveryAssignment.model";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await connectDb();
        
        const deliveryBoys = await User.find({ role: "deliveryBoy" }).lean();
        const orders = await Order.find({ status: { $in: ["Processing", "out of delivery", "processing"] } }).limit(5).lean();
        const assignments = await DeliveryAssignment.find({}).sort({createdAt: -1}).limit(5).lean();

        return NextResponse.json({
            timestamp: new Date().toISOString(),
            counts: {
                deliveryBoys: deliveryBoys.length,
                activeOrders: orders.length,
                totalAssignments: assignments.length
            },
            deliveryBoys: deliveryBoys.map(d => ({
                id: d._id,
                name: d.name,
                location: d.location,
                socketId: d.socketId,
                isOnline: d.isOnline
            })),
            activeOrders: orders.map(o => ({
                id: o._id,
                status: o.status,
                address: o.address,
                hasAssignment: !!o.assignment
            })),
            recentAssignments: assignments.map(a => ({
                id: a._id,
                status: a.status,
                broadcastedTo: a.brodcastedTo,
                assignedTo: a.assignedTo,
                orderId: a.order
            }))
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
