import React from 'react';
import {
  Info, AlertCircle, CheckCircle, Shield, Users,
  Heart, AlertTriangle, Phone, MapPin, DollarSign,
  Calendar, Clock, Briefcase, Home, Utensils
} from 'lucide-react';

/**
 * TravelTipsSection Component - Phase 4
 * Displays travel tips, safety info, and local customs
 */
const TravelTipsSection = ({ travelTips, localCustoms, safetyInfo, logistics }) => {
  if (!travelTips && !localCustoms && !safetyInfo) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Info size={48} className="mx-auto mb-4 opacity-50" />
        <p>Travel information is not available for this destination.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* General Travel Tips */}
      {travelTips && (
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Travel Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Essential Tips */}
            {travelTips.essential && travelTips.essential.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="text-blue-600" size={24} />
                  <h4 className="text-lg font-bold text-gray-900">Essential Tips</h4>
                </div>
                <ul className="space-y-3">
                  {travelTips.essential.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-blue-600 mt-1 flex-shrink-0">✓</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Packing Tips */}
            {travelTips.packing && travelTips.packing.length > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="text-purple-600" size={24} />
                  <h4 className="text-lg font-bold text-gray-900">What to Pack</h4>
                </div>
                <ul className="space-y-3">
                  {travelTips.packing.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-purple-600 mt-1 flex-shrink-0">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Money & Budget */}
            {travelTips.money && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="text-green-600" size={24} />
                  <h4 className="text-lg font-bold text-gray-900">Money Matters</h4>
                </div>
                {typeof travelTips.money === 'string' ? (
                  <p className="text-sm text-gray-700">{travelTips.money}</p>
                ) : (
                  <ul className="space-y-3">
                    {travelTips.money.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                        <span className="text-green-600 mt-1 flex-shrink-0">₹</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Best Time */}
            {travelTips.bestTime && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="text-orange-600" size={24} />
                  <h4 className="text-lg font-bold text-gray-900">Best Time Details</h4>
                </div>
                <p className="text-sm text-gray-700">{travelTips.bestTime}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Local Customs & Etiquette */}
      {localCustoms && (
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Local Customs & Etiquette
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dos */}
            {localCustoms.dos && localCustoms.dos.length > 0 && (
              <div className="bg-white border-2 border-green-300 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="text-green-600" size={24} />
                  <h4 className="text-lg font-bold text-gray-900">Do's</h4>
                </div>
                <ul className="space-y-3">
                  {localCustoms.dos.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mt-0.5">
                        <CheckCircle className="text-green-600" size={16} />
                      </div>
                      <span className="text-sm text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Don'ts */}
            {localCustoms.donts && localCustoms.donts.length > 0 && (
              <div className="bg-white border-2 border-red-300 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="text-red-600" size={24} />
                  <h4 className="text-lg font-bold text-gray-900">Don'ts</h4>
                </div>
                <ul className="space-y-3">
                  {localCustoms.donts.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mt-0.5">
                        <AlertCircle className="text-red-600" size={16} />
                      </div>
                      <span className="text-sm text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Dress Code */}
            {localCustoms.dressCode && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="text-purple-600" size={24} />
                  <h4 className="text-lg font-bold text-gray-900">Dress Code</h4>
                </div>
                <p className="text-sm text-gray-700">{localCustoms.dressCode}</p>
              </div>
            )}

            {/* Language Tips */}
            {localCustoms.language && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Info className="text-blue-600" size={24} />
                  <h4 className="text-lg font-bold text-gray-900">Language</h4>
                </div>
                <p className="text-sm text-gray-700 mb-3">{localCustoms.language}</p>
                {localCustoms.usefulPhrases && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-600">Useful Phrases:</p>
                    {localCustoms.usefulPhrases.map((phrase, idx) => (
                      <div key={idx} className="text-xs bg-white px-3 py-2 rounded">
                        <span className="font-semibold">{phrase.phrase}:</span>{' '}
                        <span className="text-gray-600">{phrase.translation}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Cultural Practices */}
            {localCustoms.practices && localCustoms.practices.length > 0 && (
              <div className="md:col-span-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="text-amber-600" size={24} />
                  <h4 className="text-lg font-bold text-gray-900">Cultural Practices</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {localCustoms.practices.map((practice, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-amber-600 mt-1">•</span>
                      <span className="text-sm text-gray-700">{practice}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Safety Information */}
      {safetyInfo && (
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Safety & Health
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* General Safety */}
            {safetyInfo.general && safetyInfo.general.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="text-yellow-600" size={24} />
                  <h4 className="text-lg font-bold text-gray-900">Safety Tips</h4>
                </div>
                <ul className="space-y-3">
                  {safetyInfo.general.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-yellow-600 mt-1">⚠</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Health Precautions */}
            {safetyInfo.health && safetyInfo.health.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Heart className="text-red-600" size={24} />
                  <h4 className="text-lg font-bold text-gray-900">Health Precautions</h4>
                </div>
                <ul className="space-y-3">
                  {safetyInfo.health.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-red-600 mt-1">+</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Emergency Contacts */}
            {safetyInfo.emergencyContacts && (
              <div className="md:col-span-2 bg-gray-900 text-white rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Phone className="text-white" size={24} />
                  <h4 className="text-lg font-bold">Emergency Contacts</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {safetyInfo.emergencyContacts.police && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Police</div>
                      <div className="text-xl font-bold">{safetyInfo.emergencyContacts.police}</div>
                    </div>
                  )}
                  {safetyInfo.emergencyContacts.ambulance && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Ambulance</div>
                      <div className="text-xl font-bold">{safetyInfo.emergencyContacts.ambulance}</div>
                    </div>
                  )}
                  {safetyInfo.emergencyContacts.fire && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Fire</div>
                      <div className="text-xl font-bold">{safetyInfo.emergencyContacts.fire}</div>
                    </div>
                  )}
                  {safetyInfo.emergencyContacts.tourist && (
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Tourist Helpline</div>
                      <div className="text-xl font-bold">{safetyInfo.emergencyContacts.tourist}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Warnings */}
            {safetyInfo.warnings && safetyInfo.warnings.length > 0 && (
              <div className="md:col-span-2 bg-orange-100 border-2 border-orange-400 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="text-orange-600" size={24} />
                  <h4 className="text-lg font-bold text-gray-900">Important Warnings</h4>
                </div>
                <ul className="space-y-3">
                  {safetyInfo.warnings.map((warning, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <AlertTriangle className="text-orange-600 flex-shrink-0 mt-1" size={20} />
                      <span className="text-sm text-gray-800 font-medium">{warning}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Additional Logistics Info */}
      {logistics && (logistics.visa || logistics.currency || logistics.connectivity) && (
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Practical Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {logistics.visa && (
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="text-gray-600" size={20} />
                  <h5 className="font-bold text-gray-900">Visa Requirements</h5>
                </div>
                <p className="text-sm text-gray-700">{logistics.visa}</p>
              </div>
            )}

            {logistics.currency && (
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <DollarSign className="text-gray-600" size={20} />
                  <h5 className="font-bold text-gray-900">Currency</h5>
                </div>
                <p className="text-sm text-gray-700">{logistics.currency}</p>
              </div>
            )}

            {logistics.connectivity && (
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Phone className="text-gray-600" size={20} />
                  <h5 className="font-bold text-gray-900">Connectivity</h5>
                </div>
                <p className="text-sm text-gray-700">{logistics.connectivity}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelTipsSection;
