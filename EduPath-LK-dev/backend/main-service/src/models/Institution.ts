import mongoose, { Document, Schema } from 'mongoose';

export interface IInstitution extends Document {
    name: string;
    institution_code?: string;
    image_url?: string;
    description?: string;
    type?: string[];
    country?: string;
    website?: string;
    recognition?: Record<string, any>;
    contact_info?: Record<string, any>;
    confidence_score: number;
    created_at: Date;
    updated_at: Date;
}

const InstitutionSchema = new Schema<IInstitution>({
    name: { type: String, required: true },
    institution_code: { type: String },
    image_url: { type: String },
    description: { type: String },
    type: { type: [String] },
    country: { type: String, default: 'Sri Lanka' },
    website: { type: String },
    recognition: { type: Schema.Types.Mixed },
    contact_info: { type: Schema.Types.Mixed },
    confidence_score: { type: Number, required: true, min: 0, max: 1 },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
}, { collection: 'institutions' });

InstitutionSchema.pre<IInstitution>("save", function () {
    this.updated_at = new Date();
});

export default mongoose.model<IInstitution>('Institution', InstitutionSchema);
