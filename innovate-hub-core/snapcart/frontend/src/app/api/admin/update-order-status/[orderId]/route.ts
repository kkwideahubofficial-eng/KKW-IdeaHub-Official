import connectDb from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { stat } from "fs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req:NextRequest, context: { params: Promise<{ orderId: string; }>; }) {
    try {
        await connectDb()
        const {orderId}=await context.params
        const {status}=await req.json()
        const order=await Order.findById(orderId).populate("user")
        if(!order){
            return NextResponse.json(
                {message:"order not found"},
                {status:400}
            )
        }
        order.status=status
        let deliveryBoysPayload:any=[]
        if((status==="out of delivery" || status === "Processing" || status === "processing") && !order.assignment){
            const {latitude,longitude}=order.address
            console.log(`[DEBUG] Finding delivery boys near ${latitude}, ${longitude}`);
            const nearByDeliveryBoys=await User.find({
                role:"deliveryBoy",
                location:{
                    $near:{
                        $geometry:{type:"Point",coordinates:[Number(longitude),Number(latitude)]},
                        $maxDistance:10000
                    }
                }
            })
            console.log(`[DEBUG] Found ${nearByDeliveryBoys.length} nearby delivery boys:`, nearByDeliveryBoys.map(b => b.name));

            const nearByIds=nearByDeliveryBoys.map((b)=>b._id)
            const busyIds=await DeliveryAssignment.find({
                assignedTo:{$in:nearByIds},
                status:{$nin:["brodcasted", "completed"]}
            }).distinct("assignedTo")
            const busyIdSet=new Set(busyIds.map(b=>String(b)))
            const availableDeliveryBoys=nearByDeliveryBoys.filter(
                b=>!busyIdSet.has(String(b._id))
            )
             const candidates=availableDeliveryBoys.map(b=>b._id)
             console.log(`[DEBUG] ${candidates.length} candidates available for broadcast`);

             if(candidates.length==0){
                console.log("[DEBUG] No candidates found, saving order status only.");
                await order.save()
            
                await emitEventHandler("order-status-update",{orderId:order._id,status:order.status})

                return NextResponse.json(
                {message:"there is no available Delivery boys"},
                {status:200}
            )
             }
   
             const deliveryAssignment=await DeliveryAssignment.create({
                order:order._id,
                brodcastedTo:candidates,
                status:"brodcasted"
            })

             await deliveryAssignment.populate("order");
             
             // Map to the format the driver dashboard expects
             const assignmentPayload = {
                 assignmentId: deliveryAssignment._id,
                 orderId: order._id,
                 customerName: order.address.fullName,
                 address: order.address.fullAddress,
                 status: 'PENDING',
                 location: {
                     lat: order.address.latitude || 0, 
                     lng: order.address.longitude || 0 
                 }
             };

             for(const boyId of candidates){
                const boy=await User.findById(boyId)
                if(boy.socketId){
                    console.log(`[DEBUG] Emitting task to ${boy.name} (Socket: ${boy.socketId})`);
                    // Emit 'new-delivery-task' with the correct payload structure
                    await emitEventHandler("new-delivery-task", assignmentPayload, boy.socketId)
                } else {
                    console.warn(`[DEBUG] Delivery boy ${boy.name} has no socketId!`);
                }
             }

            
             order.assignment=deliveryAssignment._id
            deliveryBoysPayload=availableDeliveryBoys.map(b=>({
                id:b._id,
                name:b.name,
                mobile:b.mobile,
                latitude:b.location.coordinates[1],
                longitude:b.location.coordinates[0]
            }))
            await deliveryAssignment.populate("order")
            
        }

        await order.save()
        await order.populate("user")
      await emitEventHandler("order-status-update",{orderId:order._id,status:order.status})
        return NextResponse.json({
            assignment:order.assignment?._id,
            availableBoys:deliveryBoysPayload
        },{status:200})

    } catch (error) {
         return NextResponse.json({
           message:`update status error ${error}`
        },{status:500})
    }
}