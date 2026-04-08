/**
 * Unit Tests for Destination Service
 * Tests all business logic methods in destinationService.js
 */

const destinationService = require('../../src/services/destinationService');
const db = require('../../src/db');

// Mock the database
jest.mock('../../src/db');

describe('Destination Service - Unit Tests', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTopDestinations', () => {
    it('should return top destinations with default limit', async () => {
      const mockDestinations = [
        {
          id: 1,
          name: 'Kerala',
          slug: 'kerala',
          tour_count: 10,
          avg_rating: 4.5,
          total_bookings: 100,
          wishlist_count: 50,
          is_featured: true,
          is_trending: false,
          is_active: true
        },
        {
          id: 2,
          name: 'Goa',
          slug: 'goa',
          tour_count: 8,
          avg_rating: 4.3,
          total_bookings: 80,
          wishlist_count: 40,
          is_featured: true,
          is_trending: true,
          is_active: true
        }
      ];

      db.query.mockResolvedValue({ rows: mockDestinations });

      const result = await destinationService.getTopDestinations(6);

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('popularityScore');
      expect(db.query).toHaveBeenCalledTimes(1);
    });

    it('should filter by featured criteria', async () => {
      const mockFeaturedDests = [
        {
          id: 1,
          name: 'Kerala',
          slug: 'kerala',
          is_featured: true,
          is_active: true,
          tour_count: 10,
          avg_rating: 4.5,
          total_bookings: 100,
          wishlist_count: 50
        }
      ];

      db.query.mockResolvedValue({ rows: mockFeaturedDests });

      const result = await destinationService.getTopDestinations(6, 'featured');

      expect(result).toHaveLength(1);
      expect(result[0].flags.isFeatured).toBe(true);
    });

    it('should filter by trending criteria', async () => {
      const mockTrendingDests = [
        {
          id: 2,
          name: 'Goa',
          slug: 'goa',
          is_trending: true,
          is_active: true,
          tour_count: 8,
          avg_rating: 4.3,
          total_bookings: 80,
          wishlist_count: 40
        }
      ];

      db.query.mockResolvedValue({ rows: mockTrendingDests });

      const result = await destinationService.getTopDestinations(6, 'trending');

      expect(result).toHaveLength(1);
      expect(result[0].flags.isTrending).toBe(true);
    });

    it('should handle empty results', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await destinationService.getTopDestinations(6);

      expect(result).toEqual([]);
    });

    it('should handle database errors gracefully', async () => {
      db.query.mockRejectedValue(new Error('Database connection failed'));

      await expect(destinationService.getTopDestinations(6))
        .rejects
        .toThrow('Database connection failed');
    });
  });

  describe('getDestinationById', () => {
    it('should return a formatted destination by ID', async () => {
      const mockDestination = {
        id: 1,
        name: 'Kerala',
        slug: 'kerala-gods-own-country',
        description: 'Beautiful backwaters and greenery',
        short_description: 'Gods Own Country',
        country: 'India',
        state: 'Kerala',
        region: 'South India',
        latitude: 10.8505,
        longitude: 76.2711,
        main_image: 'https://example.com/kerala.jpg',
        thumbnail_image: 'https://example.com/kerala-thumb.jpg',
        featured_image: null,
        gallery_images: null,
        video_url: null,
        best_time_to_visit: 'October to March',
        peak_season: 'December to February',
        off_season: 'June to September',
        climate_info: 'Tropical climate',
        weather_data: {},
        festivals_events: [],
        top_attractions: ['Backwaters', 'Tea Gardens', 'Beaches'],
        activities: ['Houseboat cruise', 'Ayurveda', 'Wildlife'],
        local_specialties: ['Appam', 'Puttu', 'Fish Curry'],
        tour_count: 10,
        avg_rating: 4.5,
        review_count: 100,
        total_bookings: 200,
        wishlist_count: 50,
        view_count: 1000,
        min_price: 5000,
        max_price: 50000,
        budget_category: 'mid',
        is_featured: true,
        is_trending: false,
        is_active: true,
        unesco_site: false,
        heritage_site: true,
        wildlife_sanctuary: false
      };

      db.query.mockResolvedValue({ rows: [mockDestination] });

      const result = await destinationService.getDestinationById(1);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.name).toBe('Kerala');
      expect(result.location).toHaveProperty('country', 'India');
      expect(result.location).toHaveProperty('latitude', 10.8505);
      expect(result.stats).toHaveProperty('tourCount', 10);
      expect(result.flags).toHaveProperty('isFeatured', true);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [1]
      );
    });

    it('should return null for non-existent destination', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await destinationService.getDestinationById(999);

      expect(result).toBeNull();
    });

    it('should return null for inactive destination', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await destinationService.getDestinationById(1);

      expect(result).toBeNull();
    });
  });

  describe('getRelatedDestinations', () => {
    it('should return related destinations based on region and category', async () => {
      const mockRelated = [
        {
          id: 2,
          name: 'Tamil Nadu',
          slug: 'tamil-nadu',
          region: 'South India',
          is_active: true,
          tour_count: 8,
          avg_rating: 4.3,
          total_bookings: 150,
          wishlist_count: 30
        },
        {
          id: 3,
          name: 'Karnataka',
          slug: 'karnataka',
          region: 'South India',
          is_active: true,
          tour_count: 12,
          avg_rating: 4.6,
          total_bookings: 180,
          wishlist_count: 45
        }
      ];

      db.query.mockResolvedValue({ rows: mockRelated });

      const result = await destinationService.getRelatedDestinations(1, 4);

      expect(result).toHaveLength(2);
      expect(result[0].id).not.toBe(1); // Should not include the source destination
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE d.id != $1'),
        [1, 4]
      );
    });

    it('should limit results to specified count', async () => {
      const mockRelated = [
        { id: 2, name: 'Dest 2', is_active: true, tour_count: 5, avg_rating: 4.0, total_bookings: 50, wishlist_count: 10 },
        { id: 3, name: 'Dest 3', is_active: true, tour_count: 6, avg_rating: 4.2, total_bookings: 60, wishlist_count: 15 }
      ];

      db.query.mockResolvedValue({ rows: mockRelated });

      const result = await destinationService.getRelatedDestinations(1, 2);

      expect(result.length).toBeLessThanOrEqual(2);
    });
  });

  describe('getNearbyDestinations', () => {
    it('should return destinations within specified radius', async () => {
      const mockNearby = [
        {
          id: 2,
          name: 'Cochin',
          slug: 'cochin',
          latitude: 9.9312,
          longitude: 76.2673,
          is_active: true,
          tour_count: 7,
          avg_rating: 4.4,
          total_bookings: 120,
          wishlist_count: 35
        }
      ];

      db.query.mockResolvedValue({ rows: mockNearby });

      const result = await destinationService.getNearbyDestinations(1, 100, 4);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(2);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('ST_Distance'),
        [1, 100, 4]
      );
    });

    it('should handle destinations without coordinates', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await destinationService.getNearbyDestinations(1, 100, 4);

      expect(result).toEqual([]);
    });
  });

  describe('getDestinationStats', () => {
    it('should return comprehensive statistics', async () => {
      const mockStats = {
        id: 1,
        name: 'Kerala',
        tour_count: 10,
        avg_rating: 4.5,
        review_count: 100,
        total_bookings: 200,
        wishlist_count: 50,
        view_count: 1000
      };

      db.query.mockResolvedValue({ rows: [mockStats] });

      const result = await destinationService.getDestinationStats(1);

      expect(result).toHaveProperty('tourCount', 10);
      expect(result).toHaveProperty('avgRating', 4.5);
      expect(result).toHaveProperty('reviewCount', 100);
      expect(result).toHaveProperty('totalBookings', 200);
    });

    it('should return null for non-existent destination', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await destinationService.getDestinationStats(999);

      expect(result).toBeNull();
    });
  });

  describe('getEnrichedDestinations', () => {
    it('should apply search filter', async () => {
      const mockDests = [
        {
          id: 1,
          name: 'Kerala Backwaters',
          description: 'Beautiful waterways',
          is_active: true,
          tour_count: 10,
          avg_rating: 4.5,
          total_bookings: 100,
          wishlist_count: 50
        }
      ];

      db.query.mockResolvedValue({ rows: mockDests });

      const result = await destinationService.getEnrichedDestinations(
        { search: 'Kerala' },
        { limit: 10, offset: 0 }
      );

      expect(result).toHaveLength(1);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('to_tsvector'),
        expect.any(Array)
      );
    });

    it('should apply region filter', async () => {
      db.query.mockResolvedValue({ rows: [] });

      await destinationService.getEnrichedDestinations(
        { regions: ['South India', 'North India'] },
        {}
      );

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('region = ANY'),
        expect.any(Array)
      );
    });

    it('should apply budget filter', async () => {
      db.query.mockResolvedValue({ rows: [] });

      await destinationService.getEnrichedDestinations(
        { budgetCategories: ['budget', 'mid'] },
        {}
      );

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('budget_category = ANY'),
        expect.any(Array)
      );
    });

    it('should apply rating filter', async () => {
      db.query.mockResolvedValue({ rows: [] });

      await destinationService.getEnrichedDestinations(
        { minRating: 4.0 },
        {}
      );

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('avg_rating >='),
        expect.any(Array)
      );
    });
  });

  describe('formatDestinationResponse', () => {
    it('should format raw database row correctly', () => {
      const rawData = {
        id: 1,
        name: 'Kerala',
        slug: 'kerala',
        description: 'Gods Own Country',
        short_description: 'Beautiful state',
        country: 'India',
        state: 'Kerala',
        region: 'South India',
        latitude: 10.8505,
        longitude: 76.2711,
        main_image: 'https://example.com/kerala.jpg',
        best_time_to_visit: 'October to March',
        tour_count: 10,
        avg_rating: 4.5,
        is_featured: true,
        is_trending: false,
        unesco_site: false
      };

      const formatted = destinationService.formatDestinationResponse(rawData);

      expect(formatted).toHaveProperty('id', 1);
      expect(formatted).toHaveProperty('name', 'Kerala');
      expect(formatted).toHaveProperty('location');
      expect(formatted.location).toHaveProperty('country', 'India');
      expect(formatted).toHaveProperty('images');
      expect(formatted.images).toHaveProperty('main', 'https://example.com/kerala.jpg');
      expect(formatted).toHaveProperty('stats');
      expect(formatted.stats).toHaveProperty('tourCount', 10);
      expect(formatted).toHaveProperty('flags');
      expect(formatted.flags).toHaveProperty('isFeatured', true);
    });

    it('should handle null/undefined values gracefully', () => {
      const rawData = {
        id: 1,
        name: 'Test',
        slug: 'test',
        latitude: null,
        longitude: null,
        main_image: null,
        festivals_events: null,
        tour_count: 0,
        avg_rating: null
      };

      const formatted = destinationService.formatDestinationResponse(rawData);

      expect(formatted.location.latitude).toBeNull();
      expect(formatted.location.longitude).toBeNull();
      expect(formatted.images.main).toBeNull();
      expect(formatted.timing.upcomingFestivals).toEqual([]);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle SQL injection attempts safely', async () => {
      const maliciousInput = "'; DROP TABLE destinations; --";

      db.query.mockResolvedValue({ rows: [] });

      await destinationService.getEnrichedDestinations(
        { search: maliciousInput },
        {}
      );

      // Verify parameterized query was used
      expect(db.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([expect.stringContaining(maliciousInput)])
      );
    });

    it('should handle very large limit values', async () => {
      db.query.mockResolvedValue({ rows: [] });

      await destinationService.getTopDestinations(10000);

      // Should still execute without errors
      expect(db.query).toHaveBeenCalled();
    });

    it('should handle negative limit values', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await destinationService.getTopDestinations(-5);

      // Should return empty array or handle gracefully
      expect(Array.isArray(result)).toBe(true);
    });
  });
});
