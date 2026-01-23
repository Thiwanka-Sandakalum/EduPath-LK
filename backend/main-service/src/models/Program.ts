import mongoose, { Document, Schema } from 'mongoose';

export interface IProgram extends Document {
    institution_id: string;
    name: string;
    program_code?: string;
    description?: string;
    level?: string;
    duration?: Record<string, any>;
    delivery_mode?: string[];
    fees?: Record<string, any>;
    eligibility?: Record<string, any>;
    curriculum_summary?: string;
    specializations?: string[];
    url?: string;
    extensions?: Record<string, any>;
    confidence_score: number;
    created_at: Date;
    updated_at: Date;
}

const ProgramSchema = new Schema<IProgram>({
    institution_id: { type: String, required: true },
    name: { type: String, required: true },
    program_code: { type: String },
    description: { type: String },
    level: { type: String },
    duration: { type: Schema.Types.Mixed },
    delivery_mode: { type: [String] },
    fees: { type: Schema.Types.Mixed },
    eligibility: { type: Schema.Types.Mixed },
    curriculum_summary: { type: String },
    specializations: { type: [String] },
    url: { type: String },
    extensions: { type: Schema.Types.Mixed },
    confidence_score: { type: Number, required: true, min: 0, max: 1 },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
}, { collection: 'programs' });

ProgramSchema.pre<IProgram>('save', function () {
    this.updated_at = new Date();
});

export default mongoose.model<IProgram>('Program', ProgramSchema);
