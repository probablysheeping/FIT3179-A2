import { mainWorldMapSpec } from './main_world_map.js';
import { scatterDistanceLatencySpec } from './scatter_distance_latency.js';
import { initConnectivityMap } from './connectivity_map.js';
import { initVulnerabilityMap } from './vulnerability_map.js';

// ============================================================================
// DATA URL CONFIGURATION
// ============================================================================
// All data file URLs are defined here for easy updates (e.g., switching to CDN)

export const DATA_URLS = {
  // Raw data
  SUBMARINE_CABLES: 'data/raw/submarine_cables_2d.geojson',
  PINGS_RAW: 'data/raw/pings-2020-07-19-2020-07-20.csv',
  
  // Processed data
  REGION_TO_REGION_NORMALIZED: 'data/processed/region_to_region_normalized.csv',
  REGION_TO_REGION_BIDIRECTIONAL: 'data/processed/region_to_region_bidirectional.csv',
  ALL_CABLE_COUNTRIES: 'data/processed/all_cable_countries.json',
  COUNTRY_CABLE_BREAKDOWN: 'data/processed/country_cable_breakdown.json',
  COUNTRY_CAPACITY_COMPARISON: 'data/processed/country_capacity_comparison.json',
  
  // Output data
  CABLE_PATHS: 'data/output/cable_paths.geojson',
  CABLE_PATH_SEGMENTS: 'data/output/cable_path_segments.csv'
};

// ============================================================================

// Initialize everything when the page loads
async function init() {
  // Set up scatter spec
  scatterDistanceLatencySpec.params = [];

  // Embed main visualizations
  const mapView = await vegaEmbed('#mapVis', mainWorldMapSpec);
  const scatterView = await vegaEmbed('#scatterVis', scatterDistanceLatencySpec);

  // Load city datalist options
  try {
    const resp = await fetch('city_options.html');
    if (resp.ok) {
      const html = await resp.text();
      document.getElementById('cityOptions').innerHTML = html;
    }
  } catch (e) {
    console.log('City options not loaded');
  }

  // Reset button
  const resetBtn = document.getElementById('resetBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      // Refresh the page to reset all visualizations
      window.location.reload();
    });
  }

  // Initialize connectivity map
  await initConnectivityMap();
  
  // Initialize vulnerability heatmap
  await initVulnerabilityMap();
}

// Initialize and run
init();

