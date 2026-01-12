import axios from 'axios'
import React from 'react'

async function emitEventHandler(event:string,data:any,socketId?:string) {
  try {
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_SERVER || "http://localhost:4000";
    await axios.post(`${socketUrl}/notify`,{socketId,event,data})
  } catch (error) {
    console.log("Socket Emission Error:", error)
  }
}

export default emitEventHandler
