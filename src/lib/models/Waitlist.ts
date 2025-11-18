import mongoose, { Schema, Document } from 'mongoose';

export interface IWaitlist extends Document {
    wallet: string;
    fid: number;
    username: string;
    mintCount: number;
}

const WaitlistSchema: Schema = new Schema({
    wallet: {
        type: String,
        required: true,
        unique: true,
    },
    fid: {
        type: Number,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    mintCount: {
        type: Number,
        default: 0,
        min: 0,
        max: 2,
    },
});

export default mongoose.models.Waitlist || mongoose.model<IWaitlist>('Waitlist', WaitlistSchema);