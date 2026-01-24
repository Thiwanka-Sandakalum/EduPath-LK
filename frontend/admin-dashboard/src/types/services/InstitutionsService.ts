/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Institution } from '../models/Institution';
import type { InstitutionCreate } from '../models/InstitutionCreate';
import type { InstitutionPatch } from '../models/InstitutionPatch';
import type { InstitutionUpdate } from '../models/InstitutionUpdate';
import type { Pagination } from '../models/Pagination';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class InstitutionsService {
    /**
     * List all institutions
     * Retrieve a paginated list of institutions with optional filtering
     * @param page Page number
     * @param limit Items per page
     * @param country Filter by country
     * @param type Filter by institution type
     * @param sort Sort field and direction (e.g., name:asc, confidence_score:desc)
     * @returns any Successful response
     * @throws ApiError
     */
    public static listInstitutions(
        page: number = 1,
        limit: number = 20,
        country?: string,
        type?: string,
        sort: string = 'name:asc',
    ): CancelablePromise<{
        data?: Array<Institution>;
        pagination?: Pagination;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/institutions',
            query: {
                'page': page,
                'limit': limit,
                'country': country,
                'type': type,
                'sort': sort,
            },
            errors: {
                400: `Bad request`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Create a new institution
     * Add a new institution to the database
     * @param requestBody
     * @returns Institution Institution created successfully
     * @throws ApiError
     */
    public static createInstitution(
        requestBody: InstitutionCreate,
    ): CancelablePromise<Institution> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/institutions',
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request`,
                409: `Conflict - resource already exists`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Get institution by ID
     * Retrieve a specific institution by its unique identifier
     * @param institutionId Institution ID
     * @returns Institution Successful response
     * @throws ApiError
     */
    public static getInstitution(
        institutionId: string,
    ): CancelablePromise<Institution> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/institutions/{institutionId}',
            path: {
                'institutionId': institutionId,
            },
            errors: {
                404: `Resource not found`,
                500: `Internal server error`,
            },
        });
    }
    /**
     * Update institution
     * Update an existing institution (full update)
     * @param institutionId Institution ID
     * @param requestBody
     * @returns Institution Institution updated successfully
     * @throws ApiError
     */
    public static updateInstitution(
        institutionId: string,
        requestBody: InstitutionUpdate,
    ): CancelablePromise<Institution> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/institutions/{institutionId}',
            path: {
                'institutionId': institutionId,
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
     * Partially update institution
     * Update specific fields of an institution
     * @param institutionId Institution ID
     * @param requestBody
     * @returns Institution Institution updated successfully
     * @throws ApiError
     */
    public static patchInstitution(
        institutionId: string,
        requestBody: InstitutionPatch,
    ): CancelablePromise<Institution> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/institutions/{institutionId}',
            path: {
                'institutionId': institutionId,
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
     * Delete institution
     * Remove an institution from the database
     * @param institutionId Institution ID
     * @returns void
     * @throws ApiError
     */
    public static deleteInstitution(
        institutionId: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/institutions/{institutionId}',
            path: {
                'institutionId': institutionId,
            },
            errors: {
                404: `Resource not found`,
                409: `Cannot delete institution with associated programs`,
                500: `Internal server error`,
            },
        });
    }
}
