/**
 * Unit Tests for Destination Service (Standalone - No DB Setup Required)
 * Tests all business logic methods in destinationService.js
 */

// Mock the database BEFORE requiring the service
jest.mock('../../src/db', () => ({
  query: jest.fn(),
  pool: {
    connect: jest.fn(),
    end: jest.fn()
  }
}));

const destinationService = require('../../src/services/destinationService');
const db = require('../../src/db');

describe('Destination Service - Unit Tests (Standalone)', () => {

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
          description: 'Gods Own Country',
          short_description: 'Beautiful state',
          country: 'India',
          state: 'Kerala',
          region: 'South India',
          tour_count: 10,
          avg_rating: 4.5,
          total_bookings: 100,
          wishlist_count: 50,
          is_featured: true,
          is_trending: false,
          is_active: true
        }
      ];

      db.query.mockResolvedValue({ rows: mockDestinations });

      const result = await destinationService.getTopDestinations(6);

      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('id', 1);
      expect(result[0]).toHaveProperty('name', 'Kerala');
      expect(result[0]).toHaveProperty('popularityScore');
      expect(db.query).toHaveBeenCalledTimes(1);
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
        thumbnail_image: 'https://example.com/thumb.jpg',
        featured_image: null,
        gallery_images: null,
        video_url: null,
        best_time_to_visit: 'October to March',
        peak_season: 'December to February',
        off_season: 'June to September',
        current_season: 'Winter',
        current_season_description: 'Pleasant weather',
        climate_info: 'Tropical climate',
        weather_data: {},
        festivals_events: [],
        top_attractions: ['Backwaters', 'Tea Gardens'],
        activities: ['Houseboat cruise'],
        local_specialties: ['Appam'],
        cultural_highlights: ['Kathakali'],
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
        unesco_site: false,
        heritage_site: true,
        wildlife_sanctuary: false,
        family_friendly: true,
        eco_friendly: true,
        nearest_airport: 'Cochin International',
        nearest_railway: 'Ernakulam Junction',
        local_transport: 'Bus, Taxi',
        how_to_reach: 'By air, rail, road',
        recommended_duration: '3-4 days',
        difficulty_level: 'easy',
        adventure_level: 'low',
        travel_tips: 'Carry light clothes',
        local_customs: 'Respect traditions',
        safety_info: 'Safe destination',
        is_active: true,
        meta_title: 'Kerala Tourism',
        meta_description: 'Explore Kerala',
        canonical_url: 'https://example.com/kerala',
        popularity_score: 85.5
      };

      const formatted = destinationService.formatDestinationResponse(rawData);

      // Core fields
      expect(formatted).toHaveProperty('id', 1);
      expect(formatted).toHaveProperty('name', 'Kerala');
      expect(formatted).toHaveProperty('slug', 'kerala');
      expect(formatted).toHaveProperty('description', 'Gods Own Country');

      // Location object
      expect(formatted).toHaveProperty('location');
      expect(formatted.location).toHaveProperty('country', 'India');
      expect(formatted.location).toHaveProperty('state', 'Kerala');
      expect(formatted.location).toHaveProperty('region', 'South India');
      expect(formatted.location).toHaveProperty('latitude', 10.8505);
      expect(formatted.location).toHaveProperty('longitude', 76.2711);

      // Images object
      expect(formatted).toHaveProperty('images');
      expect(formatted.images).toHaveProperty('main', 'https://example.com/kerala.jpg');
      expect(formatted.images).toHaveProperty('thumbnail', 'https://example.com/thumb.jpg');

      // Timing object
      expect(formatted).toHaveProperty('timing');
      expect(formatted.timing).toHaveProperty('bestTimeToVisit', 'October to March');
      expect(formatted.timing).toHaveProperty('peakSeason', 'December to February');

      // Stats object
      expect(formatted).toHaveProperty('stats');
      expect(formatted.stats).toHaveProperty('tourCount', 10);
      expect(formatted.stats).toHaveProperty('avgRating', 4.5);
      expect(formatted.stats).toHaveProperty('reviewCount', 100);
      expect(formatted.stats).toHaveProperty('totalBookings', 200);

      // Flags object
      expect(formatted).toHaveProperty('flags');
      expect(formatted.flags).toHaveProperty('isFeatured', true);
      expect(formatted.flags).toHaveProperty('isTrending', false);
      expect(formatted.flags).toHaveProperty('isUNESCO', false);
      expect(formatted.flags).toHaveProperty('heritageSite', true);

      // Popularity score
      expect(formatted).toHaveProperty('popularityScore', 85.5);
    });

    it('should handle null/undefined values gracefully', () => {
      const rawData = {
        id: 1,
        name: 'Test Destination',
        slug: 'test-dest',
        description: null,
        latitude: null,
        longitude: null,
        main_image: null,
        festivals_events: null,
        weather_data: null,
        top_attractions: null,
        tour_count: 0,
        avg_rating: null,
        is_active: true
      };

      const formatted = destinationService.formatDestinationResponse(rawData);

      expect(formatted.description).toBeNull();
      expect(formatted.location.latitude).toBeNull();
      expect(formatted.location.longitude).toBeNull();
      expect(formatted.images.main).toBeNull();
      expect(formatted.timing.upcomingFestivals).toEqual([]);
      expect(formatted.climate.weatherData).toEqual({});
      expect(formatted.attractions.top).toEqual([]);
      expect(formatted.stats.avgRating).toBeNull();
    });

    it('should parse JSONB fields correctly', () => {
      const rawData = {
        id: 1,
        name: 'Test',
        slug: 'test',
        festivals_events: [{ name: 'Onam', date: '2025-09-15' }],
        weather_data: { summer: { temp: '35°C' } },
        gallery_images: ['img1.jpg', 'img2.jpg'],
        is_active: true,
        tour_count: 5,
        total_bookings: 10,
        wishlist_count: 3
      };

      const formatted = destinationService.formatDestinationResponse(rawData);

      expect(formatted.timing.upcomingFestivals).toHaveLength(1);
      expect(formatted.timing.upcomingFestivals[0]).toHaveProperty('name', 'Onam');
      expect(formatted.climate.weatherData).toHaveProperty('summer');
      expect(formatted.images.gallery).toEqual(['img1.jpg', 'img2.jpg']);
    });
  });

  describe('getDestinationById', () => {
    it('should return a formatted destination by ID', async () => {
      const mockDestination = {
        id: 1,
        name: 'Kerala',
        slug: 'kerala',
        is_active: true,
        tour_count: 10,
        avg_rating: 4.5,
        total_bookings: 100,
        wishlist_count: 50
      };

      db.query.mockResolvedValue({ rows: [mockDestination] });

      const result = await destinationService.getDestinationById(1);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.name).toBe('Kerala');
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
  });

  describe('getRelatedDestinations', () => {
    it('should return related destinations', async () => {
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
        }
      ];

      db.query.mockResolvedValue({ rows: mockRelated });

      const result = await destinationService.getRelatedDestinations(1, 4);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(2);
      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE d.id != $1'),
        [1, 4]
      );
    });
  });

  describe('getNearbyDestinations', () => {
    it('should return destinations within radius', async () => {
      const mockNearby = [
        {
          id: 2,
          name: 'Cochin',
          slug: 'cochin',
          latitude: 9.9312,
          longitude: 76.2673,
          distance: 50.5,
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
      expect(result[0]).toHaveProperty('distance', 50.5);
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
    });

    it('should return null for non-existent destination', async () => {
      db.query.mockResolvedValue({ rows: [] });

      const result = await destinationService.getDestinationStats(999);

      expect(result).toBeNull();
    });
  });

  describe('getEnrichedDestinations', () => {
    it('should build query with search filter', async () => {
      db.query.mockResolvedValue({ rows: [] });

      await destinationService.getEnrichedDestinations(
        { search: 'Kerala' },
        { limit: 10, offset: 0 }
      );

      expect(db.query).toHaveBeenCalledWith(
        expect.stringContaining('to_tsvector'),
        expect.arrayContaining([expect.stringContaining('Kerala')])
      );
    });

    it('should apply multiple filters', async () => {
      db.query.mockResolvedValue({ rows: [] });

      await destinationService.getEnrichedDestinations(
        {
          regions: ['South India'],
          minRating: 4.0,
          budgetCategories: ['mid']
        },
        {}
      );

      expect(db.query).toHaveBeenCalled();
      const query = db.query.mock.calls[0][0];
      expect(query).toContain('region = ANY');
      expect(query).toContain('avg_rating >=');
      expect(query).toContain('budget_category = ANY');
    });
  });
});
