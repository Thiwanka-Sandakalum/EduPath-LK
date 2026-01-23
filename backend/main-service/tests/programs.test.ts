import request from 'supertest';
import app from '../src/app';

describe('Programs API', () => {
    let programId: string;
    let institutionId: string;

    beforeAll(async () => {
        // Create an institution for program reference
        const res = await request(app)
            .post('/api/institutions')
            .send({ name: 'Program University', confidence_score: 0.8 })
            .set('Authorization', 'Bearer testtoken');
        institutionId = res.body._id;
    });

    it('should create a new program', async () => {
        const res = await request(app)
            .post('/api/programs')
            .send({ institution_id: institutionId, name: 'CS', confidence_score: 0.8 })
            .set('Authorization', 'Bearer testtoken');
        expect(res.statusCode).toBe(201);
        expect(res.body.name).toBe('CS');
        programId = res.body._id;
    });

    it('should list programs', async () => {
        const res = await request(app).get('/api/programs');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should get program by ID', async () => {
        const res = await request(app).get(`/api/programs/${programId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body._id).toBe(programId);
    });

    it('should update program', async () => {
        const res = await request(app)
            .put(`/api/programs/${programId}`)
            .send({ institution_id: institutionId, name: 'CS Updated', confidence_score: 0.85 })
            .set('Authorization', 'Bearer testtoken');
        expect(res.statusCode).toBe(200);
        expect(res.body.name).toBe('CS Updated');
    });

    it('should delete program', async () => {
        const res = await request(app)
            .delete(`/api/programs/${programId}`)
            .set('Authorization', 'Bearer testtoken');
        expect(res.statusCode).toBe(204);
    });
});
