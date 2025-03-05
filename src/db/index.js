import mongoose from "mongoose"

const connectDB = async() =>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${process.env.DB_NAME}`);
        console.log("Mongo DB connected.. || Host :",connectionInstance.connection.host);
    } catch (error) {
        console.log("Mongo DB connection ERROR!!! ",error);
        process.exit(1);
    }
}

export default connectDB;