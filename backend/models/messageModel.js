import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    body: { type: String },
    name: { type: String },
    isAdmin: { type: Boolean, default: false, required: true },
    userID: { type: String },
    selectedUserID: { type: String },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model('Message', messageSchema);
export default Message;
