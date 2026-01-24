/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Institution = {
    /**
     * MongoDB ObjectId
     */
    _id: string;
    /**
     * Official institution name
     */
    name: string;
    /**
     * Unique identifier
     */
    institution_code?: string;
    /**
     * Institution overview
     */
    description?: string;
    /**
     * Institution types (e.g., University, College, Institute)
     */
    type?: Array<string>;
    /**
     * Country
     */
    country?: string;
    /**
     * Website URL
     */
    website?: string;
    /**
     * Accreditation and recognition details
     */
    recognition?: Record<string, any>;
    /**
     * Contact details
     */
    contact_info?: Record<string, any>;
    /**
     * Confidence score (0-1)
     */
    confidence_score: number;
    created_at: string;
    updated_at: string;
};

