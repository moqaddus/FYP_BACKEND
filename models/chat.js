import mongoose from 'mongoose';
const {Schema} =mongoose;

const chatSchema = new Schema({
  User1:{type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  User2:{type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}
  
});

const Chats = mongoose.model('Chats', chatSchema);

export default Chats;