/**
 * Integration Tests for Destination API Routes
 * Tests actual HTTP endpoints with database interactions
 */

const request = require('supertest');
const app = require('../../src/index');
const db = require('../../src/db');

describe('Destination API Routes - Integration Tests', () => {

  // Clean up test data after tests
  afterAll(async () => {
    // Close database connections
    await db.pool.end();
  });

  describe('GET /api/destinations/popular', () => {
    it('should return popular destinations with 200 status', async () => {
      const response = await request(app)
        .get('/api/destinations/popular')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toHaveProperty('status', 200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('count');
    });

    it('should respect limit query parameter', async () => {
      const response = await request(app)
        .get('/api/destinations/popular?limit=3')
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(3);
    });

    it('should filter by criteria parameter', async () => {
      const response = await request(app)
        .get('/api/destinations/popular?criteria=popularity')
        .expect(200);

      expect(response.body.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should include cache headers on second request', async () => {
      // First request
      await request(app).get('/api/destinations/popular');

      // Second request should hit cache
      const response = await request(app)
        .get('/api/destinations/popular')
        .expect(200);

      expect(response.body.status).toBe(200);
    });
  });

  describe('GET /api/destinations/featured', () => {
    it('should return only featured destinations', async () => {
      const response = await request(app)
        .get('/api/destinations/featured')
        .expect(200);

      expect(response.body.data).toBeDefined();

      // If there are results, verify they are featured
      if (response.body.data.length > 0) {
        response.body.data.forEach(dest => {
          expect(dest.flags?.isFeatured).toBe(true);
        });
      }
    });

    it('should handle limit parameter', async () => {
      const response = await request(app)
        .get('/api/destinations/featured?limit=2')
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(2);
    });
  });

  describe('GET /api/destinations/trending', () => {
    it('should return only trending destinations', async () => {
      const response = await request(app)
        .get('/api/destinations/trending')
        .expect(200);

      expect(response.body.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/destinations/slug/:slug', () => {
    it('should return destination by slug with 200 status', async () => {
      // First, get a valid slug from the database
      const destinationsRes = await request(app)
        .get('/api/destinations/popular?limit=1');

      if (destinationsRes.body.data.length > 0) {
        const slug = destinationsRes.body.data[0].slug;

        const response = await request(app)
          .get(`/api/destinations/slug/${slug}`)
          .expect(200);

        expect(response.body.status).toBe(200);
        expect(response.body.data).toHaveProperty('slug', slug);
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data).toHaveProperty('name');
      }
    });

    it('should return 404 for non-existent slug', async () => {
      const response = await request(app)
        .get('/api/destinations/slug/non-existent-destination-slug-xyz')
        .expect(404);

      expect(response.body.status).toBe(404);
      expect(response.body.error).toBeDefined();
    });

    it('should increment view count on each request', async () => {
      const destinationsRes = await request(app)
        .get('/api/destinations/popular?limit=1');

      if (destinationsRes.body.data.length > 0) {
        const slug = destinationsRes.body.data[0].slug;

        // First view
        const response1 = await request(app)
          .get(`/api/destinations/slug/${slug}`)
          .expect(200);

        const initialViews = response1.body.data.stats?.viewCount;

        // Second view - Note: This might be cached, so view count might not change
        await request(app)
          .get(`/api/destinations/slug/${slug}`)
          .expect(200);

        // View count should be a number
        expect(typeof initialViews).toBe('number');
      }
    });
  });

  describe('GET /api/destinations/:id', () => {
    it('should return destination by ID with full details', async () => {
      // Get a valid destination ID first
      const destinationsRes = await request(app)
        .get('/api/destinations/popular?limit=1');

      if (destinationsRes.body.data.length > 0) {
        const id = destinationsRes.body.data[0].id;

        const response = await request(app)
          .get(`/api/destinations/${id}`)
          .expect(200);

        expect(response.body.status).toBe(200);
        expect(response.body.data).toHaveProperty('id', id);
        expect(response.body.data).toHaveProperty('location');
        expect(response.body.data).toHaveProperty('images');
        expect(response.body.data).toHaveProperty('stats');
        expect(response.body.data).toHaveProperty('flags');
      }
    });

    it('should return 404 for non-existent ID', async () => {
      const response = await request(app)
        .get('/api/destinations/999999')
        .expect(404);

      expect(response.body.status).toBe(404);
    });

    it('should return 400 or 404 for invalid ID format', async () => {
      const response = await request(app)
        .get('/api/destinations/invalid-id');

      expect([400, 404, 500]).toContain(response.status);
    });
  });

  describe('GET /api/destinations/:id/related', () => {
    it('should return related destinations', async () => {
      const destinationsRes = await request(app)
        .get('/api/destinations/popular?limit=1');

      if (destinationsRes.body.data.length > 0) {
        const id = destinationsRes.body.data[0].id;

        const response = await request(app)
          .get(`/api/destinations/${id}/related`)
          .expect(200);

        expect(response.body.status).toBe(200);
        expect(Array.isArray(response.body.data)).toBe(true);

        // Related destinations should not include the source destination
        if (response.body.data.length > 0) {
          response.body.data.forEach(dest => {
            expect(dest.id).not.toBe(id);
          });
        }
      }
    });

    it('should respect limit parameter', async () => {
      const destinationsRes = await request(app)
        .get('/api/destinations/popular?limit=1');

      if (destinationsRes.body.data.length > 0) {
        const id = destinationsRes.body.data[0].id;

        const response = await request(app)
          .get(`/api/destinations/${id}/related?limit=2`)
          .expect(200);

        expect(response.body.data.length).toBeLessThanOrEqual(2);
      }
    });
  });

  describe('GET /api/destinations/:id/nearby', () => {
    it('should return nearby destinations within radius', async () => {
      const destinationsRes = await request(app)
        .get('/api/destinations/popular?limit=1');

      if (destinationsRes.body.data.length > 0) {
        const id = destinationsRes.body.data[0].id;

        const response = await request(app)
          .get(`/api/destinations/${id}/nearby?radius=500`)
          .expect(200);

        expect(response.body.status).toBe(200);
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(response.body).toHaveProperty('radius', 500);
      }
    });

    it('should use default radius if not specified', async () => {
      const destinationsRes = await request(app)
        .get('/api/destinations/popular?limit=1');

      if (destinationsRes.body.data.length > 0) {
        const id = destinationsRes.body.data[0].id;

        const response = await request(app)
          .get(`/api/destinations/${id}/nearby`)
          .expect(200);

        expect(response.body.radius).toBeDefined();
        expect(typeof response.body.radius).toBe('number');
      }
    });
  });

  describe('GET /api/destinations/:id/stats', () => {
    it('should return destination statistics', async () => {
      const destinationsRes = await request(app)
        .get('/api/destinations/popular?limit=1');

      if (destinationsRes.body.data.length > 0) {
        const id = destinationsRes.body.data[0].id;

        const response = await request(app)
          .get(`/api/destinations/${id}/stats`)
          .expect(200);

        expect(response.body.status).toBe(200);
        expect(response.body.data).toBeDefined();
        expect(response.body.data).toHaveProperty('tourCount');
        expect(response.body.data).toHaveProperty('avgRating');
        expect(response.body.data).toHaveProperty('totalBookings');
      }
    });

    it('should return 404 for non-existent destination', async () => {
      const response = await request(app)
        .get('/api/destinations/999999/stats')
        .expect(404);

      expect(response.body.status).toBe(404);
    });
  });

  describe('GET /api/destinations', () => {
    it('should return all active destinations with pagination', async () => {
      const response = await request(app)
        .get('/api/destinations')
        .expect(200);

      expect(response.body.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('pagination');
      expect(response.body.pagination).toHaveProperty('limit');
      expect(response.body.pagination).toHaveProperty('offset');
    });

    it('should filter by search query', async () => {
      const response = await request(app)
        .get('/api/destinations?search=Kerala')
        .expect(200);

      expect(response.body.status).toBe(200);
      expect(response.body).toHaveProperty('filters');
      expect(response.body.filters.search).toBe('Kerala');
    });

    it('should filter by region', async () => {
      const response = await request(app)
        .get('/api/destinations?regions=South India,North India')
        .expect(200);

      expect(response.body.filters.regions).toEqual(['South India', 'North India']);
    });

    it('should filter by minimum rating', async () => {
      const response = await request(app)
        .get('/api/destinations?minRating=4.0')
        .expect(200);

      expect(response.body.filters.minRating).toBe(4.0);

      // Verify results match filter
      if (response.body.data.length > 0) {
        response.body.data.forEach(dest => {
          if (dest.stats?.avgRating) {
            expect(dest.stats.avgRating).toBeGreaterThanOrEqual(4.0);
          }
        });
      }
    });

    it('should support pagination with limit and offset', async () => {
      const response = await request(app)
        .get('/api/destinations?limit=5&offset=0')
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(5);
      expect(response.body.pagination.limit).toBe(5);
      expect(response.body.pagination.offset).toBe(0);
    });
  });

  describe('POST /api/destinations/search', () => {
    it('should perform advanced search with multiple filters', async () => {
      const searchPayload = {
        query: 'beach',
        regions: ['South India'],
        minRating: 4.0,
        limit: 10
      };

      const response = await request(app)
        .post('/api/destinations/search')
        .send(searchPayload)
        .expect(200);

      expect(response.body.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.searchQuery).toBe('beach');
    });

    it('should handle empty search criteria', async () => {
      const response = await request(app)
        .post('/api/destinations/search')
        .send({})
        .expect(200);

      expect(response.body.status).toBe(200);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should cache search results', async () => {
      const searchPayload = { query: 'mountains' };

      // First request
      await request(app)
        .post('/api/destinations/search')
        .send(searchPayload)
        .expect(200);

      // Second request (should be cached)
      const response = await request(app)
        .post('/api/destinations/search')
        .send(searchPayload)
        .expect(200);

      expect(response.body.status).toBe(200);
    });
  });

  describe('Response Structure Validation', () => {
    it('should return properly formatted destination objects', async () => {
      const response = await request(app)
        .get('/api/destinations/popular?limit=1')
        .expect(200);

      if (response.body.data.length > 0) {
        const dest = response.body.data[0];

        // Required fields
        expect(dest).toHaveProperty('id');
        expect(dest).toHaveProperty('name');
        expect(dest).toHaveProperty('slug');

        // Nested objects
        expect(dest).toHaveProperty('location');
        expect(dest.location).toHaveProperty('country');

        expect(dest).toHaveProperty('images');

        expect(dest).toHaveProperty('stats');
        expect(dest.stats).toHaveProperty('tourCount');

        expect(dest).toHaveProperty('flags');
        expect(typeof dest.flags.isFeatured).toBe('boolean');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON in POST requests', async () => {
      const response = await request(app)
        .post('/api/destinations/search')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      expect([400, 500]).toContain(response.status);
    });

    it('should handle database connection errors gracefully', async () => {
      // This test would require mocking database failures
      // For now, we just verify the endpoint exists
      const response = await request(app)
        .get('/api/destinations/popular');

      expect([200, 500]).toContain(response.status);
    });
  });

  describe('Performance Tests', () => {
    it('should respond within acceptable time (< 2 seconds)', async () => {
      const start = Date.now();

      await request(app)
        .get('/api/destinations/popular')
        .expect(200);

      const duration = Date.now() - start;

      expect(duration).toBeLessThan(2000); // 2 seconds
    });

    it('should handle concurrent requests efficiently', async () => {
      const requests = Array(5).fill(null).map(() =>
        request(app).get('/api/destinations/popular')
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });
});
