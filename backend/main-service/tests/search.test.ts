import request from 'supertest';
import app from '../src/app';

describe('Search API', () => {
    it('should search institutions and programs', async () => {
        const res = await request(app).get('/api/search?q=Test');
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('institutions');
        expect(res.body).toHaveProperty('programs');
        expect(res.body).toHaveProperty('pagination');
    });
});
