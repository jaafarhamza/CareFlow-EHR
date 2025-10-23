import mongoose from 'mongoose';

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 2,
      maxlength: 50
    },
    permissions: {
      type: [String],
      default: [],
      validate: {
        validator: function(arr) {
          return arr.length === new Set(arr).size;
        },
        message: 'Duplicate permissions not allowed'
      }
    },
    description: {
      type: String,
      default: null,
      trim: true
    },
    isSystem: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true, versionKey: false }
);

roleSchema.index({ name: 1 }, { unique: true });
roleSchema.index({ isSystem: 1 });

export default mongoose.model('Role', roleSchema);
