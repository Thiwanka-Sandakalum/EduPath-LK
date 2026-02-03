/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Program = {
    /**
     * MongoDB ObjectId
     */
    _id: string;
    /**
     * Reference to institution
     */
    institution_id: string;
    /**
     * Program name
     */
    name: string;
    /**
     * Unique identifier
     */
    program_code?: string;
    /**
     * Public image URL for the program
     */
    image_url?: string;
    /**
     * Program overview
     */
    description?: string;
    /**
     * Academic level
     */
    level?: Program.level;
    /**
     * Duration details
     */
    duration?: Record<string, any>;
    /**
     * Delivery modes
     */
    delivery_mode?: Array<'On-campus' | 'Online' | 'Hybrid' | 'Distance'>;
    /**
     * Fee structure
     */
    fees?: Record<string, any>;
    /**
     * Admission requirements
     */
    eligibility?: Record<string, any>;
    /**
     * Curriculum overview
     */
    curriculum_summary?: string;
    /**
     * Available specializations
     */
    specializations?: Array<string>;
    /**
     * Program or institution URL
     */
    url?: string;
    /**
     * Additional custom data
     */
    extensions?: Record<string, any>;
    /**
     * Confidence score (0-1)
     */
    confidence_score: number;
    created_at: string;
    updated_at: string;
};
export namespace Program {
    /**
     * Academic level
     */
    export enum level {
        CERTIFICATE = 'Certificate',
        DIPLOMA = 'Diploma',
        BACHELOR = 'Bachelor',
        MASTER = 'Master',
        DOCTORATE = 'Doctorate',
        POSTGRADUATE = 'Postgraduate',
    }
}

