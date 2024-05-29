import mongoose from 'mongoose';
const {Schema} =mongoose;

const userSchema=new Schema({
  
  Name:{type:String, required :true},
  Email: { type: String, required: true },
  Username: { type: String, required: true },
  Password: { type: String, required: true },
  type:{ type: String, enum: ['PlatformAdmin','OrgAdmin','PlatformUser'], required: true },
},
{timestamps:true}
)


const user = mongoose.model('User', userSchema);

export default user;
//module.exports = User;