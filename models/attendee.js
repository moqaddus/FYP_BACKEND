import mongoose from 'mongoose';
const {Schema} =mongoose;


const attendeeSchema = new Schema({
  UserID: { type: mongoose.Schema.Types.ObjectId, ref: 'PlatformUser', required: true },///Change
  EventID:{ type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true},
  TicketCode: { type: String, required: true },
  CheckedIn: { type: Boolean, default: false },
  Rating: { type: Number },
  Review: { type: String }
});

const Attendee = mongoose.model('Attendee', attendeeSchema);

export default Attendee;
//module.exports = Attendee;