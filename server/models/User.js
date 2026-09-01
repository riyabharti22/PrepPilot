import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    guestId: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: "Guest" },
    email: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
