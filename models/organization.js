import mongoose from 'mongoose';
const {Schema} =mongoose;

const orgSchema=new Schema({
  ID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  Status: { type: String, enum: ['Gold', 'Silver', 'Bronze'] },
  Description: { type: String },
  ImagePath:{type:String}, //change
  OrganizationEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event',required:false }],

},
{timestamps:true}
);

const Organization = mongoose.model('Organization', orgSchema);

export default Organization;