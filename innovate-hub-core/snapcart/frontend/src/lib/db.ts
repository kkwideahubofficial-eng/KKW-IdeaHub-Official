import mongoose from "mongoose";

// Fallback to local env or hardcoded string for development to prevent crash
// Fallback to local env or hardcoded string for development to prevent crash
// Fallback to local env or hardcoded string for development to prevent crash
const mongodbUrl = process.env.MONGODB_URL || "mongodb+srv://knbire370124_db_user:lhlTtEt9HuuN9ue9@cluster0.veio4af.mongodb.net/idea_hub";

if(!mongodbUrl){
 console.warn("Missing MONGODB_URL, using default/fallback");
}



let cached=global.mongoose
if(!cached){
    cached=global.mongoose={conn:null,promise:null}
}

const connectDb=async ()=>{
    if(cached.conn){
       
        return cached.conn
    }

    if(!cached.promise){
      
        cached.promise=mongoose.connect(mongodbUrl).then((conn)=>conn.connection)
    }
    try {
        const conn=await cached.promise
        return conn
    } catch (error) {
        console.log(error)
    }

}

export default connectDb