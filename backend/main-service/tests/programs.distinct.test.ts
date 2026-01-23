import request from 'supertest';
import app from '../src/app';

describe('Programs Distinct API', () => {
    it('should return distinct levels', async () => {
        const res = await request(app).get('/api/programs/distinct?field=level');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.values)).toBe(true);
    });
});
