import mongoose, { Schema, Document } from 'mongoose';

export interface IAttempt extends Document {
  deviceId: string;
  title: string;
  category: string;
  attemptsLeft: number;
  totalAttempts: number;
  bestScore: number;
  lastAttemptDate: Date;
  attemptHistory: {
    date: Date;
    score: number;
    completionTime: number;  
  }[];
  averageCompletionTime: number;  
}

const AttemptSchema: Schema = new Schema({
  deviceId: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, required: true },
  attemptsLeft: { type: Number, default: 3 },
  totalAttempts: { type: Number, default: 3 },
  bestScore: { type: Number, default: 0 },
  lastAttemptDate: { type: Date, default: Date.now },
  attemptHistory: [{
    date: { type: Date, default: Date.now },
    score: { type: Number, required: true },
    completionTime: { type: Number, default: 0 }
  }],
  averageCompletionTime: { type: Number, default: 0 }  
}, { timestamps: true });

AttemptSchema.index({ deviceId: 1, title: 1, category: 1 }, { unique: true });

const Attempt = mongoose.models.Attempt || mongoose.model<IAttempt>('Attempt', AttemptSchema);

export default Attempt;