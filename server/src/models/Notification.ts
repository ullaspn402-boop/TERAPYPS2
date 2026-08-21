import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  recipientId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  type: 'assignment' | 'review_required' | 'milestone' | 'supervisor_feedback' | 'ai_insight';
  priority: 'high' | 'medium' | 'info';
  read: boolean;
  relatedCaseId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { 
      type: String, 
      enum: ['assignment', 'review_required', 'milestone', 'supervisor_feedback', 'ai_insight'],
      required: true
    },
    priority: { type: String, enum: ['high', 'medium', 'info'], default: 'info' },
    read: { type: Boolean, default: false },
    relatedCaseId: { type: Schema.Types.ObjectId, ref: 'Case' }
  },
  { timestamps: true }
);

export default mongoose.model<INotification>('Notification', notificationSchema);
