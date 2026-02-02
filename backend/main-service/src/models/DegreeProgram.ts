import mongoose, { Schema, Document } from 'mongoose';

export interface IALRequirement {
    logic_type: string;
    minimum_grade_required: string;
    subjects: string[];
    special_notes?: string;
}

export interface IOLRequirement {
    subject: string;
    min_grade: string;
}

export interface IDegreeProgram extends Document<string> {
    _id: string;
    title: string;
    stream: string;
    duration_years: number;
    medium_of_instruction: string[];
    al_requirements: IALRequirement;
    ol_requirements: IOLRequirement[];
    aptitude_test_required: boolean;
}

const DegreeProgramSchema: Schema = new Schema({
    _id: { type: String, required: true },
    title: { type: String, required: true },
    stream: { type: String, required: true },
    duration_years: { type: Number, required: true },
    medium_of_instruction: [{ type: String, required: true }],
    al_requirements: {
        logic_type: { type: String, required: true },
        minimum_grade_required: { type: String, required: true },
        subjects: [{ type: String, required: true }],
        special_notes: { type: String }
    },
    ol_requirements: [
        {
            subject: { type: String, required: true },
            min_grade: { type: String, required: true }
        }
    ],
    aptitude_test_required: { type: Boolean, required: true }
});

export default mongoose.model<IDegreeProgram>('DegreeProgram', DegreeProgramSchema, 'degree_programs');
