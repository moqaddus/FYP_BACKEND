import mongoose from 'mongoose';
const {Schema} =mongoose;

const messagesSchema = new Schema({
  //ID: { type: Number, required: true },
  Message: { type: String, required: true },
  TimeStamp: { type: Date, default: Date.now },
  ChatID: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', required: true },
  //Ali changed may 8
   Sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // Receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

const Message = mongoose.model('Message', messagesSchema);

//module.exports = Message;
export default Message;