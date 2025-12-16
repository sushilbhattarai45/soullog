import mongoose from 'mongoose';

const userSchema = new mongoose.Schema ({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  dateOfJoining: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model ('User', userSchema);
