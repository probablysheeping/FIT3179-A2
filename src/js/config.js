// ============================================================================
// DATA URL CONFIGURATION
// ============================================================================
// All data file URLs are defined here for easy updates (e.g., switching to CDN)

// jsDelivr CDN for small files (<50MB) - faster with global caching
const CDN_BASE_URL = 'https://cdn.jsdelivr.net/gh/probablysheeping/FIT3179-A2@main/';
// GitHub LFS for large files (>50MB) - jsDelivr has 50MB limit
const LFS_BASE_URL = 'https://media.githubusercontent.com/media/probablysheeping/FIT3179-A2/refs/heads/main/';

export const DATA_URLS = {
  // Raw data - use CDN for small files, LFS for large
  SUBMARINE_CABLES: CDN_BASE_URL + 'data/raw/submarine_cables_2d.geojson', // 1.9MB - OK for CDN
  PINGS_RAW: LFS_BASE_URL + 'data/raw/pings-2020-07-19-2020-07-20.csv', // 207MB - too big for CDN
  
  // Processed data - mostly small enough for CDN
  REGION_TO_REGION_NORMALIZED: CDN_BASE_URL + 'data/processed/region_to_region_normalized.csv', // 9.5MB - OK
  REGION_TO_REGION_BIDIRECTIONAL: CDN_BASE_URL + 'data/processed/region_to_region_bidirectional.csv', // 20MB - OK
  ALL_CABLE_COUNTRIES: CDN_BASE_URL + 'data/processed/all_cable_countries.json', // Small - OK
  COUNTRY_CABLE_BREAKDOWN: CDN_BASE_URL + 'data/processed/country_cable_breakdown.json', // Small - OK
  COUNTRY_CAPACITY_COMPARISON: CDN_BASE_URL + 'data/processed/country_capacity_comparison.json', // Small - OK
  
  // Output data - large files use LFS
  CABLE_PATHS: LFS_BASE_URL + 'data/output/cable_paths.geojson', // 95MB - too big for CDN
  CABLE_PATH_SEGMENTS: LFS_BASE_URL + 'data/output/cable_path_segments.csv' // 172MB - too big for CDN
};

