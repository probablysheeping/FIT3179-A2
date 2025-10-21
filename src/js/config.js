// ============================================================================
// DATA URL CONFIGURATION
// ============================================================================
// All data file URLs are defined here for easy updates (e.g., switching to CDN)

// Using jsDelivr CDN for faster loading (caches GitHub files globally)
const CDN_BASE_URL = 'https://cdn.jsdelivr.net/gh/probablysheeping/FIT3179-A2@main/';

export const DATA_URLS = {
  // Raw data
  SUBMARINE_CABLES: CDN_BASE_URL + 'data/raw/submarine_cables_2d.geojson',
  PINGS_RAW: CDN_BASE_URL + 'data/raw/pings-2020-07-19-2020-07-20.csv',
  
  // Processed data
  REGION_TO_REGION_NORMALIZED: CDN_BASE_URL + 'data/processed/region_to_region_normalized.csv',
  REGION_TO_REGION_BIDIRECTIONAL: CDN_BASE_URL + 'data/processed/region_to_region_bidirectional.csv',
  ALL_CABLE_COUNTRIES: CDN_BASE_URL + 'data/processed/all_cable_countries.json',
  COUNTRY_CABLE_BREAKDOWN: CDN_BASE_URL + 'data/processed/country_cable_breakdown.json',
  COUNTRY_CAPACITY_COMPARISON: CDN_BASE_URL + 'data/processed/country_capacity_comparison.json',
  
  // Output data
  CABLE_PATHS: CDN_BASE_URL + 'data/output/cable_paths.geojson',
  CABLE_PATH_SEGMENTS: CDN_BASE_URL + 'data/output/cable_path_segments.csv'
};

