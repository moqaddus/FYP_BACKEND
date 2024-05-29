import mongoose from 'mongoose';
const {Schema} =mongoose;

const mediaSchema = new Schema({
 // ID: { type: Number, required: true },   //removed on 28 april 
  Type: { type: String, enum: ['Video', 'Picture'], required: true },
  BeforeAfter: { type: String, enum: ['Before', 'After'], required: true },
  URL: { type: String },
  Event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
});

const Media = mongoose.model('Media', mediaSchema);

//module.exports = Media;
export default Media;