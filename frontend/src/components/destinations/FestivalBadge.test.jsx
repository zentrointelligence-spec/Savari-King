import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FestivalBadge from './FestivalBadge';

describe('FestivalBadge Component', () => {
  const mockFestivals = [
    {
      name: 'Onam Festival',
      date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
      description: 'Harvest festival of Kerala',
      type: 'Cultural'
    },
    {
      name: 'Vishu',
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      description: 'New Year celebration',
      type: 'Religious'
    },
    {
      name: 'Thrissur Pooram',
      date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days from now
      description: 'Grand temple festival',
      type: 'Religious'
    }
  ];

  describe('Rendering', () => {
    it('should render nothing when no festivals provided', () => {
      const { container } = render(<FestivalBadge festivals={[]} />);
      expect(container.firstChild).toBeNull();
    });

    it('should render nothing when festivals is null', () => {
      const { container } = render(<FestivalBadge festivals={null} />);
      expect(container.firstChild).toBeNull();
    });

    it('should render nothing when festivals is undefined', () => {
      const { container } = render(<FestivalBadge />);
      expect(container).toBeInTheDocument();
    });

    it('should render compact badge when compact prop is true', () => {
      render(<FestivalBadge festivals={mockFestivals} compact={true} />);

      expect(screen.getByText('Onam Festival')).toBeInTheDocument();
      expect(screen.getByText(/in \d+ days?/)).toBeInTheDocument();
    });

    it('should render full version by default', () => {
      render(<FestivalBadge festivals={mockFestivals} />);

      expect(screen.getByText('Upcoming Festivals')).toBeInTheDocument();
      expect(screen.getByText('Onam Festival')).toBeInTheDocument();
    });
  });

  describe('Compact Mode', () => {
    it('should show only the next upcoming festival', () => {
      render(<FestivalBadge festivals={mockFestivals} compact={true} />);

      expect(screen.getByText('Onam Festival')).toBeInTheDocument();
      expect(screen.queryByText('Vishu')).not.toBeInTheDocument();
    });

    it('should display days until festival', () => {
      render(<FestivalBadge festivals={mockFestivals} compact={true} />);

      const daysText = screen.getByText(/in \d+ days?/);
      expect(daysText).toBeInTheDocument();
    });

    it('should use singular "day" when only 1 day away', () => {
      const tomorrowFestival = [{
        name: 'Tomorrow Festival',
        date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Happening tomorrow'
      }];

      render(<FestivalBadge festivals={tomorrowFestival} compact={true} />);

      expect(screen.getByText(/in 1 day/)).toBeInTheDocument();
    });
  });

  describe('Full Mode', () => {
    it('should display all festival details', () => {
      render(<FestivalBadge festivals={mockFestivals} showAll={true} />);

      expect(screen.getByText('Onam Festival')).toBeInTheDocument();
      expect(screen.getByText('Harvest festival of Kerala')).toBeInTheDocument();
      expect(screen.getByText('Cultural')).toBeInTheDocument();
    });

    it('should respect maxDisplay limit', () => {
      render(<FestivalBadge festivals={mockFestivals} maxDisplay={2} />);

      expect(screen.getByText('Onam Festival')).toBeInTheDocument();
      expect(screen.getByText('Vishu')).toBeInTheDocument();
      expect(screen.queryByText('Thrissur Pooram')).not.toBeInTheDocument();
    });

    it('should show "more festivals" message when limited', () => {
      render(<FestivalBadge festivals={mockFestivals} maxDisplay={1} />);

      expect(screen.getByText(/\+2 more festivals? coming soon/)).toBeInTheDocument();
    });

    it('should display festival dates correctly', () => {
      render(<FestivalBadge festivals={mockFestivals} showAll={true} />);

      // Check that dates are rendered (month abbreviations)
      const dateElements = screen.getAllByText(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/);
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });

  describe('Festival Filtering', () => {
    it('should only show festivals within 90 days', () => {
      const mixedFestivals = [
        ...mockFestivals,
        {
          name: 'Far Future Festival',
          date: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000).toISOString(), // 100 days (should be filtered)
          description: 'Too far in the future'
        }
      ];

      render(<FestivalBadge festivals={mixedFestivals} showAll={true} />);

      expect(screen.queryByText('Far Future Festival')).not.toBeInTheDocument();
      expect(screen.getByText('Onam Festival')).toBeInTheDocument();
    });

    it('should not show past festivals', () => {
      const pastFestival = [{
        name: 'Past Festival',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        description: 'Already happened'
      }];

      const { container } = render(<FestivalBadge festivals={pastFestival} />);
      expect(container.firstChild).toBeNull();
    });

    it('should sort festivals by date (closest first)', () => {
      const unsortedFestivals = [
        {
          name: 'Third Festival',
          date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Happening third'
        },
        {
          name: 'First Festival',
          date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Happening first'
        },
        {
          name: 'Second Festival',
          date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          description: 'Happening second'
        }
      ];

      render(<FestivalBadge festivals={unsortedFestivals} compact={true} />);

      // In compact mode, should show the closest festival (First Festival)
      expect(screen.getByText('First Festival')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle festival with missing type gracefully', () => {
      const festivalWithoutType = [{
        name: 'Simple Festival',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'No type specified'
      }];

      render(<FestivalBadge festivals={festivalWithoutType} />);

      expect(screen.getByText('Simple Festival')).toBeInTheDocument();
      expect(screen.getByText('No type specified')).toBeInTheDocument();
    });

    it('should handle empty description', () => {
      const festivalWithoutDesc = [{
        name: 'No Description Festival',
        date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
        description: '',
        type: 'Cultural'
      }];

      render(<FestivalBadge festivals={festivalWithoutDesc} />);

      expect(screen.getByText('No Description Festival')).toBeInTheDocument();
    });
  });

  describe('Props Validation', () => {
    it('should use default maxDisplay of 1', () => {
      render(<FestivalBadge festivals={mockFestivals} />);

      expect(screen.getByText('Onam Festival')).toBeInTheDocument();
      expect(screen.getByText(/\+2 more festivals? coming soon/)).toBeInTheDocument();
    });

    it('should work with showAll prop', () => {
      render(<FestivalBadge festivals={mockFestivals} showAll={true} />);

      expect(screen.getByText('Onam Festival')).toBeInTheDocument();
      expect(screen.getByText('Vishu')).toBeInTheDocument();
      expect(screen.getByText('Thrissur Pooram')).toBeInTheDocument();
      expect(screen.queryByText(/more festivals? coming soon/)).not.toBeInTheDocument();
    });
  });
});
