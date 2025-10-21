import { mainWorldMapSpec } from './main_world_map.js';
import { scatterDistanceLatencySpec } from './scatter_distance_latency.js';
import { initConnectivityMap } from './connectivity_map.js';
import { initVulnerabilityMap } from './vulnerability_map.js';

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

