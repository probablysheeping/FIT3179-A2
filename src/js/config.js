// ============================================================================
// DATA URL CONFIGURATION
// ============================================================================
// All data file URLs are defined here for easy updates (e.g., switching to CDN)

// GitHub LFS files must use media.githubusercontent.com
const LFS_URL = 'https://media.githubusercontent.com/media/probablysheeping/FIT3179-A2/main/';
// Small files can use raw.githubusercontent.com
const RAW_URL = 'https://raw.githubusercontent.com/probablysheeping/FIT3179-A2/main/';

export const DATA_URLS = {
  // Raw data (all LFS files)
  SUBMARINE_CABLES: LFS_URL + 'data/raw/submarine_cables_2d.geojson',
  PINGS_RAW: LFS_URL + 'data/raw/pings-2020-07-19-2020-07-20.csv',
  
  // Processed data (all LFS files)
  REGION_TO_REGION_NORMALIZED: LFS_URL + 'data/processed/region_to_region_normalized.csv',
  REGION_TO_REGION_BIDIRECTIONAL: LFS_URL + 'data/processed/region_to_region_bidirectional.csv',
  ALL_CABLE_COUNTRIES: RAW_URL + 'data/processed/all_cable_countries.json',
  COUNTRY_CABLE_BREAKDOWN: RAW_URL + 'data/processed/country_cable_breakdown.json',
  COUNTRY_CAPACITY_COMPARISON: RAW_URL + 'data/processed/country_capacity_comparison.json',
  
  // Output data (all LFS files)
  CABLE_PATHS: LFS_URL + 'data/output/cable_paths.geojson',
  CABLE_PATH_SEGMENTS: LFS_URL + 'data/output/cable_path_segments.csv'
};

