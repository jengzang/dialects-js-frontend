import { GET_LOCS_EXPLICIT_LOCATIONS_LIMIT } from '../config/constants.js';

export function buildExplicitLocationsForGetLocs({
  locations = [],
  customRegionLocations = [],
} = {}) {
  return [...new Set([...(locations || []), ...(customRegionLocations || [])].filter(Boolean))];
}

export function isExplicitLocationsLimitExceeded(
  explicitLocations,
  limit = GET_LOCS_EXPLICIT_LOCATIONS_LIMIT,
) {
  return (explicitLocations || []).length > limit;
}
