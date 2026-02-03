import mongoose, { Schema, Document } from 'mongoose';

export interface IUniversity extends Document<string> {
    _id: string;
    name: string;
    abbreviation: string;
    type: string;
    contact: {
        address: string;
        phone: string[];
        website: string;
    };
    location: string;
}

const UniversitySchema: Schema = new Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    abbreviation: { type: String, required: true },
    type: { type: String, required: true },
    contact: {
        address: { type: String, required: true },
        phone: [{ type: String, required: true }],
        website: { type: String, required: true }
    },
    location: { type: String, required: true }
});

export default mongoose.model<IUniversity>('University', UniversitySchema, 'universities');
