import { auth } from "@/auth";
import connectDb from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req:NextRequest,context: { params: Promise<{ id: string; }>; }) {
    try {
        await connectDb()
        const {id}=await context.params
        const session=await auth()
        const deliveryBoyId=session?.user?.id
        
        if(!deliveryBoyId){
            return NextResponse.json({message:"unauthorize"},{status:401})
        }

        const assignment=await DeliveryAssignment.findById(id)
        if(!assignment){
            return NextResponse.json({message:"assignment not found"},{status:404})
        }
        
        // Ensure this driver operates this assignment
        if(assignment.assignedTo?.toString() !== deliveryBoyId) {
             return NextResponse.json({message:"not assigned to you"},{status:403})
        }

        if(assignment.status === "completed"){
             return NextResponse.json({message:"already completed"},{status:200})
        }

        assignment.status="completed"
        await assignment.save()

        const order=await Order.findById(assignment.order)
        if(order){
            order.status="delivered"
            order.deliveredAt = new Date()
            await order.save()
            // Optional: Emit event
             await emitEventHandler("order-delivered",{orderId:order._id})
        }

        return NextResponse.json({message:"order completed successfully"},{status:200})

    } catch (error) {
         return NextResponse.json({message:`complete assignment error ${error}`},{status:500})
    }
}
