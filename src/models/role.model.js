import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, index: true, trim: true },
    permissions: { type: [String], default: [] },
    description: { type: String, default: null },
  },
  { timestamps: true, versionKey: false }
);

const Role = mongoose.model("Role", roleSchema, "roles");
export default Role;
