import express from "express"
import http from "http"
import dotenv from "dotenv"
import { Server } from "socket.io"
import axios from "axios"

dotenv.config()
const app=express()
app.use(express.json())
const server=http.createServer(app)
const port=process.env.PORT || 4000
const NEXT_BASE_URL = process.env.NEXT_BASE_URL || "http://localhost:3000";

const io=new Server(server,{
    cors:{
        origin: "*", // Allow all for development to fix CORS error
        methods: ["GET", "POST"]
    }
})

io.on("connection",(socket)=>{

   socket.on("identity",async (userId)=>{
    
    try {
        await axios.post(`${NEXT_BASE_URL}/api/socket/connect`,{userId,socketId:socket.id})
    } catch(e) {
        console.error("Socket Identity Error:", e.message);
    }
   }) 

   socket.on("update-location",async ({userId,latitude,longitude})=>{
    const location={
        type:"Point",
        coordinates:[longitude,latitude]
    }
    try {
        await axios.post(`${NEXT_BASE_URL}/api/socket/update-location`,{userId,location})
    } catch(e) {
        // console.error("Location Update Error", e.message); 
    }
     io.emit("update-deliveryBoy-location",{userId,location})
   })

   socket.on("join-room",(roomId)=>{
    console.log("join room with",roomId)
    socket.join(roomId)
   })

  socket.on("send-message",async (message)=>{
    console.log(message)
    try {
        await axios.post(`${NEXT_BASE_URL}/api/chat/save`,message)
    } catch(e) {
        console.error("Chat Save Error", e.message);
    }
    io.to(message.roomId).emit("send-message",message)
  })
  
    socket.on("disconnect",()=>{
console.log("user disconnected",socket.id)
    })

})


app.post("/notify",(req,res)=>{
    const {event,data,socketId}=req.body
    if(socketId){
        io.to(socketId).emit(event,data)
    }else{
        io.emit(event,data)
    }

    return res.status(200).json({"success":true})
})

// Bridge API: Receive Delivery Task from IdeaHub Backend
// Bridge API: Receive Delivery Task from IdeaHub Backend
app.post("/api/internal/create-delivery", async (req, res) => {
    const task = req.body;
    console.log("Received Delivery Task from IdeaHub:", task.orderId);
    
    // 1. Persist to SnapCart DB (So we have a record to update status on)
    try {
        const persistRes = await axios.post(`${NEXT_BASE_URL}/api/internal/persist-delivery`, task);
        if(persistRes.data && persistRes.data.assignmentId) {
            task.assignmentId = persistRes.data.assignmentId; // Attach DB ID
        }
    } catch(e) {
        console.error("Failed to persist task to DB:", e.message);
        // Continue to broadcast even if save fails, for live demo
    }

    // 2. Broadcast to all connected drivers
    io.emit("new-delivery-task", task);

    return res.status(200).json({ success: true, message: "Task broadcasted to drivers" });
});



server.listen(port,()=>{
    console.log("server started at",port)
})