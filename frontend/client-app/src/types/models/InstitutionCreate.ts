/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type InstitutionCreate = {
    name: string;
    institution_code?: string;
    image_url?: string;
    description?: string;
    type?: Array<string>;
    country?: string;
    website?: string;
    recognition?: Record<string, any>;
    contact_info?: Record<string, any>;
    confidence_score: number;
};

