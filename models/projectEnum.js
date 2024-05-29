import mongoose from 'mongoose';
const {Schema} =mongoose;

const projectEnumsSchema = new Schema({
  orgStatus: { type: String, enum: ['Gold', 'Silver', 'Bronze'] },
  eventStatus: { type: String, enum: ['Pending', 'Approved', 'Rejected'] },
  orgUserTypes: { type: String, enum: ['Admin', 'Staff'] },
  mediaType: { type: String, enum: ['Video', 'Picture'] },
  mediaTypeStatus: { type: String, enum: ['Before', 'After'] },
});

const ProjectEnums = mongoose.model('ProjectEnums', projectEnumsSchema);

//module.exports = ProjectEnums;
export default ProjectEnums;