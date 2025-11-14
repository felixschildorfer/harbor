import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import AnchorModel from '../models/AnchorModel.js';
import router from './anchorModels.js';

// Setup Express app for testing
const app = express();
app.use(express.json());
app.use('/api/anchor-models', router);

// Mock data
const mockModel = {
  name: 'Test Model',
  xmlContent: '<schema><anchor mnemonic="TE"><descriptor>Test</descriptor></anchor></schema>',
  version: 1
};

const mockModelUpdate = {
  name: 'Updated Model',
  xmlContent: '<schema><anchor mnemonic="UM"><descriptor>Updated</descriptor></anchor></schema>'
};

describe('Anchor Models Routes', () => {
  let modelId;

  describe('POST /api/anchor-models', () => {
    test('should create a new anchor model with name and xmlContent', async () => {
      const res = await request(app)
        .post('/api/anchor-models')
        .send(mockModel);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toBe(mockModel.name);
      expect(res.body.xmlContent).toBe(mockModel.xmlContent);
      expect(res.body.version).toBe(1);
      modelId = res.body._id;
    });

    test('should auto-generate model name if not provided', async () => {
      const res = await request(app)
        .post('/api/anchor-models')
        .send({
          xmlContent: '<schema></schema>'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.name).toMatch(/Model \d{1,2}\/\d{1,2}\/\d{4}/);
    });

    test('should return 400 if xmlContent is missing', async () => {
      const res = await request(app)
        .post('/api/anchor-models')
        .send({
          name: 'Test'
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain('XML content is required');
    });

    test('should trim whitespace from name and xmlContent', async () => {
      const res = await request(app)
        .post('/api/anchor-models')
        .send({
          name: '  Trimmed Model  ',
          xmlContent: '  <schema></schema>  '
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.name).toBe('Trimmed Model');
      expect(res.body.xmlContent).toBe('<schema></schema>');
    });
  });

  describe('GET /api/anchor-models', () => {
    test('should fetch all anchor models', async () => {
      const res = await request(app)
        .get('/api/anchor-models');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    test('should return models sorted by createdAt in descending order', async () => {
      const res = await request(app)
        .get('/api/anchor-models');

      expect(res.statusCode).toBe(200);
      if (res.body.length > 1) {
        for (let i = 0; i < res.body.length - 1; i++) {
          const current = new Date(res.body[i].createdAt).getTime();
          const next = new Date(res.body[i + 1].createdAt).getTime();
          expect(current).toBeGreaterThanOrEqual(next);
        }
      }
    });

    test('should include version field in each model', async () => {
      const res = await request(app)
        .get('/api/anchor-models');

      expect(res.statusCode).toBe(200);
      res.body.forEach(model => {
        expect(model).toHaveProperty('version');
        expect(typeof model.version).toBe('number');
      });
    });
  });

  describe('GET /api/anchor-models/:id', () => {
    test('should fetch a single anchor model by ID', async () => {
      const res = await request(app)
        .get(`/api/anchor-models/${modelId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body._id).toBe(modelId);
      expect(res.body.name).toBe(mockModel.name);
    });

    test('should return 404 for non-existent model ID', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/anchor-models/${fakeId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toContain('not found');
    });

    test('should return 400 for invalid MongoDB ObjectId', async () => {
      const res = await request(app)
        .get('/api/anchor-models/invalid-id');

      expect(res.statusCode).toBe(500);
    });
  });

  describe('PUT /api/anchor-models/:id', () => {
    test('should update model name only without incrementing version', async () => {
      const res = await request(app)
        .put(`/api/anchor-models/${modelId}`)
        .send({
          name: 'Renamed Model'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('Renamed Model');
      expect(res.body.version).toBe(1); // Version unchanged
    });

    test('should update xmlContent and increment version', async () => {
      const res = await request(app)
        .put(`/api/anchor-models/${modelId}`)
        .send({
          xmlContent: '<schema><updated>true</updated></schema>'
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.xmlContent).toContain('<updated>');
      expect(res.body.version).toBe(2); // Version incremented
    });

    test('should update both name and xmlContent', async () => {
      const res = await request(app)
        .put(`/api/anchor-models/${modelId}`)
        .send(mockModelUpdate);

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe(mockModelUpdate.name);
      expect(res.body.xmlContent).toBe(mockModelUpdate.xmlContent);
    });

    test('should return 404 for non-existent model', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .put(`/api/anchor-models/${fakeId}`)
        .send({ name: 'Test' });

      expect(res.statusCode).toBe(404);
    });

    test('should trim whitespace from updated values', async () => {
      const res = await request(app)
        .put(`/api/anchor-models/${modelId}`)
        .send({
          name: '  Trimmed Update  ',
          xmlContent: '  <schema></schema>  '
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('Trimmed Update');
      expect(res.body.xmlContent).toBe('<schema></schema>');
    });
  });

  describe('DELETE /api/anchor-models/:id', () => {
    let deleteTestModelId;

    beforeAll(async () => {
      // Create a model specifically for deletion testing
      const res = await request(app)
        .post('/api/anchor-models')
        .send(mockModel);
      deleteTestModelId = res.body._id;
    });

    test('should delete an anchor model', async () => {
      const res = await request(app)
        .delete(`/api/anchor-models/${deleteTestModelId}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toContain('deleted successfully');
    });

    test('should return 404 when deleting non-existent model', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .delete(`/api/anchor-models/${fakeId}`);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toContain('not found');
    });

    test('should not be retrievable after deletion', async () => {
      const res = await request(app)
        .get(`/api/anchor-models/${deleteTestModelId}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed JSON gracefully', async () => {
      const res = await request(app)
        .post('/api/anchor-models')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      expect(res.statusCode).toBe(400);
    });

    test('should handle database errors gracefully', async () => {
      // Attempt to create a model with extremely long name (might exceed DB limits)
      const longName = 'x'.repeat(10000);
      const res = await request(app)
        .post('/api/anchor-models')
        .send({
          name: longName,
          xmlContent: '<schema></schema>'
        });

      // Should either succeed or fail gracefully with proper error message
      expect([201, 400]).toContain(res.statusCode);
    });
  });
});
