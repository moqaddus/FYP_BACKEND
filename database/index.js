import mongoose from "mongoose";
import { CONN_STRING } from "../config/index.js";
const  connectionString=CONN_STRING;
export const dbConnect=async()=>{
  try {
      mongoose.set('strictQuery',false);
      await mongoose.connect(connectionString);
      console.log('DB Connected')

  } catch (error) {
   console.log(`Error ${error}`) 
  }
}

