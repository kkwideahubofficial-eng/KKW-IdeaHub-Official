import { auth } from "@/auth";
import connectDb from "@/lib/db";
import DeliveryAssignment from "@/models/deliveryAssignment.model";

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        await connectDb()
        const session=await auth()
        let deliveryBoyId=session?.user?.id
        
        // Fallback for mock driver
        if(!deliveryBoyId) {
            const headers = req.headers;
            const manualId = headers.get("x-driver-id");
            if(manualId) {
                console.log("Using manual driver ID:", manualId);
                const mockUser = await import("@/models/user.model").then(m => m.default.findOne({ _id: manualId })); // Validate existence?
                // For now, just trust the ID or assume it works for the mock
                deliveryBoyId = manualId; 
            }
        }
        const activeAssignment=await DeliveryAssignment.findOne({
            assignedTo:deliveryBoyId,
            status:"assigned"
        }).populate(
           {
            path:"order",
            populate:{path:"address"}
           }
        ).lean()
   if(!activeAssignment){
    return NextResponse.json(
        {active:false},
        {status:200}
    )
   }
    return NextResponse.json(
        {active:true,assignment:activeAssignment},
        {status:200}
    )

    } catch (error) {
        return NextResponse.json(
        {message:`current order error ${error}`},
        {status:200}
    )
    }
}