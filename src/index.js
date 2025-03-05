import {app} from './app.js'
import dotenv from "dotenv"
import connectDB from "./db/index.js"

//configure dotenv
dotenv.config({
    path: "./.env"
})

//connect the db
connectDB()
.then( () =>{
    app.on("error",(error) =>{
        console.log("ERROR !!",error);
        throw error;
    })

    app.listen(process.env.PORT || 3000, () =>{
        console.log("Server is running on Port :", process.env.PORT);
    })
})
.catch((err) =>{
    console.log(`Mongo db error ${err}`)
})
