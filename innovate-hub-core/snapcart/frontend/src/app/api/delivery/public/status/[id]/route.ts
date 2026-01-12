import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        await connectDb();
        const orderId = params.id;
        
        // Find order and populate driver
        const order = await Order.findById(orderId).populate("assignedDeliveryBoy", "name mobile vehicleNumber");

        if (!order) {
            // It's possible the order exists in IdeaHub but not yet in SnapCart if not synced.
            return NextResponse.json({ message: "Order not found in Snapcart" }, { status: 404 });
        }

        // Return just the needed info (Public API, be careful with PII)
        return NextResponse.json({
            status: order.status,
            assignedDriver: order.assignedDeliveryBoy ? {
                name: order.assignedDeliveryBoy.name,
                mobile: order.assignedDeliveryBoy.mobile,
                vehicleNumber: order.assignedDeliveryBoy.vehicleNumber
            } : null
        }, { 
            status: 200,
            headers: {
                'Access-Control-Allow-Origin': '*', // Allow IdeaHub to fetch
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
            }
        });

    } catch (error) {
        return NextResponse.json(
            { message: `Error fetching delivery status: ${error}` }, 
            { status: 500 }
        );
    }
}

export async function OPTIONS() {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
