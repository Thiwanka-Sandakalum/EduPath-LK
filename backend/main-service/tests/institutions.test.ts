import request from 'supertest';
import app from '../src/app';

describe('Institutions API', () => {
    let institutionId: string;

    it('should create a new institution', async () => {
        const res = await request(app)
            .post('/api/institutions')
            .send({ name: 'Test University', confidence_score: 0.9 })
            .set('Authorization', 'Bearer testtoken');
        expect(res.statusCode).toBe(201);
        expect(res.body.name).toBe('Test University');
        institutionId = res.body._id;
    });

    it('should list institutions', async () => {
        const res = await request(app).get('/api/institutions');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should get institution by ID', async () => {
        const res = await request(app).get(`/api/institutions/${institutionId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body._id).toBe(institutionId);
    });

    it('should update institution', async () => {
        const res = await request(app)
            .put(`/api/institutions/${institutionId}`)
            .send({ name: 'Updated University', confidence_score: 0.95 })
            .set('Authorization', 'Bearer testtoken');
        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe('Updated University');
    });

    it('should delete institution', async () => {
        const res = await request(app)
            .delete(`/api/institutions/${institutionId}`)
            .set('Authorization', 'Bearer testtoken');
        expect(res.statusCode).toBe(204);
    });
});
