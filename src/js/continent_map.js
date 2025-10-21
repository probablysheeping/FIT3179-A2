// Auto-generated country bounds
function getCountryBounds(countryCode) {
  // Handle country code aliases/variations
  const aliases = {
    'KZ': 'KA'  // Kazakhstan label vs country code mismatch
  };
  
  // Use alias if exists
  const lookupCode = aliases[countryCode] || countryCode;
  
  const bounds = {
    'AE': { center: [55.19, 24.88], scale: 2000, name: 'AE' },
    'AL': { center: [19.82, 41.33], scale: 3000, name: 'AL' },
    'AR': { center: [-58.38, -34.6], scale: 3000, name: 'AR' },
    'AT': { center: [15.91, 47.64], scale: 2000, name: 'AT' },
    'AU': { center: [142.38, -33.63], scale: 400, name: 'AU' },
    'BD': { center: [90.38, 23.7], scale: 3000, name: 'BD' },
    'BE': { center: [4.39, 50.98], scale: 2000, name: 'BE' },
    'BG': { center: [25.62, 42.96], scale: 2000, name: 'BG' },
    'BR': { center: [-43.26, -15.8], scale: 600, name: 'BR' },
    'CA': { center: [-69.97, 44.26], scale: 400, name: 'CA' },
    'CH': { center: [7.53, 46.77], scale: 2000, name: 'CH' },
    'CL': { center: [-71.54, -33.03], scale: 3000, name: 'CL' },
    'CN': { center: [116.86, 29.16], scale: 600, name: 'CN' },
    'CO': { center: [-77.92, 6.95], scale: 1000, name: 'CO' },
    'CR': { center: [15.98, 45.82], scale: 3000, name: 'CR' },
    'CY': { center: [33.03, 34.67], scale: 3000, name: 'CY' },
    'CZ': { center: [15.05, 49.4], scale: 2000, name: 'CZ' },
    'DE': { center: [10.16, 50.55], scale: 1500, name: 'DE' },
    'DK': { center: [12.57, 55.67], scale: 3000, name: 'DK' },
    'DZ': { center: [3.06, 36.75], scale: 3000, name: 'DZ' },
    'EC': { center: [-78.47, -0.18], scale: 3000, name: 'EC' },
    'EG': { center: [31.23, 30.06], scale: 3000, name: 'EG' },
    'ES': { center: [5.72, 45.17], scale: 400, name: 'ES' },
    'FI': { center: [24.66, 60.21], scale: 3000, name: 'FI' },
    'FR': { center: [4.51, 48.26], scale: 1000, name: 'FR' },
    'GB': { center: [-2.08, 52.7], scale: 1500, name: 'GB' },
    'GE': { center: [44.83, 41.71], scale: 3000, name: 'GE' },
    'GH': { center: [-0.19, 5.6], scale: 3000, name: 'GH' },
    'GR': { center: [23.31, 39.31], scale: 2000, name: 'GR' },
    'GU': { center: [-79.5, 9.0], scale: 3000, name: 'GU' },
    'HO': { center: [-86.79, 15.77], scale: 3000, name: 'HO' },
    'HU': { center: [19.05, 47.5], scale: 3000, name: 'HU' },
    'IC': { center: [-21.93, 64.13], scale: 3000, name: 'IC' },
    'ID': { center: [106.75, -6.13], scale: 3000, name: 'ID' },
    'IE': { center: [-6.72, 53.07], scale: 2000, name: 'IE' },
    'IL': { center: [35.03, 31.83], scale: 2000, name: 'IL' },
    'IN': { center: [77.09, 18.8], scale: 600, name: 'IN' },
    'IS': { center: [-4.49, 54.15], scale: 3000, name: 'IS' },
    'IT': { center: [12.14, 42.75], scale: 1000, name: 'IT' },
    'JP': { center: [139.05, 37.2], scale: 1000, name: 'JP' },
    'KA': { center: [73.17, 49.83], scale: 3000, name: 'KZ' },
    'KE': { center: [36.82, -1.28], scale: 3000, name: 'KE' },
    'KO': { center: [21.17, 42.67], scale: 3000, name: 'KO' },
    'KR': { center: [127.29, 37.22], scale: 1500, name: 'KR' },
    'LA': { center: [24.11, 56.95], scale: 3000, name: 'LA' },
    'LE': { center: [35.47, 33.89], scale: 3000, name: 'LE' },
    'LI': { center: [24.3, 55.31], scale: 2000, name: 'LI' },
    'LU': { center: [6.12, 49.68], scale: 3000, name: 'LU' },
    'MA': { center: [4.76, 34.97], scale: 1000, name: 'MA' },
    'MO': { center: [28.92, 47.0], scale: 3000, name: 'MO' },
    'MX': { center: [-99.52, 18.77], scale: 400, name: 'MX' },
    'MY': { center: [101.69, 3.14], scale: 3000, name: 'MY' },
    'NG': { center: [3.38, 6.52], scale: 3000, name: 'NG' },
    'NL': { center: [5.1, 52.22], scale: 2000, name: 'NL' },
    'NO': { center: [8.11, 60.25], scale: 2000, name: 'NO' },
    'NZ': { center: [174.06, -40.44], scale: 1500, name: 'NZ' },
    'PA': { center: [-90.52, 14.63], scale: 3000, name: 'PA' },
    'PE': { center: [-77.03, -12.04], scale: 3000, name: 'PE' },
    'PH': { center: [120.65, 15.31], scale: 2000, name: 'PH' },
    'PK': { center: [74.34, 31.55], scale: 3000, name: 'PK' },
    'PL': { center: [19.87, 53.25], scale: 2000, name: 'PL' },
    'PT': { center: [-9.18, 38.7], scale: 3000, name: 'PT' },
    'PU': { center: [-66.07, 18.45], scale: 3000, name: 'PU' },
    'QA': { center: [51.53, 25.29], scale: 3000, name: 'QA' },
    'RO': { center: [26.1, 44.42], scale: 3000, name: 'RO' },
    'RU': { center: [66.4, 53.94], scale: 400, name: 'RU' },
    'SA': { center: [46.72, 24.63], scale: 3000, name: 'SA' },
    'SE': { center: [17.31, 53.86], scale: 600, name: 'SE' },
    'SG': { center: [103.75, 1.37], scale: 3000, name: 'SG' },
    'SL': { center: [15.81, 47.1], scale: 2000, name: 'SL' },
    'SU': { center: [-55.2, 5.85], scale: 3000, name: 'SU' },
    'TH': { center: [100.48, 13.75], scale: 3000, name: 'TH' },
    'TN': { center: [9.54, 33.89], scale: 3000, name: 'TN' },
    'TR': { center: [29.51, 39.89], scale: 1500, name: 'TR' },
    'TW': { center: [121.53, 25.03], scale: 3000, name: 'TW' },
    'TZ': { center: [39.28, -6.8], scale: 3000, name: 'TZ' },
    'UA': { center: [30.52, 50.45], scale: 3000, name: 'UA' },
    'UG': { center: [32.58, 0.31], scale: 3000, name: 'UG' },
    'UR': { center: [-55.95, -34.72], scale: 3000, name: 'UR' },
    'US': { center: [-92.6, 37.9], scale: 400, name: 'US' },
    'VE': { center: [-66.9, 10.48], scale: 3000, name: 'VE' },
    'VN': { center: [106.21, 15.93], scale: 1000, name: 'VN' },
    'ZA': { center: [23.24, -30.09], scale: 1000, name: 'ZA' },
  };
  return bounds[lookupCode] || { center: [0, 20], scale: 300, name: 'World' };
}

// Build country-specific map specification
function buildContinentMapSpec(countryCode, countryName, sourceLabel = null) {
  const bounds = getCountryBounds(countryCode);
  
  // For landlocked countries, zoom out more to show regional submarine cables
  const landlocked = ['KA', 'KZ', 'UG', 'UA', 'HU', 'AT', 'CH', 'CZ', 'SL', 'MO'];
  const scale = landlocked.includes(countryCode) ? Math.min(bounds.scale, 600) : bounds.scale;
  
  // Country code to TopoJSON name mapping
  const countryCodeToName = {
    'AU': 'Australia', 'US': 'United States of America', 'CA': 'Canada', 'BR': 'Brazil',
    'MX': 'Mexico', 'FR': 'France', 'CH': 'Switzerland', 'NL': 'Netherlands', 'DE': 'Germany',
    'IT': 'Italy', 'PL': 'Poland', 'NO': 'Norway', 'SE': 'Sweden', 'IE': 'Ireland',
    'GB': 'United Kingdom', 'NZ': 'New Zealand', 'JP': 'Japan', 'KR': 'South Korea',
    'IN': 'India', 'CN': 'China', 'MY': 'Malaysia', 'SG': 'Singapore', 'IL': 'Israel',
    'QA': 'Qatar', 'AE': 'United Arab Emirates', 'ZA': 'South Africa', 'ID': 'Indonesia',
    'GH': 'Ghana', 'CZ': 'Czechia', 'RU': 'Russia', 'ES': 'Spain', 'AT': 'Austria',
    'DK': 'Denmark', 'SL': 'Slovenia', 'UA': 'Ukraine', 'BE': 'Belgium', 'PT': 'Portugal',
    'FI': 'Finland', 'HU': 'Hungary', 'CO': 'Colombia', 'AR': 'Argentina', 'TH': 'Thailand',
    'TR': 'Turkey', 'RO': 'Romania', 'BG': 'Bulgaria', 'CL': 'Chile', 'KA': 'Kazakhstan'
  };
  
  const topoCountryName = countryCodeToName[countryCode] || countryName;
  
  return {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: 650,
    height: 260,
    projection: {
      type: 'mercator',
      center: bounds.center,
      scale: scale * 0.75
    },
    layer: [
      // Base world map
      {
        data: { url: 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json', format: { type: 'topojson', feature: 'countries' } },
        mark: { type: 'geoshape', fill: '#e0e0e0', stroke: '#999', strokeWidth: 0.5 }
      },
      // Highlighted origin country
      {
        data: { url: 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json', format: { type: 'topojson', feature: 'countries' } },
        transform: [
          { filter: `datum.properties.name == '${topoCountryName}'` }
        ],
        mark: { type: 'geoshape', fill: '#dbeafe', stroke: '#3b82f6', strokeWidth: 1.5, opacity: 0.6 }
      },
      {
        data: { url: 'data/raw/submarine_cables_2d.geojson', format: { type: 'json', property: 'features' } },
        transform: [
          {
            calculate: "datum.properties.name || 'Unknown Cable'",
            as: "cable_name"
          },
          {
            calculate: "datum.properties.rfs || 'Unknown'",
            as: "rfs_date"
          },
          {
            calculate: "datum.properties.length || 'Unknown'",
            as: "cable_length"
          },
          {
            calculate: "datum.properties.owners || 'Unknown'",
            as: "cable_owners"
          },
          {
            calculate: "datum.properties.rfs ? toNumber(substring(datum.properties.rfs, length(datum.properties.rfs) - 4)) : 1990",
            as: "build_year"
          },
          {
            calculate: "datum.build_year < 2000 ? 'Pre-2000: <1 Tbps (Early Fiber)' : datum.build_year < 2010 ? '2000-2009: ~5 Tbps (DWDM Era)' : datum.build_year < 2020 ? '2010-2019: ~50 Tbps (Coherent Systems)' : '2020+: 300+ Tbps (Modern Ultra-High Capacity)'",
            as: "capacity_era"
          }
        ],
        mark: { type: 'geoshape', strokeWidth: 1, fill: null, opacity: 0.75 },
        encoding: {
          stroke: {
            field: 'capacity_era',
            type: 'nominal',
            scale: {
              domain: [
                'Pre-2000: <1 Tbps (Early Fiber)',
                '2000-2009: ~5 Tbps (DWDM Era)',
                '2010-2019: ~50 Tbps (Coherent Systems)',
                '2020+: 300+ Tbps (Modern Ultra-High Capacity)'
              ],
              range: ['#440154', '#31688e', '#35b779', '#fde724']
            },
            legend: null
          },
          tooltip: [
            { field: 'cable_name', title: 'Cable Name', type: 'nominal' },
            { field: 'capacity_era', title: 'Capacity Era', type: 'nominal' },
            { field: 'rfs_date', title: 'Ready for Service', type: 'nominal' },
            { field: 'cable_length', title: 'Length', type: 'nominal' },
            { field: 'cable_owners', title: 'Owners', type: 'nominal' }
          ]
        }
      },
      // Cities in the country
      {
        data: { url: 'data/processed/region_to_region_normalized.csv' },
        transform: [
          { fold: ['source_label', 'target_label'] },
          { calculate: 'datum.key == "source_label" ? datum.source_country_code : datum.target_country_code', as: 'country_code' },
          { calculate: 'datum.key == "source_label" ? datum.source_lat : datum.target_lat', as: 'lat' },
          { calculate: 'datum.key == "source_label" ? datum.source_lon : datum.target_lon', as: 'lon' },
          { calculate: 'datum.value', as: 'city' },
          { filter: `datum.country_code == '${countryCode}'` },
          { aggregate: [{ op: 'count', as: 'count' }], groupby: ['city', 'lat', 'lon'] }
        ],
        mark: { type: 'circle', size: 60, opacity: 0.9, stroke: '#1f2937', strokeWidth: 1 },
        encoding: {
          longitude: { field: 'lon', type: 'quantitative' },
          latitude: { field: 'lat', type: 'quantitative' },
          color: { value: '#ef4444' },
          tooltip: [
            { field: 'city', title: 'City', type: 'nominal' }
          ]
        }
      }
    ]
  };
}

// Update continent map based on source city
async function updateContinentMap(sourceLabel) {
  if (!sourceLabel) return;
  
  const csvResp = await fetch('data/processed/region_to_region_normalized.csv');
  const csvText = await csvResp.text();
  const rows = csvText.split('\n');
  
  let countryCode = 'US'; // default
  let countryName = 'United States';
  
  // Parse CSV properly handling quoted fields
  const parseCSVRow = (row) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < row.length; i++) {
      const char = row[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  };
  
  // Find the country code for the source city
  // Columns: 0:source_region, 1:target_region, 2:latency_ms, 3:source_city, 4:source_lat, 5:source_lon, 
  //          6:target_city, 7:target_lat, 8:target_lon, 9:distance_km, 10:source_country, 11:target_country,
  //          12:source_label, 13:target_label, 14:source_country_code, 15:target_country_code
  for (let i = 1; i < rows.length; i++) {
    if (!rows[i]) continue;
    const cells = parseCSVRow(rows[i]);
    
    if (cells[12] === sourceLabel) {
      // Source matches - get source country code (column 14)
      countryCode = cells[14];
      // Extract country name from label (after comma)
      const labelParts = sourceLabel.split(',');
      countryName = labelParts.length > 1 ? labelParts[1].trim() : countryCode;
      break;
    } else if (cells[13] === sourceLabel) {
      // Target matches - get target country code (column 15)
      countryCode = cells[15];
      const labelParts = sourceLabel.split(',');
      countryName = labelParts.length > 1 ? labelParts[1].trim() : countryCode;
      break;
    }
  }
  
  const spec = buildContinentMapSpec(countryCode, countryName, sourceLabel);
  
  // Update the title with country name
  const bounds = getCountryBounds(countryCode);
  const titleElement = document.getElementById('continentMapTitle');
  
  // List of landlocked countries that have no direct submarine cable access
  const landlocked = ['KA', 'KZ', 'UG', 'UA', 'HU', 'AT', 'CH', 'CZ', 'SL', 'MO'];
  
  if (titleElement) {
    if (landlocked.includes(countryCode)) {
      titleElement.textContent = `${bounds.name} – Regional Submarine Cables`;
      titleElement.title = 'This country is landlocked. Data routes through neighboring countries\' submarine cables.';
    } else {
      titleElement.textContent = `${bounds.name} – Submarine Cables`;
    }
  }
  
  // Calculate and display cable dependency metric
  await calculateCableDependency(sourceLabel);
  
  // Calculate country cable count
  await calculateCountryCableCount(sourceLabel, countryCode);
  
  // Generate cable capacity chart
  await generateCableCapacityChart(countryCode);
  
  await vegaEmbed('#continentMapVis', spec, { actions: false });
}

// Calculate how many unique submarine cables a city's routes pass through
async function calculateCableDependency(sourceLabel) {
  if (!sourceLabel) return;
  
  try {
    // Load submarine cables to build a spatial index
    const cableResp = await fetch('data/raw/submarine_cables_2d.geojson');
    const cableData = await cableResp.json();
    
    // Load cable paths for this source
    const pathsResp = await fetch('data/output/cable_paths.geojson');
    const pathsData = await pathsResp.json();
    
    // Get all paths from this source
    const sourcePaths = pathsData.features.filter(f => 
      f.properties.source && f.properties.source.includes(sourceLabel.split(',')[0])
    );
    
    // For each path, check which cables it passes near
    const cablesUsed = new Set();
    const threshold = 50; // km
    
    for (const path of sourcePaths) {
      const pathCoords = path.geometry.coordinates;
      
      // Check middle 80% of path (skip first/last 10% which are likely inland)
      const start = Math.floor(pathCoords.length * 0.1);
      const end = Math.floor(pathCoords.length * 0.9);
      
      for (let i = start; i < end; i += 5) {  // Sample every 5th point for speed
        const [pLon, pLat] = pathCoords[i];
        
        // Check against each cable
        for (const cable of cableData.features) {
          if (cable.geometry.type !== 'LineString') continue;
          
          const cableName = cable.properties.name || 'Unknown';
          if (cablesUsed.has(cableName)) continue;  // Already found
          
          // Check if any cable point is within threshold
          for (const [cLon, cLat] of cable.geometry.coordinates) {
            const dist = haversineSimple(pLon, pLat, cLon, cLat);
            if (dist < threshold) {
              cablesUsed.add(cableName);
              break;
            }
          }
        }
      }
    }
    
    // Display the result
    const depElement = document.getElementById('cableDependencyCount');
    if (depElement) {
      depElement.textContent = cablesUsed.size;
    }
    
    console.log(`${sourceLabel} depends on ${cablesUsed.size} submarine cables`);
    
  } catch (e) {
    console.error('Error calculating cable dependency:', e);
  }
}

// Simple haversine for distance calculation
function haversineSimple(lon1, lat1, lon2, lat2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Calculate how many submarine cables land in a country
async function calculateCountryCableCount(sourceLabel, countryCode) {
  if (!sourceLabel || !countryCode) return;
  
  try {
    // Load submarine cables
    const cableResp = await fetch('data/raw/submarine_cables_2d.geojson');
    const cableData = await cableResp.json();
    
    // Load city data to get all cities in this country
    const csvResp = await fetch('data/processed/region_to_region_normalized.csv');
    const csvText = await csvResp.text();
    const rows = csvText.split('\n');
    
    // Parse CSV to find all cities in this country
    const parseCSVRow = (row) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < row.length; i++) {
        const char = row[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          result.push(current);
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current);
      return result;
    };
    
    const citiesInCountry = [];
    for (let i = 1; i < rows.length; i++) {
      if (!rows[i]) continue;
      const cells = parseCSVRow(rows[i]);
      if (cells.length < 15) continue;
      
      // Check source
      if (cells[14] === countryCode) {
        citiesInCountry.push({
          label: cells[12],
          lat: parseFloat(cells[4]),
          lon: parseFloat(cells[5])
        });
      }
      // Check target
      if (cells[15] === countryCode) {
        citiesInCountry.push({
          label: cells[13],
          lat: parseFloat(cells[7]),
          lon: parseFloat(cells[8])
        });
      }
    }
    
    // Remove duplicates
    const uniqueCities = [];
    const seen = new Set();
    for (const city of citiesInCountry) {
      if (!seen.has(city.label)) {
        seen.add(city.label);
        uniqueCities.push(city);
      }
    }
    
    // Check which cables have endpoints near cities in this country
    const cablesInCountry = new Set();
    const threshold = 200; // 200km from a city = cable landing point
    
    for (const cable of cableData.features) {
      if (cable.geometry.type !== 'LineString') continue;
      
      const cableName = cable.properties.name || 'Unknown';
      const coords = cable.geometry.coordinates;
      
      // Check first and last 5 points of cable (landing points)
      const checkPoints = [
        ...coords.slice(0, Math.min(5, coords.length)),
        ...coords.slice(Math.max(0, coords.length - 5))
      ];
      
      for (const [cLon, cLat] of checkPoints) {
        for (const city of uniqueCities) {
          const dist = haversineSimple(cLon, cLat, city.lon, city.lat);
          if (dist < threshold) {
            cablesInCountry.add(cableName);
            break;
          }
        }
        if (cablesInCountry.has(cableName)) break;
      }
    }
    
    // Update UI
    const countElement = document.getElementById('countryCableCount');
    const countElement2 = document.getElementById('countryCableCount2');
    const nameElement = document.getElementById('countryName');
    const nameElement2 = document.getElementById('countryName2');
    
    if (countElement) {
      countElement.textContent = cablesInCountry.size;
    }
    
    if (countElement2) {
      countElement2.textContent = cablesInCountry.size;
    }
    
    if (nameElement || nameElement2) {
      // Get country name from bounds
      const bounds = getCountryBounds(countryCode);
      const countryName = bounds.name || countryCode;
      
      if (nameElement) {
        nameElement.textContent = countryName;
      }
      if (nameElement2) {
        nameElement2.textContent = countryName;
      }
    }
    
    console.log(`${countryCode} has ${cablesInCountry.size} submarine cables landing`);
    
  } catch (e) {
    console.error('Error calculating country cable count:', e);
    const countElement = document.getElementById('countryCableCount');
    if (countElement) {
      countElement.textContent = '?';
    }
  }
}

// Helper function to embed the bar chart
async function embedBarChart(chartData) {
  const barChartSpec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: 550,
    height: 240,
    data: { values: chartData },
    mark: { 
      type: 'bar', 
      cornerRadiusTopLeft: 6,
      cornerRadiusTopRight: 6,
      width: { band: 0.6 },
      opacity: 0.9
    },
    encoding: {
      x: {
        field: 'era',
        type: 'ordinal',
        axis: {
          title: 'Cable Era',
          titleFontSize: 12,
          titleFontWeight: 600,
          titlePadding: 10,
          labelAngle: 0,
          labelFontSize: 11,
          labelPadding: 5,
          domainWidth: 0,
          tickSize: 0
        }
      },
      y: {
        field: 'count',
        type: 'quantitative',
        axis: {
          title: null,
          labelFontSize: 10,
          gridOpacity: 0.3,
          domainWidth: 0,
          tickSize: 0
        }
      },
      color: {
        field: 'color',
        type: 'nominal',
        scale: null,
        legend: null
      },
      tooltip: [
        { field: 'era', title: 'Era' },
        { field: 'count', title: 'Cables' }
      ]
    },
    config: {
      view: { 
        stroke: null,
        continuousWidth: 550,
        continuousHeight: 240
      },
      bar: {
        binSpacing: 1
      }
    }
  };
  
  await vegaEmbed('#cableCapacityChart', barChartSpec, { actions: false });
}

// Function to generate cable capacity breakdown bar chart
async function generateCableCapacityChart(countryCode) {
  try {
    // Load pre-calculated cable breakdown data
    const breakdownResp = await fetch('data/processed/country_cable_breakdown.json');
    const breakdownData = await breakdownResp.json();
    
    // Get data for this country
    const countryData = breakdownData[countryCode];
    
    if (!countryData) {
      console.log(`No cable data found for ${countryCode}`);
      // Show empty chart
      const chartData = [
        { era: 'Pre-2000', era_full: 'Pre-2000: <1 Tbps (Early Fiber)', count: 0, color: '#440154' },
        { era: '2000-2009', era_full: '2000-2009: ~5 Tbps (DWDM Era)', count: 0, color: '#31688e' },
        { era: '2010-2019', era_full: '2010-2019: ~50 Tbps (Coherent Systems)', count: 0, color: '#35b779' },
        { era: '2020+', era_full: '2020+: 300+ Tbps (Modern Ultra-High Capacity)', count: 0, color: '#fde724' }
      ];
      await embedBarChart(chartData);
      
      // Update total capacity display
      const capacityElement = document.getElementById('totalCableCapacity');
      if (capacityElement) {
        capacityElement.textContent = '0';
      }
      return;
    }
    
    // Calculate total capacity (cable counts × capacity per era)
    const CAPACITY_BY_ERA = {
      'pre_2000': 0.5,
      'era_2000_2009': 5.0,
      'era_2010_2019': 50.0,
      'era_2020_plus': 300.0
    };
    
    const totalCapacity = (
      countryData.pre_2000 * CAPACITY_BY_ERA.pre_2000 +
      countryData.era_2000_2009 * CAPACITY_BY_ERA.era_2000_2009 +
      countryData.era_2010_2019 * CAPACITY_BY_ERA.era_2010_2019 +
      countryData.era_2020_plus * CAPACITY_BY_ERA.era_2020_plus
    );
    
    // Update total capacity display
    const capacityElement = document.getElementById('totalCableCapacity');
    if (capacityElement) {
      capacityElement.textContent = totalCapacity.toFixed(1);
    }
    
    // Convert to array for Vega-Lite
    const chartData = [
      { era: 'Pre-2000', era_full: 'Pre-2000: <1 Tbps (Early Fiber)', count: countryData.pre_2000, color: '#440154' },
      { era: '2000-2009', era_full: '2000-2009: ~5 Tbps (DWDM Era)', count: countryData.era_2000_2009, color: '#31688e' },
      { era: '2010-2019', era_full: '2010-2019: ~50 Tbps (Coherent Systems)', count: countryData.era_2010_2019, color: '#35b779' },
      { era: '2020+', era_full: '2020+: 300+ Tbps (Modern Ultra-High Capacity)', count: countryData.era_2020_plus, color: '#fde724' }
    ];
    
    // Embed the chart
    await embedBarChart(chartData);
    
  } catch (e) {
    console.error('Error generating cable capacity chart:', e);
  }
}

// Helper function to parse CSV rows with quoted fields
function parseCSVRow(row) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < row.length; i++) {
    const char = row[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// Function to generate capacity vs consumption comparison chart
async function generateCapacityComparisonChart(countryCode, countryName) {
  try {
    // Load comparison data
    const comparisonResp = await fetch('data/processed/country_capacity_comparison.json');
    const comparisonData = await comparisonResp.json();
    
    // Update country name in UI
    const nameElement = document.getElementById('capacityCountryName');
    if (nameElement) {
      nameElement.textContent = countryName || countryCode;
    }
    
    // Get data for this country
    const countryData = comparisonData[countryCode];
    
    if (!countryData) {
      console.log(`No capacity comparison data found for ${countryCode}`);
      // Show empty chart
      await embedCapacityChart([
        { category: 'Peak Consumption', value: 0, color: '#ef4444' },
        { category: 'Available Capacity', value: 0, color: '#10b981' }
      ], 0);
      return;
    }
    
    // Prepare data for stacked bar chart
    const consumption = countryData.peak_consumption_tbps;
    const capacity = countryData.total_capacity_tbps;
    const available = capacity - consumption;
    const utilizationPercent = countryData.utilization_percent;
    
    const chartData = [
      { category: 'Peak Consumption', value: consumption, color: '#ef4444', label: `${consumption.toFixed(4)} Tbps` },
      { category: 'Available Capacity', value: available, color: '#10b981', label: `${available.toFixed(2)} Tbps` }
    ];
    
    await embedCapacityChart(chartData, utilizationPercent);
    
  } catch (e) {
    console.error('Error generating capacity comparison chart:', e);
  }
}

// Helper function to embed the capacity comparison chart
async function embedCapacityChart(chartData, utilizationPercent) {
  const spec = {
    $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
    width: 550,
    height: 100,
    data: { values: chartData },
    layer: [
      {
        mark: { type: 'bar', cornerRadiusEnd: 4 },
        encoding: {
          x: {
            field: 'value',
            type: 'quantitative',
            stack: 'zero',
            axis: {
              title: 'Capacity (Tbps)',
              titleFontSize: 11,
              labelFontSize: 10
            }
          },
          y: {
            field: 'category',
            type: 'nominal',
            axis: null
          },
          color: {
            field: 'color',
            type: 'nominal',
            scale: null,
            legend: null
          },
          tooltip: [
            { field: 'category', title: 'Type' },
            { field: 'label', title: 'Value' }
          ]
        }
      },
      {
        mark: { 
          type: 'text', 
          align: 'left',
          dx: 5,
          fontSize: 11,
          fontWeight: 600,
          color: 'white'
        },
        encoding: {
          x: {
            field: 'value',
            type: 'quantitative',
            stack: 'zero'
          },
          y: {
            field: 'category',
            type: 'nominal'
          },
          text: {
            field: 'label',
            type: 'nominal'
          }
        }
      }
    ],
    config: {
      view: { stroke: null }
    }
  };
  
  // Add utilization text annotation if we have data
  if (utilizationPercent > 0) {
    spec.title = {
      text: `Current Utilization: ${utilizationPercent.toFixed(3)}%`,
      fontSize: 12,
      fontWeight: 600,
      anchor: 'start',
      color: '#1f2937'
    };
  }
  
  await vegaEmbed('#capacityComparisonChart', spec, { actions: false });
}

export { updateContinentMap, calculateCountryCableCount, generateCableCapacityChart };
