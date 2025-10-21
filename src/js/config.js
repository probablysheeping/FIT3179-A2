// ============================================================================
// DATA URL CONFIGURATION
// ============================================================================
// All data file URLs are defined here for easy updates (e.g., switching to CDN)

// For large files (stored in Git LFS)
const LFS_BASE_URL = 'https://media.githubusercontent.com/media/probablysheeping/FIT3179-A2/refs/heads/main/';
// For regular files
const RAW_BASE_URL = 'https://raw.githubusercontent.com/probablysheeping/FIT3179-A2/main/';

export const DATA_URLS = {
  // Raw data (LFS)
  SUBMARINE_CABLES: LFS_BASE_URL + 'data/raw/submarine_cables_2d.geojson',
  PINGS_RAW: LFS_BASE_URL + 'data/raw/pings-2020-07-19-2020-07-20.csv',
  
  // Processed data (LFS for large files, raw for small files)
  REGION_TO_REGION_NORMALIZED: LFS_BASE_URL + 'data/processed/region_to_region_normalized.csv',
  REGION_TO_REGION_BIDIRECTIONAL: LFS_BASE_URL + 'data/processed/region_to_region_bidirectional.csv',
  ALL_CABLE_COUNTRIES: RAW_BASE_URL + 'data/processed/all_cable_countries.json',
  COUNTRY_CABLE_BREAKDOWN: RAW_BASE_URL + 'data/processed/country_cable_breakdown.json',
  COUNTRY_CAPACITY_COMPARISON: RAW_BASE_URL + 'data/processed/country_capacity_comparison.json',
  
  // Output data (LFS)
  CABLE_PATHS: LFS_BASE_URL + 'data/output/cable_paths.geojson',
  CABLE_PATH_SEGMENTS: LFS_BASE_URL + 'data/output/cable_path_segments.csv'
};

