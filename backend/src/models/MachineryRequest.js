import mongoose from 'mongoose';

const { Schema } = mongoose;

const machineryRequestSchema = new Schema(
  {
    machineryId: {
      type: Schema.Types.ObjectId,
      ref: 'Machinery',
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId, // The user who made the request
      ref: 'User',
      required: true,
    },
    teamMembers: [{
      name: { type: String, required: true },
      branch: { type: String },
      year: { type: String },
    }],
    usageDate: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      required: true,
      minlength: 10,
    },
    consentAgreed: {
      type: Boolean,
      required: true,
      default: false,
    },
    groupPhotoUrl: {
      type: String,
      required: true, // As per requirements
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: {
      type: String,
      default: '',
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User', // The Head who approved/rejected it
    },
    actualEntryTime: {
      type: Date,
      default: null,
    },
    actualExitTime: {
      type: Date,
      default: null,
    }
  },
  { timestamps: true }
);

// Basic indexing for faster queries by status and date
machineryRequestSchema.index({ status: 1 });
machineryRequestSchema.index({ machineryId: 1, usageDate: 1 });

export const MachineryRequest = mongoose.models.MachineryRequest || mongoose.model('MachineryRequest', machineryRequestSchema);
export default MachineryRequest;
