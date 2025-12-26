import mongoose from 'mongoose';

const { Schema } = mongoose;

const achievementSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    imageUrl: {
      type: String,
      default: '',
    },
    achievedBy: {
      type: String, // e.g., Student name, team name
      required: true,
    },
  },
  { timestamps: true }
);

const Achievement = mongoose.models.Achievement || mongoose.model('Achievement', achievementSchema);

export default Achievement;
