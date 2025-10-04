import mongoose from "mongoose";
import "colors"; // side-effect import so "string".bgRed.white works

const connectDB = async () => {
    const uri = process.env.MONGO_URL;
    if (!uri) {
        console.log("Error in Mongodb Missing MONGO_URL".bgRed.white);
        return null;
    }
    try {
        const conn = await mongoose.connect(uri);
        console.log(`Connected To Mongodb Database ${conn.connection.host}`.bgMagenta.white);
        return conn; // expose for callers/tests
    } catch (error) {
        console.log(`Error in Mongodb ${error}`.bgRed.white);
        return null;
    }
};

export default connectDB;
