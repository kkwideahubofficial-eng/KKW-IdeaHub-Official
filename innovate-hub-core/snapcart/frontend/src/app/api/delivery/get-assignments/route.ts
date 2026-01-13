import { auth } from "@/auth";
import connectDb from "@/lib/db";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
       await connectDb()
       const session=await auth()
       let userId = session?.user?.id;

       if(!userId) {
           const manualId = req.headers.get("x-driver-id");
           if(manualId) userId = manualId;
       }

        const assignments=await DeliveryAssignment.find({
          brodcastedTo:userId,
          status:"brodcasted"
        }).populate("order")
        return NextResponse.json(
            assignments,{status:200}
        )
    } catch (error) {
        return NextResponse.json(
           {message:`get assignments error ${error}`},{status:200}
        )
    }
}