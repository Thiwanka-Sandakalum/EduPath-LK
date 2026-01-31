/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Pagination } from '../models/Pagination';
import type { Program } from '../models/Program';
import type { ProgramCreate } from '../models/ProgramCreate';
import type { ProgramPatch } from '../models/ProgramPatch';
import type { ProgramUpdate } from '../models/ProgramUpdate';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class ProgramsService {
    /**
     * List programs by institution
     * Retrieve all programs offered by a specific institution
     * @param institutionId Institution ID
     * @param page
     * @param limit
     * @param level Filter by academic level
     * @returns any Successful response
     * @throws ApiError
     */
    public static listInstitutionPrograms(
        institutionId: string,
        page: number = 1,
        limit: number = 20,
        level?: string,
    ): CancelablePromise<{
        data?: Array<Program>;
        pagination?: Pagination;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/institutions/{institutionId}/programs',
            path: {
                'institutionId': institutionId,
            },
            query: {
                'page': page,
                'limit': limit,
                'level': level,
            },
            errors: {
                404: `Resource not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * List all programs
     * Retrieve a paginated list of all programs with advanced filtering
     * @param page
     * @param limit
     * @param institutionId Filter by institution ID
     * @param name Filter by program name (partial match)
     * @param level Filter by academic level (e.g., Undergraduate, Postgraduate)
     * @param deliveryMode Filter by delivery mode (e.g., Full-time, Part-time, Online)
     * @param specializations Filter by specialization(s) (e.g., AI, Data Science). Accepts a single value or an array.
     * @param duration Filter by duration (partial match, if stored as a simple value)
     * @param eligibility Filter by eligibility (partial match, if stored as a simple value)
     * @param sort
     * @returns any Successful response
     * @throws ApiError
     */
    public static listPrograms(
        page: number = 1,
        limit: number = 20,
        institutionId?: string,
        name?: string,
        level?: string,
        deliveryMode?: string,
        specializations?: (string | Array<string>),
        duration?: string,
        eligibility?: string,
        sort: string = 'name:asc',
    ): CancelablePromise<{
        data?: Array<Program>;
        pagination?: Pagination;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/programs',
            query: {
                'page': page,
                'limit': limit,
                'institution_id': institutionId,
                'name': name,
                'level': level,
                'delivery_mode': deliveryMode,
                'specializations': specializations,
                'duration': duration,
                'eligibility': eligibility,
                'sort': sort,
            },
            errors: {
                400: `Bad request`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Create a new program
     * Add a new program to the database
     * @param requestBody
     * @returns Program Program created successfully
     * @throws ApiError
     */
    public static createProgram(
        requestBody: ProgramCreate,
    ): CancelablePromise<Program> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/programs',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Get distinct values for a program field
     * Returns all unique values for a specified field in the programs collection. Useful for dynamic filter options in UIs.
     * @param field The field name to get distinct values for (e.g., level, delivery_mode, specializations, etc.)
     * @returns any Distinct values returned successfully
     * @throws ApiError
     */
    public static getProgramDistinctValues(
        field: 'institution_id' | 'name' | 'program_code' | 'description' | 'level' | 'duration' | 'delivery_mode' | 'fees' | 'eligibility' | 'specializations',
    ): CancelablePromise<{
        values?: Array<string>;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/programs/distinct',
            query: {
                'field': field,
            },
            errors: {
                400: `Bad request`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Get program by ID
     * Retrieve a specific program by its unique identifier
     * @param programId Program ID
     * @returns Program Successful response
     * @throws ApiError
     */
    public static getProgram(
        programId: string,
    ): CancelablePromise<Program> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/programs/{programId}',
            path: {
                'programId': programId,
            },
            errors: {
                404: `Resource not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Update program
     * Update an existing program (full update)
     * @param programId Program ID
     * @param requestBody
     * @returns Program Program updated successfully
     * @throws ApiError
     */
    public static updateProgram(
        programId: string,
        requestBody: ProgramUpdate,
    ): CancelablePromise<Program> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/programs/{programId}',
            path: {
                'programId': programId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request`,
                404: `Resource not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Partially update program
     * Update specific fields of a program
     * @param programId Program ID
     * @param requestBody
     * @returns Program Program updated successfully
     * @throws ApiError
     */
    public static patchProgram(
        programId: string,
        requestBody: ProgramPatch,
    ): CancelablePromise<Program> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/programs/{programId}',
            path: {
                'programId': programId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request`,
                404: `Resource not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Delete program
     * Remove a program from the database
     * @param programId Program ID
     * @returns void
     * @throws ApiError
     */
    public static deleteProgram(
        programId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/programs/{programId}',
            path: {
                'programId': programId,
            },
            errors: {
                404: `Resource not found`,
                500: `Internal server error`,
            },
        });
    }
}
