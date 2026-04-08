import React, { useState } from 'react';
import {
  Bike, Mountain, Camera, Utensils, Heart, ShoppingBag,
  Waves, TreePine, Sun, Moon, Users, Sparkles, Award,
  CheckCircle, Circle
} from 'lucide-react';

/**
 * ActivitiesSection Component - Phase 4
 * Displays available activities and experiences
 */
const ActivitiesSection = ({ attractions }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  if (!attractions || !attractions.activities) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Sparkles size={48} className="mx-auto mb-4 opacity-50" />
        <p>Activity information is not available for this destination.</p>
      </div>
    );
  }

  const activities = attractions.activities || [];
  const specialties = attractions.specialties || [];
  const experiences = attractions.experiences || [];

  // Activity icon mapping
  const getActivityIcon = (activityName) => {
    const name = activityName.toLowerCase();
    if (name.includes('trek') || name.includes('hik')) return Mountain;
    if (name.includes('bike') || name.includes('cycl')) return Bike;
    if (name.includes('photo') || name.includes('sight')) return Camera;
    if (name.includes('food') || name.includes('culinar')) return Utensils;
    if (name.includes('shop') || name.includes('market')) return ShoppingBag;
    if (name.includes('water') || name.includes('boat') || name.includes('swim')) return Waves;
    if (name.includes('wildlife') || name.includes('nature')) return TreePine;
    if (name.includes('sunset') || name.includes('sunrise')) return Sun;
    if (name.includes('night') || name.includes('evening')) return Moon;
    if (name.includes('cultural') || name.includes('heritage')) return Users;
    if (name.includes('spa') || name.includes('wellness')) return Heart;
    return Sparkles;
  };

  // Activity category mapping
  const getActivityCategory = (activityName) => {
    const name = activityName.toLowerCase();
    if (name.includes('trek') || name.includes('hik') || name.includes('climb')) {
      return 'adventure';
    }
    if (name.includes('food') || name.includes('culinar') || name.includes('taste')) {
      return 'culinary';
    }
    if (name.includes('cultural') || name.includes('heritage') || name.includes('temple')) {
      return 'cultural';
    }
    if (name.includes('water') || name.includes('boat') || name.includes('beach')) {
      return 'water';
    }
    if (name.includes('wildlife') || name.includes('nature') || name.includes('safari')) {
      return 'nature';
    }
    if (name.includes('shop') || name.includes('market')) return 'shopping';
    if (name.includes('spa') || name.includes('wellness') || name.includes('yoga')) {
      return 'wellness';
    }
    return 'other';
  };

  const categories = [
    { id: 'all', label: 'All Activities', color: 'blue' },
    { id: 'adventure', label: 'Adventure', color: 'orange' },
    { id: 'cultural', label: 'Cultural', color: 'purple' },
    { id: 'culinary', label: 'Culinary', color: 'red' },
    { id: 'nature', label: 'Nature', color: 'green' },
    { id: 'water', label: 'Water Sports', color: 'cyan' },
    { id: 'wellness', label: 'Wellness', color: 'pink' },
    { id: 'shopping', label: 'Shopping', color: 'yellow' }
  ];

  // Filter activities by category
  const filteredActivities =
    selectedCategory === 'all'
      ? activities
      : activities.filter(
          (activity) =>
            getActivityCategory(typeof activity === 'string' ? activity : activity.name) ===
            selectedCategory
        );

  return (
    <div className="space-y-8">
      {/* Category Filter */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Things to Do
        </h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategory === category.id
                  ? `bg-${category.color}-600 text-white shadow-md`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activities Grid */}
      {filteredActivities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredActivities.map((activity, idx) => {
            const activityName = typeof activity === 'string' ? activity : activity.name;
            const ActivityIcon = getActivityIcon(activityName);
            const category = getActivityCategory(activityName);
            const categoryColor = categories.find((c) => c.id === category)?.color || 'blue';

            return (
              <div
                key={idx}
                className="group bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-300"
              >
                {/* Icon */}
                <div
                  className={`w-14 h-14 bg-gradient-to-br from-${categoryColor}-400 to-${categoryColor}-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <ActivityIcon className="text-white" size={28} />
                </div>

                {/* Activity Name */}
                <h4 className="text-lg font-bold text-gray-900 mb-2">{activityName}</h4>

                {/* Description */}
                {activity.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {activity.description}
                  </p>
                )}

                {/* Meta Info */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {/* Category Tag */}
                  <span
                    className={`text-xs bg-${categoryColor}-100 text-${categoryColor}-700 px-2 py-1 rounded-full font-medium`}
                  >
                    {categories.find((c) => c.id === category)?.label || 'Activity'}
                  </span>

                  {/* Duration */}
                  {activity.duration && (
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      {activity.duration}
                    </span>
                  )}

                  {/* Difficulty */}
                  {activity.difficulty && (
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                      {activity.difficulty}
                    </span>
                  )}

                  {/* Price Range */}
                  {activity.priceRange && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                      {activity.priceRange}
                    </span>
                  )}
                </div>

                {/* Best Time */}
                {activity.bestTime && (
                  <div className="mt-3 text-xs text-gray-500 flex items-center gap-1">
                    <Sun size={12} />
                    <span>Best: {activity.bestTime}</span>
                  </div>
                )}

                {/* Included/Available indicator */}
                {activity.included !== undefined && (
                  <div className="mt-3 flex items-center gap-2 text-xs">
                    {activity.included ? (
                      <CheckCircle className="text-green-600" size={16} />
                    ) : (
                      <Circle className="text-gray-400" size={16} />
                    )}
                    <span className={activity.included ? 'text-green-700' : 'text-gray-500'}>
                      {activity.included ? 'Often included in tours' : 'Available on request'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No activities found in this category.</p>
        </div>
      )}

      {/* Local Specialties */}
      {specialties.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Local Specialties
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {specialties.map((specialty, idx) => (
              <div
                key={idx}
                className="flex items-start gap-4 p-5 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-amber-500 text-white rounded-lg flex items-center justify-center text-2xl">
                  {specialty.icon || '⭐'}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-1">
                    {typeof specialty === 'string' ? specialty : specialty.name}
                  </h4>
                  {specialty.description && (
                    <p className="text-sm text-gray-700">{specialty.description}</p>
                  )}
                  {specialty.where && (
                    <p className="text-xs text-gray-500 mt-1">Where: {specialty.where}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Unique Experiences */}
      {experiences.length > 0 && (
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Unique Experiences
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiences.map((experience, idx) => (
              <div
                key={idx}
                className="relative bg-white border-2 border-purple-200 rounded-xl p-6 hover:border-purple-400 hover:shadow-xl transition-all duration-300 overflow-hidden"
              >
                {/* Award Badge */}
                <div className="absolute top-3 right-3">
                  <Award className="text-purple-500" size={24} />
                </div>

                {/* Experience Content */}
                <div className="pr-8">
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    {typeof experience === 'string' ? experience : experience.name}
                  </h4>

                  {experience.description && (
                    <p className="text-sm text-gray-600 mb-4">{experience.description}</p>
                  )}

                  {/* Tags */}
                  {experience.tags && experience.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {experience.tags.map((tag, tagIdx) => (
                        <span
                          key={tagIdx}
                          className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Why it's special */}
                  {experience.why && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-700 italic">{experience.why}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <Sparkles className="text-blue-600 flex-shrink-0 mt-1" size={24} />
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">Planning Tips</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Book adventure activities in advance during peak season</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Check weather conditions before outdoor activities</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Hire local guides for authentic cultural experiences</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Respect local customs and dress codes at religious sites</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivitiesSection;
