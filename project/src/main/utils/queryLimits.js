import { GET_LOCS_EXPLICIT_LOCATIONS_LIMIT } from '../config/constants.js';

const WHITESPACE_RE = /\s/u;

export function limitEffectiveChars(input, limit = 10) {
  const chars = Array.from(input ?? '');
  let effectiveCount = 0;
  let cutoffIndex = -1;

  for (let index = 0; index < chars.length; index += 1) {
    const char = chars[index];
    if (WHITESPACE_RE.test(char)) {
      continue;
    }

    effectiveCount += 1;
    if (effectiveCount === limit) {
      cutoffIndex = index;
      break;
    }
  }

  if (cutoffIndex === -1) {
    return {
      value: chars.join(''),
      effectiveCount,
      hasExtraEffectiveChars: false,
      wasTrimmedAfterLimit: false,
    };
  }

  const remainingChars = chars.slice(cutoffIndex + 1);

  return {
    value: chars.slice(0, cutoffIndex + 1).join(''),
    effectiveCount: limit,
    hasExtraEffectiveChars: remainingChars.some((char) => !WHITESPACE_RE.test(char)),
    wasTrimmedAfterLimit: remainingChars.length > 0,
  };
}

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
