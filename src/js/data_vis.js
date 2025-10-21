import { DATA_URLS } from './main.js';

// ============================================================================
// PING EFFICIENCY FORMULA - ADJUST THESE PARAMETERS TO EXPERIMENT
// ============================================================================
/**
 * Ping Efficiency Formula Generator
 * 
 * Current formula: min_score + range / (1 + sensitivity * (ping/distance - ideal_ratio))
 * 
 * @param {number} min_score - Minimum score for worst routes (default: 1)
 * @param {number} max_score - Maximum score for ideal routes (default: 9)
 * @param {number} ideal_ratio - Ideal ping/distance ratio in ms/km (default: 1/200 = 0.005)
 * @param {number} sensitivity - How quickly score drops from ideal (default: 100)
 * 
 * Examples:
 *   - Default (1-9 scale): getPingEfficiencyFormula(1, 9, 1/200, 100)
 *   - Wider range (0-10): getPingEfficiencyFormula(0, 10, 1/200, 100)
 *   - More sensitive: getPingEfficiencyFormula(1, 9, 1/200, 200)
 */
function getPingEfficiencyFormula(min_score = -8, max_score = 17, ideal_ratio = 2/200, sensitivity = 20) {
  const range = max_score - min_score;
  return `datum.sum_distance_km > 0 ? ${min_score} + ${range} / (1 + ${sensitivity} * (datum.sum_latency_ms / datum.sum_distance_km - ${ideal_ratio})) : ${min_score}`;
}

// Generate the formula for use in Vega specs
const PING_EFFICIENCY_FORMULA = getPingEfficiencyFormula();

// ============================================================================

// Load your Vega-Lite specs (or paste them directly here)
const mapSpec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "description": "Global map showing inter-region Azure latency with per-city average latency and ping efficiency.",
    "resolve": { "scale": {"color": "independent"} },
    "width": 1000,
    "height": 500,
    "projection": {"type": "equalEarth"},

    "params": [],

    "layer": [
        {
        "data": {
            "url": "https://vega.github.io/vega-datasets/data/world-110m.json",
            "format": {"type": "topojson", "feature": "countries"}
        },
        "mark": {"type": "geoshape", "fill": "#ececec", "stroke": "white"}
        },

        // Undersea cables - colored by capacity era
        {
            "data": {"url": DATA_URLS.SUBMARINE_CABLES, "format": {"type": "json", "property": "features"}},
            "transform": [
                {
                    "calculate": "datum.properties.rfs ? toNumber(substring(datum.properties.rfs, length(datum.properties.rfs) - 4)) : 1990",
                    "as": "build_year"
                },
                {
                    "calculate": "datum.build_year < 2000 ? 'Pre-2000' : datum.build_year < 2010 ? '2000-2009' : datum.build_year < 2020 ? '2010-2019' : '2020+'",
                    "as": "capacity_era"
                }
            ],
            "mark": {
                "type": "geoshape",
                "strokeWidth": 0.6,
                "fill": null,
                "opacity": 0.75
            },
            "encoding": {
                "stroke": {
                    "field": "capacity_era",
                    "type": "nominal",
                    "scale": {
                        "domain": [
                            "Pre-2000",
                            "2000-2009",
                            "2010-2019",
                            "2020+"
                        ],
                        "range": ["#440154", "#31688e", "#35b779", "#fde724"]
                    },
                    "legend": {
                        "title": "Cable Era",
                        "orient": "bottom-right",
                        "labelLimit": 150
                    }
                }
            }
        },

        // Invisible layer for tooltips
        {
            "data": {"url": DATA_URLS.SUBMARINE_CABLES, "format": {"type": "json", "property": "features"}},
            "transform": [
                {
                    "calculate": "datum.properties.name || 'Unknown Cable'",
                    "as": "cable_name"
                },
                {
                    "calculate": "datum.properties.rfs || 'Unknown'",
                    "as": "rfs_date"
                },
                {
                    "calculate": "datum.properties.length || 'Unknown'",
                    "as": "cable_length"
                },
                {
                    "calculate": "datum.properties.owners || 'Unknown'",
                    "as": "cable_owners"
                }
            ],
            "mark": {
                "type": "geoshape",
                "stroke": "transparent",
                "strokeWidth": 20,
                "fill": "transparent",
                "opacity": 0
            },
            "encoding": {
                "tooltip": [
                    {"field": "cable_name", "title": "Cable Name"},
                    {"field": "rfs_date", "title": "Ready for Service"},
                    {"field": "cable_length", "title": "Length"},
                    {"field": "cable_owners", "title": "Owners"}
                ]
            }
        },

        

        {
            "data": {"url": DATA_URLS.REGION_TO_REGION_NORMALIZED},
            "transform": [
                {"fold": ["source_label", "target_label"]},
                {"calculate": "datum.key == 'source_label' ? datum.source_lat : datum.target_lat", "as": "lat"},
                {"calculate": "datum.key == 'source_label' ? datum.source_lon : datum.target_lon", "as": "lon"},
                {"calculate": "datum.key == 'source_label' ? datum.source_country_code : datum.target_country_code", "as": "country_code"},
                {"calculate":
                    "indexof(['GB','FR','DE','SE','NL','CH','PL','IE','IT','NO'], datum.country_code) >= 0 ? 'Europe' :" +
                    "indexof(['US','CA','MX'], datum.country_code) >= 0 ? 'North America' :" +
                    "indexof(['BR','AR','CL'], datum.country_code) >= 0 ? 'South America' :" +
                    "indexof(['JP','SG','IN','CN','KR','MY','ID'], datum.country_code) >= 0 ? 'Asia' :" +
                    "indexof(['ZA'], datum.country_code) >= 0 ? 'Africa' :" +
                    "indexof(['AU','NZ'], datum.country_code) >= 0 ? 'Oceania' :" +
                    "'Other'",
                 "as": "continent"},
                {"calculate": "datum.value", "as": "city"},
                {"aggregate": [
                    {"op": "mean", "field": "latency_ms", "as": "avg_latency_ms"},
                    {"op": "mean", "field": "distance_km", "as": "avg_distance_km"},
                    {"op": "sum", "field": "latency_ms", "as": "sum_latency_ms"},
                    {"op": "sum", "field": "distance_km", "as": "sum_distance_km"}
                ], "groupby": ["city", "lat", "lon", "continent"]},
                {"calculate": "datum.sum_distance_km > 0 ? 10 * (1 + (datum.sum_latency_ms / datum.sum_distance_km - 9.8 / 1000)) : 1e-9", "as": "ping_efficiency"},
                {"calculate": "format(datum.avg_latency_ms, '.1f') + ' ms'", "as": "latency_display"},
                {"calculate": "format(datum.avg_distance_km, '.0f') + ' km'", "as": "distance_display"}
            ],
            "mark": {"type": "circle", "stroke": "white", "strokeWidth": 0.5, "opacity": 0.9, "size": 40},
            "encoding": {
                "longitude": {"field": "lon"},
                "latitude": {"field": "lat"},
                "color": {"field": "avg_latency_ms", "type": "quantitative", "scale": {"scheme": "turbo", "domain": [100, 300], "clamp": true}, "legend": {"title": "Average Latency (ms)"}},
                "tooltip": [
                    {"field": "city", "title": "City"},
                    {"field": "latency_display", "title": "Average Latency", "type": "nominal"},
                    {"field": "distance_display", "title": "Average Distance", "type": "nominal"}
                ]
            }
        }
    ]
};
  
const scatterSpec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "width": 950,
  "height": 350,
  "data": {
    "url": DATA_URLS.REGION_TO_REGION_BIDIRECTIONAL
  },
  "params": [
    { "name": "zoom", "select": { "type": "interval", "bind": "scales" } },
    { "name": "sourceQuery", "value": "" }
  ],
  "transform": [
    /* Combine both source and target as cities */
    {"fold": ["source_label", "target_label"]},
    {
      "calculate": "datum.key == 'source_label' ? datum.source_lat : datum.target_lat",
      "as": "lat"
    },
    {
      "calculate": "datum.key == 'source_label' ? datum.source_lon : datum.target_lon",
      "as": "lon"
    },
    {
        "calculate": "datum.key == 'source_label' ? datum.source_country_code : datum.target_country_code",
        "as": "country_code"
    },
    {
        "calculate": "datum.key == 'source_label' ? datum.source_country_code : datum.target_country_code",
        "as": "country_code"
    },
    {
        "calculate": "indexof(['GB','FR','DE','SE','NL','CH','PL','IE','IT','NO'], datum.country_code) >= 0 ? 'Europe' : indexof(['US','CA','MX'], datum.country_code) >= 0 ? 'North America' : indexof(['BR','AR','CL'], datum.country_code) >= 0 ? 'South America' : indexof(['JP','SG','IN','CN','KR','MY','ID'], datum.country_code) >= 0 ? 'Asia' : indexof(['ZA'], datum.country_code) >= 0 ? 'Africa' : indexof(['AU','NZ'], datum.country_code) >= 0 ? 'Oceania' : 'Other'",
        "as": "continent"
    },


    {"calculate": "datum.value", "as": "city"},
    
    /* Aggregate metrics per city */
    {
      "aggregate": [
        {"op": "mean", "field": "latency_ms", "as": "avg_latency_ms"},
        {"op": "mean", "field": "distance_km", "as": "avg_distance_km"},
        {"op": "sum", "field": "latency_ms", "as": "sum_latency_ms"},
        {"op": "sum", "field": "distance_km", "as": "sum_distance_km"}
      ],
      "groupby": ["city", "lat", "lon"]
    },
    
    /* Calculate efficiency using formula from top of file */
    {
      "calculate": PING_EFFICIENCY_FORMULA,
      "as": "ping_efficiency"
    },
    /* Add display fields with units */
    {
      "calculate": "format(datum.avg_latency_ms, '.1f') + ' ms'",
      "as": "latency_display"
    },
    {
      "calculate": "format(datum.avg_distance_km, '.1f') + ' km'",
      "as": "distance_display"
    }
  ],
  "layer": [
    {
      "mark": {"type": "circle", "opacity": 0.85, "stroke": "white", "strokeWidth": 1, "size": 60},
      "encoding": {
        "x": {
          "field": "avg_distance_km",
          "type": "quantitative",
          "title": "Average Distance (km)",
          "scale": {"domain":[5000,15000]},
          "axis": {"tickCount": 10} 
        },
        "y": {
          "field": "avg_latency_ms",
          "type": "quantitative",
          "title": "Average Latency (ms)",
          "scale": {"domain": [80, 300]}
        },
        "color": {
          "field": "ping_efficiency",
          "type": "quantitative",
          "title": "Ping Efficiency",
          "scale": {
            "type": "linear",
            "domain": [0, 10],
            "range": ["#d73027", "#fee08b", "#1a9850"],
            "clamp": true
          }
        },
        "tooltip": [
          {"field": "city", "title": "City"},
          {"field": "latency_display", "title": "Average Latency", "type": "nominal"},
          {"field": "distance_display", "title": "Average Distance", "type": "nominal"},
          {"field": "ping_efficiency", "title": "Ping Efficiency", "type": "quantitative", "format": ".2f"}
        ]
      }
    }
  ]
};

// Initialize the visualization

export { mapSpec, scatterSpec };
