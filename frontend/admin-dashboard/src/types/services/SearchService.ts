/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Institution } from '../models/Institution';
import type { Pagination } from '../models/Pagination';
import type { Program } from '../models/Program';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SearchService {
    /**
     * Search institutions and programs
     * Full-text search across institutions and programs
     * @param q Search query
     * @param type Search scope (institutions, programs, or both)
     * @param page
     * @param limit
     * @returns any Successful response
     * @throws ApiError
     */
    public static search(
        q: string,
        type: 'institutions' | 'programs' | 'all' = 'all',
        page: number = 1,
        limit: number = 20,
    ): CancelablePromise<{
        institutions?: Array<Institution>;
        programs?: Array<Program>;
        pagination?: Pagination;
    }> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/search',
            query: {
                'q': q,
                'type': type,
                'page': page,
                'limit': limit,
            },
            errors: {
                400: `Bad request`,
                500: `Internal server error`,
            },
        });
    }
}
