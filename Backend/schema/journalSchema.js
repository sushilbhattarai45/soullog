import mongoose from 'mongoose';
const {Schema} = mongoose;

const journalSchema = new Schema ({
  content: {type: String, required: true},
  emotion: {type: String, required: true},
  aiReview: {type: String, required: true},
  isAnonymous: {type: Boolean, default: false},
  timestamp: {type: Date, default: Date.now},
  userId: {type: String, required: true},
  song: {type: Object, required: true},
});
const Journal = mongoose.model ('Journal', journalSchema);
export default Journal;
