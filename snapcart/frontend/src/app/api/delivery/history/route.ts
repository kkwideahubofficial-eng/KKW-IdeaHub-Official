import { auth } from "@/auth";
import connectDb from "@/lib/db";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import Order from "@/models/order.model"; 
import { NextResponse } from "next/server";

export async function GET() {
    try {
       await connectDb()
       const session=await auth()
       
       if (!session?.user?.id) {
           return NextResponse.json({message: "Unauthorized"}, {status: 401});
       }

        console.log("Fetching history for user:", session.user.id);

        const history = await DeliveryAssignment.find({
          assignedTo: session.user.id,
          status: "completed"
        })
        .populate("order")
        .sort({ updatedAt: -1 });

        console.log("Found history items:", history.length);

        return NextResponse.json(
            history, {status: 200}
        )
    } catch (error) {
        console.error("Get history error:", error);
        return NextResponse.json(
           {message:`get history error ${error}`}, {status: 500}
        )
    }
}
