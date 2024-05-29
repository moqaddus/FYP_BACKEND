import mongoose from 'mongoose';
const {Schema} =mongoose;

const interestSchema = new Schema({
  ID: { type: Number, required: false },
  Name: { type: String, required: true },
});

const Interest = mongoose.model('Interest', interestSchema); //schema name interests to interest

export default Interest;