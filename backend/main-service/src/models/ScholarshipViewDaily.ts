import mongoose, { Document, Schema } from 'mongoose';

export interface IScholarshipViewDaily extends Document {
    scholarship_id: string;
    date: string; // YYYY-MM-DD (UTC)
    views: number;
    viewers: string[]; // distinct viewer keys (session/user)
    created_at: Date;
    updated_at: Date;
}

const ScholarshipViewDailySchema = new Schema<IScholarshipViewDaily>(
    {
        scholarship_id: { type: String, required: true, index: true },
        date: { type: String, required: true, index: true },
        views: { type: Number, required: true, default: 0, min: 0 },
        viewers: { type: [String], required: true, default: [] },
        created_at: { type: Date, default: Date.now },
        updated_at: { type: Date, default: Date.now },
    },
    { collection: 'scholarship_view_daily' },
);

ScholarshipViewDailySchema.index({ scholarship_id: 1, date: 1 }, { unique: true });

ScholarshipViewDailySchema.pre<IScholarshipViewDaily>('save', function () {
    this.updated_at = new Date();
});

export default mongoose.model<IScholarshipViewDaily>('ScholarshipViewDaily', ScholarshipViewDailySchema);
