import mongoose, { Schema, Document } from 'mongoose';

export interface ICourseOffering extends Document<string> {
    _id: string;
    degree_program_id: string;
    university_id: string;
    academic_year: string;
    proposed_intake: number;
    cutoff_marks: Record<string, number | null>;
}

const CourseOfferingSchema: Schema = new Schema({
    _id: { type: String, required: true },
    degree_program_id: { type: String, required: true, ref: 'DegreeProgram' },
    university_id: { type: String, required: true, ref: 'University' },
    academic_year: { type: String, required: true },
    proposed_intake: { type: Number, required: true },
    cutoff_marks: { type: Schema.Types.Mixed, required: true }
});

export default mongoose.model<ICourseOffering>('CourseOffering', CourseOfferingSchema, 'course_offerings');
