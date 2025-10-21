// Scatter plot showing relationship between distance and latency

// Ping efficiency formula (same as main map)
function getPingEfficiencyFormula(min_score = -8, max_score = 10, ideal_ratio = 2/200, sensitivity = 50) {
  const range = max_score - min_score;
  return `datum.sum_distance_km > 0 ? ${min_score} + ${range} / (1 + ${sensitivity} * (datum.sum_latency_ms / datum.sum_distance_km - ${ideal_ratio})) : ${min_score}`;
}

const PING_EFFICIENCY_FORMULA = getPingEfficiencyFormula();

export const scatterDistanceLatencySpec = {
  "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
  "width": 950,
  "height": 350,
  "data": {
    "url": "data/processed/region_to_region_bidirectional.csv"
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

