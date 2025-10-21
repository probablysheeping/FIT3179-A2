import { mainWorldMapSpec } from './main_world_map.js';
import { updateContinentMap, generateCableCapacityChart } from './continent_map.js';
import { DATA_URLS } from './main.js';

// Build connectivity map specification
function buildConnectivitySpec() {
  const spec = JSON.parse(JSON.stringify(mainWorldMapSpec));
  const committedParam = { name: 'sourceCommitted', value: '' };
  spec.params = [committedParam];
  
  // Keep only the world background from the base map
  if (Array.isArray(spec.layer) && spec.layer.length > 0) {
    spec.layer = [spec.layer[0]];
  } else {
    spec.layer = [];
  }
  spec.width = 800;
  spec.height = 600;
  // Add cable paths with halo effect
  spec.layer.push({
    data: { url: DATA_URLS.CABLE_PATHS, format: { type: 'json', property: 'features' } },
    transform: [ { filter: "isValid(sourceCommitted) && length(sourceCommitted) > 0 ? test(regexp(sourceCommitted,'i'), datum.properties.source) : false" } ],
    mark: { type: 'geoshape', stroke: '#ffffff', strokeWidth: 3.0, opacity: 0.30, fill: null },
    encoding: { stroke: { value: '#ffffff' } }
  });
  
  // Add colored cable paths
  spec.layer.push({
    data: { url: DATA_URLS.CABLE_PATHS, format: { type: 'json', property: 'features' } },
    transform: [ 
      { filter: "isValid(sourceCommitted) && length(sourceCommitted) > 0 ? test(regexp(sourceCommitted,'i'), datum.properties.source) : false" },
      { calculate: "format(datum.properties.latency_ms, '.1f') + ' ms'", as: 'latency_display' },
      { calculate: "format(datum.properties.cable_distance_km, '.0f') + ' km'", as: 'cable_dist_display' },
      { calculate: "format(datum.properties.straight_distance_km, '.0f') + ' km'", as: 'straight_dist_display' }
    ],
    mark: { type: 'geoshape', strokeWidth: 1.0, fill: null, opacity: 0.95 },
    encoding: {
      stroke: { field: 'properties.latency_ms', type: 'quantitative', scale: { range: ['#2c7bb6','#00a6ca','#00ccbc','#90eb9d','#f9d057','#f29e2e','#d7191c'] }, legend: null },
      order: { field: 'properties.latency_ms', sort: 'descending' },
      tooltip: [
        { field: 'properties.source', title: 'From' },
        { field: 'properties.target', title: 'To' },
        { field: 'latency_display', title: 'Latency', type: 'nominal' },
        { field: 'cable_dist_display', title: 'Distance Traveled', type: 'nominal' },
        { field: 'straight_dist_display', title: 'Straight Distance', type: 'nominal' }
      ]
    }
  });
  
  // Add destination city dots
  spec.layer.push({
    data: { url: DATA_URLS.REGION_TO_REGION_NORMALIZED },
    transform: [ 
      { filter: "isValid(sourceCommitted) && length(sourceCommitted) > 0 ? datum.source_label == sourceCommitted : false" },
      { calculate: "format(datum.latency_ms, '.1f') + ' ms'", as: 'latency_display' },
      { calculate: "format(datum.distance_km, '.0f') + ' km'", as: 'distance_display' }
    ],
    mark: { type: 'circle', filled: true, opacity: 0.95, stroke: '#000', strokeWidth: 0.4, size: 16 },
    encoding: {
      longitude: { field: 'target_lon', type: 'quantitative' },
      latitude: { field: 'target_lat', type: 'quantitative' },
      color: { field: 'latency_ms', type: 'quantitative', legend: { title: 'Latency (ms)', orient: 'right' }, scale: { range: ['#2c7bb6','#00a6ca','#00ccbc','#90eb9d','#f9d057','#f29e2e','#d7191c'] } },
      tooltip: [ 
        { field: 'target_label', title: 'Destination' }, 
        { field: 'latency_display', title: 'Latency', type: 'nominal' },
        { field: 'distance_display', title: 'Distance', type: 'nominal' }
      ]
    }
  });
  
  // Add source city as a larger black dot
  spec.layer.push({
    data: { url: DATA_URLS.REGION_TO_REGION_NORMALIZED },
    transform: [ { filter: "isValid(sourceCommitted) && length(sourceCommitted) > 0 ? datum.source_label == sourceCommitted : false" } ],
    mark: { type: 'circle', filled: true, opacity: 1.0, stroke: '#fff', strokeWidth: 1.0, size: 32 },
    encoding: {
      longitude: { field: 'source_lon', type: 'quantitative' },
      latitude: { field: 'source_lat', type: 'quantitative' },
      color: { value: '#000000' },
      tooltip: [ { field: 'source_label', title: 'Source City' } ]
    }
  });
  
  return spec;
}

// Initialize connectivity map
export async function initConnectivityMap() {
  const connectivityView = await vegaEmbed('#connectivityMap', buildConnectivitySpec());
  
  document.getElementById('connectivityButton').addEventListener('click', () => {
    const val = (document.getElementById('connectivityInput').value || '').trim();
    
    if (val) {
      // Show the hidden content sections
      document.getElementById('connectivityContent').style.display = 'grid';
      document.getElementById('bottomContent').style.display = 'grid';
    }
    
    connectivityView.view.signal('sourceCommitted', val).run();
    computeStats(val);
    updateContinentMap(val);
  });
}

// Compute statistics for the selected city
async function computeStats(sourceLabel) {
  if (!sourceLabel) {
    document.getElementById('rankLatency').textContent = '';
    document.getElementById('rankEfficiency').textContent = '';
    return;
  }
  
  const resp = await fetch(DATA_URLS.REGION_TO_REGION_NORMALIZED);
  const text = await resp.text();
  const rows = text.split('\n');
  const header = rows[0].split(',');
  const idx = Object.fromEntries(header.map((h,i)=>[h,i]));
  const get = (arr, name) => arr[idx[name]];
  const data = [];
  
  for (let i=1;i<rows.length;i++){
    const line = rows[i];
    if (!line) continue;
    const arr = [];
    let cur = '' , inq = false;
    for (const ch of line) {
      if (ch === '"') { inq = !inq; continue; }
      if (ch === ',' && !inq) { arr.push(cur); cur=''; continue; }
      cur += ch;
    }
    arr.push(cur);
    if (get(arr,'source_label') !== sourceLabel) continue;
    const latMs = parseFloat(get(arr,'latency_ms') || 'NaN');
    const distKm = parseFloat(get(arr,'distance_km') || 'NaN');
    const tgtCountry = get(arr,'target_country_code');
    
    const countryToContinent = {
      'US': 'North America', 'CA': 'North America', 'MX': 'North America',
      'GB': 'Europe', 'FR': 'Europe', 'DE': 'Europe', 'SE': 'Europe', 'NL': 'Europe', 'CH': 'Europe', 'PL': 'Europe', 'IE': 'Europe', 'IT': 'Europe', 'NO': 'Europe',
      'JP': 'Asia', 'SG': 'Asia', 'IN': 'Asia', 'CN': 'Asia', 'KR': 'Asia', 'MY': 'Asia', 'ID': 'Asia',
      'ZA': 'Africa',
      'AU': 'Oceania', 'NZ': 'Oceania',
      'BR': 'South America', 'AR': 'South America', 'CL': 'South America'
    };
    const tgtCont = countryToContinent[tgtCountry] || 'Other';
    if (!isFinite(latMs) || !isFinite(distKm)) continue;
    data.push({latMs, distKm, tgtCont});
  }
  
  // Create radar chart for average latency per continent
  const continents = ['North America', 'Europe', 'Asia', 'Africa', 'South America', 'Oceania'];
  const continentOrder = ['North America', 'Europe', 'Asia', 'Africa', 'South America', 'Oceania'];
  
  const continentAvgs = {};
  for (const cont of continentOrder) {
    const filtered = data.filter(d => d.tgtCont === cont);
    if (filtered.length > 0) {
      continentAvgs[cont] = filtered.reduce((sum, d) => sum + d.latMs, 0) / filtered.length;
    }
  }
  
  const radarData = [];
  continentOrder.forEach((cont, i) => {
    if (continentAvgs[cont] !== undefined) {
      radarData.push({ 
        continent: cont, 
        latency: continentAvgs[cont],
        order: i
      });
    }
  });
  
  // Create individual radial charts for each continent
  const continentIds = {
    'North America': 'radialNorthAmerica',
    'Europe': 'radialEurope',
    'Asia': 'radialAsia',
    'Africa': 'radialAfrica',
    'South America': 'radialSouthAmerica',
    'Oceania': 'radialOceania'
  };
  
  // Create a radial chart for each continent
  for (const continentData of radarData) {
    const elementId = continentIds[continentData.continent];
    if (!elementId) continue;
    
    const continentRadialSpec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      width: 50,
      height: 50,
      data: { values: [{...continentData, latency_display: continentData.latency.toFixed(1) + ' ms'}] },
      layer: [
        // Background circle
        {
          mark: { type: 'arc', innerRadius: 10, outerRadius: 20, theta: 6.283185307179586 },
          encoding: {
            color: { value: '#f3f4f6' }
          }
        },
        // Main latency arc
        {
          mark: { type: 'arc', innerRadius: 10, outerRadius: 20, cornerRadius: 1 },
          encoding: {
            theta: { 
              field: 'latency', 
              type: 'quantitative',
              scale: { domain: [0, 450] },
              stack: null
            },
            color: { 
              field: 'latency',
              type: 'quantitative',
              scale: {
                domain: [50, 450],
                range: ['#10b981', '#84cc16', '#eab308', '#f59e0b', '#ef4444'],
                clamp: true
              },
              legend: null
            },
            tooltip: [
              { field: 'continent', title: 'Continent' },
              { field: 'latency_display', title: 'Average Latency', type: 'nominal' }
            ]
          }
        },
        // Center text showing latency
        {
          mark: { 
            type: 'text', 
            fontSize: 9, 
            fontWeight: 700,
            color: '#1f2937'
          },
          encoding: {
            text: { value: continentData.latency.toFixed(0) }
          }
        },
        // "ms" units
        {
          mark: { 
            type: 'text', 
            fontSize: 5, 
            fontWeight: 600,
            color: '#6b7280',
            dy: 6
          },
          encoding: {
            text: { value: 'ms' }
          }
        }
      ],
      config: {
        view: { stroke: null }
      }
    };
    
    await vegaEmbed(`#${elementId}`, continentRadialSpec, { actions: false });
  }
  
  // Calculate metrics for radial chart
  const sourceAvg = new Map();
  const sourceEff = new Map();
  
  for (let i=1;i<rows.length;i++){
    const arr = [];
    let cur='',inq=false; const line = rows[i]; if(!line) continue;
    for (const ch of line){ if(ch==='"'){inq=!inq;continue;} if(ch===','&&!inq){arr.push(cur);cur='';continue;} cur+=ch; }
    arr.push(cur);
    const src = get(arr,'source_label');
    const lat = parseFloat(get(arr,'latency_ms')||'NaN');
    const dist = parseFloat(get(arr,'distance_km')||'NaN');
    
    if(!src || !isFinite(lat)) continue;
    
    // Latency
    const vLat = sourceAvg.get(src) || {sum:0,n:0}; 
    vLat.sum+=lat; vLat.n+=1; 
    sourceAvg.set(src,vLat);
    
    // Efficiency
    if(isFinite(dist) && dist > 0) {
      const eff = lat/dist;
      const vEff = sourceEff.get(src) || {sum:0,n:0}; 
      vEff.sum+=eff; vEff.n+=1; 
      sourceEff.set(src,vEff);
    }
  }
  
  // Get this city's metrics
  const cityLatency = sourceAvg.get(sourceLabel);
  const cityEfficiency = sourceEff.get(sourceLabel);
  
  if (cityLatency && cityEfficiency) {
    const avgLatency = cityLatency.sum / cityLatency.n;
    const avgEffRatio = cityEfficiency.sum / cityEfficiency.n;
    
    // Calculate ping efficiency score using formula: 1 + 9/(1 + 25*(ping/distance - 1/200))
    const pingEfficiency = 1 + 9 / (1 + 25 * (avgEffRatio - 1/200));
    
    // Create radial bar chart
    const radialData = [{
      metric: 'Performance',
      latency: avgLatency,
      efficiency: pingEfficiency,
      latency_display: avgLatency.toFixed(1) + ' ms'
    }];
    
    const radialSpec = {
      $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
      width: 140,
      height: 140,
      data: { values: radialData },
      layer: [
        // Background circle (light gray) to show max extent
        {
          mark: { type: 'arc', innerRadius: 30, outerRadius: 50, theta: 6.283185307179586 },
          encoding: {
            color: { value: '#f3f4f6' }
          }
        },
        // Main performance arc
        {
          mark: { type: 'arc', innerRadius: 30, outerRadius: 50, cornerRadius: 2 },
          encoding: {
            theta: { 
              field: 'latency', 
              type: 'quantitative',
              scale: { domain: [0, 300] },
              stack: null
            },
            color: { 
              field: 'efficiency', 
              type: 'quantitative',
              scale: { 
                domain: [1, 10],
                range: ['#ef4444', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981'],
                clamp: true
              },
              legend: {
                title: 'Ping Efficiency',
                orient: 'right',
                gradientLength: 60,
                titleFontSize: 8,
                labelFontSize: 7
              }
            },
            tooltip: [
              { field: 'latency_display', title: 'Average Latency', type: 'nominal' },
              { field: 'efficiency', title: 'Ping Efficiency', format: '.2f', type: 'quantitative' }
            ]
          }
        },
        // Center text showing latency
        {
          mark: { 
            type: 'text', 
            fontSize: 18, 
            fontWeight: 700,
            color: '#1f2937'
          },
          encoding: {
            text: { value: avgLatency.toFixed(1) }
          }
        },
        // "ms" units
        {
          mark: { 
            type: 'text', 
            fontSize: 8, 
            fontWeight: 600,
            color: '#6b7280',
            dy: 11
          },
          encoding: {
            text: { value: 'ms' }
          }
        },
        // Subtitle showing efficiency
        {
          mark: { 
            type: 'text', 
            fontSize: 7, 
            fontWeight: 600,
            color: '#4b5563',
            dy: -13
          },
          encoding: {
            text: { value: 'Efficiency: ' + pingEfficiency.toFixed(2) }
          }
        }
      ],
      config: {
        view: { stroke: null }
      }
    };
    
    await vegaEmbed('#rankLatency', radialSpec, { actions: false });
    
    // Also update the efficiency text element (if it still exists)
    const effElement = document.getElementById('rankEfficiency');
    if (effElement) {
      effElement.textContent = `Score: ${pingEfficiency.toFixed(2)}/10 (${avgEffRatio.toFixed(4)} ms/km)`;
    }
  }
}

