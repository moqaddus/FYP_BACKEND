import mongoose from 'mongoose';
const {Schema} =mongoose;

const platformUserSchema=new Schema({
  ID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  Bio: { type: String },
  ImagePath:{type:String}, //change
  Interests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Interest' }],
  OrganizationsFollowed:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Organization' }]
  // SendMessages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
  //ReceivedMessages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
},
{timestamps:true}
)


const platformUser = mongoose.model('platformUser', platformUserSchema);

export default platformUser;