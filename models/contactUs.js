import mongoose from 'mongoose';
const { Schema } = mongoose;

const userComplaintSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  complaint: { type: String, required: true },
});

const UserComplaint = mongoose.model('UserComplaint', userComplaintSchema);

export default UserComplaint;