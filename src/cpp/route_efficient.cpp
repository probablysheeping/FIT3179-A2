#include <iostream>
#include <fstream>
#include <sstream>
#include <vector>
#include <map>
#include <queue>
#include <cmath>
#include <algorithm>
#include <string>
using namespace std;

struct Node {
    double lat, lon;
    vector<pair<int, double>> adj;
    string cityName;
    bool isCity;
    
    Node(double lat = 0, double lon = 0, string cityName = "", bool isCity = false) 
        : lat(lat), lon(lon), cityName(cityName), isCity(isCity) {}
};

double haversine(double lat1, double lon1, double lat2, double lon2) {
    const double R = 6371.0; // Earth's radius in km
    double dlat = (lat2 - lat1) * M_PI / 180.0;
    double dlon = (lon2 - lon1) * M_PI / 180.0;
    double a = sin(dlat/2) * sin(dlat/2) + cos(lat1 * M_PI / 180.0) * cos(lat2 * M_PI / 180.0) * sin(dlon/2) * sin(dlon/2);
    double c = 2 * atan2(sqrt(a), sqrt(1-a));
    return R * c;
}

string getContinent(double lat, double lon) {
    if (lat >= 35 && lat <= 71 && lon >= -25 && lon <= 40) return "Europe";
    if (lat >= 15 && lat <= 72 && lon >= -170 && lon <= -50) return "North America";
    if (lat >= -56 && lat <= 12 && lon >= -82 && lon <= -35) return "South America";
    if (lat >= -47 && lat <= 15 && lon >= -20 && lon <= 55) return "Africa";
    if (lat >= -50 && lat <= 70 && lon >= 25 && lon <= 180) return "Asia";
    if (lat >= -50 && lat <= -10 && lon >= 110 && lon <= 180) return "Oceania";
    return "Other";
}

int main() {
    vector<Node> nodes;
    map<string, int> cityToNode;
    
    // Load cities
    ifstream cityFile("region_to_region_bidirectional.csv");
    string line;
    getline(cityFile, line); // Skip header
    
    while (getline(cityFile, line)) {
        stringstream ss(line);
        string sourceRegion, targetRegion, latency, sourceCity, sourceLat, sourceLon, targetCity, targetLat, targetLon;
        
        getline(ss, sourceRegion, ',');
        getline(ss, targetRegion, ',');
        getline(ss, latency, ',');
        getline(ss, sourceCity, ',');
        getline(ss, sourceLat, ',');
        getline(ss, sourceLon, ',');
        getline(ss, targetCity, ',');
        getline(ss, targetLat, ',');
        getline(ss, targetLon, ',');
        
        try {
            double lat1 = stod(sourceLat);
            double lon1 = stod(sourceLon);
            double lat2 = stod(targetLat);
            double lon2 = stod(targetLon);
            
            if (cityToNode.find(sourceCity) == cityToNode.end()) {
                int id = nodes.size();
                nodes.push_back(Node(lat1, lon1, sourceCity, true));
                cityToNode[sourceCity] = id;
            }
            
            if (cityToNode.find(targetCity) == cityToNode.end()) {
                int id = nodes.size();
                nodes.push_back(Node(lat2, lon2, targetCity, true));
                cityToNode[targetCity] = id;
            }
        } catch (...) {
            // Skip invalid lines
        }
    }
    cityFile.close();
    
    cerr << "Loaded " << cityToNode.size() << " cities" << endl;
    
    // Load submarine cables
    ifstream cableFile("submarine_cables_2d.geojson");
    string cableData((istreambuf_iterator<char>(cableFile)), istreambuf_iterator<char>());
    cableFile.close();
    
    // Parse cables using robust parsing method
    vector<vector<pair<double, double>>> cables;
    size_t pos = 0;
    
    cerr << "Starting cable parsing..." << endl;
    
    while (true) {
        size_t p = cableData.find("\"coordinates\"", pos);
        if (p == string::npos) break;
        p = cableData.find('[', p);
        if (p == string::npos) break;
        
        // Find matching closing bracket
        int depth = 0;
        size_t q = p;
        bool started = false;
        do {
            char c = cableData[q++];
            if (c == '[') {
                depth++;
                started = true;
            } else if (c == ']') {
                depth--;
                if (started && depth == 0) break;
            }
        } while (q < cableData.size());
        
        if (q >= cableData.size()) break;
        
        string block = cableData.substr(p, q - p);
        vector<pair<double, double>> pts;
        
        // Parse numbers from the coordinate block
        double num = 0;
        bool neg = false, inNum = false, afterDot = false;
        int frac = 0;
        vector<double> vals;
        
        auto pushNum = [&]() {
            if (!inNum) return;
            double v = num;
            if (frac) {
                for (int i = 0; i < frac; ++i) v /= 10.0;
            }
            if (neg) v = -v;
            vals.push_back(v);
            num = 0;
            neg = false;
            inNum = false;
            afterDot = false;
            frac = 0;
        };
        
        for (char c : block) {
            if (c == '-' && !inNum) {
                neg = true;
                inNum = true;
                num = 0;
                afterDot = false;
                frac = 0;
            } else if (c >= '0' && c <= '9') {
                if (!inNum) {
                    inNum = true;
                    num = 0;
                    afterDot = false;
                    frac = 0;
                }
                num = num * 10 + (c - '0');
                if (afterDot) frac++;
            } else if (c == '.') {
                if (!inNum) {
                    inNum = true;
                    num = 0;
                    afterDot = false;
                    frac = 0;
                }
                afterDot = true;
            } else {
                pushNum();
            }
        }
        pushNum();
        
        // Convert values to lat/lon pairs (values are [lon,lat] in GeoJSON)
        for (size_t i = 0; i + 1 < vals.size(); i += 2) {
            pts.push_back({vals[i + 1], vals[i]}); // Store as {lat, lon}
        }
        
        if (pts.size() >= 2) {
            cables.push_back(pts);
        }
        
        pos = q;
    }
    
    cerr << "Loaded " << cables.size() << " cables" << endl;
    
    // Debug: Print first few cables
    for (int i = 0; i < min(3, (int)cables.size()); i++) {
        cerr << "Cable " << i << " has " << cables[i].size() << " points" << endl;
        if (!cables[i].empty()) {
            cerr << "  First point: " << cables[i][0].first << ", " << cables[i][0].second << endl;
        }
    }
    
    // Create cable nodes
    vector<int> cableNodes;
    for (const auto& cable : cables) {
        for (const auto& point : cable) {
            int id = nodes.size();
            nodes.push_back(Node(point.first, point.second, "", false));
            cableNodes.push_back(id);
        }
    }
    
    // Connect cable endpoints within 100km
    int cableConnections = 0;
    for (int i = 0; i < (int)cableNodes.size(); i++) {
        for (int j = i + 1; j < (int)cableNodes.size(); j++) {
            double dist = haversine(nodes[cableNodes[i]].lat, nodes[cableNodes[i]].lon,
                                  nodes[cableNodes[j]].lat, nodes[cableNodes[j]].lon);
            if (dist <= 100) {
                nodes[cableNodes[i]].adj.push_back({cableNodes[j], dist});
                nodes[cableNodes[j]].adj.push_back({cableNodes[i], dist});
                cableConnections++;
            }
        }
    }
    
    // Connect cities to cables on same continent
    int cityConnections = 0;
    for (auto& cityPair : cityToNode) {
        int cityId = cityPair.second;
        string continent = getContinent(nodes[cityId].lat, nodes[cityId].lon);
        
        for (int cableId : cableNodes) {
            string cableContinent = getContinent(nodes[cableId].lat, nodes[cableId].lon);
            if (continent == cableContinent) {
                double dist = haversine(nodes[cityId].lat, nodes[cityId].lon,
                                      nodes[cableId].lat, nodes[cableId].lon);
                if (dist <= 2000) {  // Increased to 2000km to reach more cable landing points
                    // Weighted distance (2x for city to cable)
                    nodes[cityId].adj.push_back({cableId, dist * 2});
                    nodes[cableId].adj.push_back({cityId, dist * 2});
                    cityConnections++;
                }
            }
        }
    }
    
    // Connect cities to other cities on SAME continent (inland routes with 2x penalty)
    // No distance threshold - any cities on the same continent can connect
    int cityCityConnections = 0;
    for (auto& cityPair1 : cityToNode) {
        int city1Id = cityPair1.second;
        string continent1 = getContinent(nodes[city1Id].lat, nodes[city1Id].lon);
        
        for (auto& cityPair2 : cityToNode) {
            if (cityPair1.first >= cityPair2.first) continue;  // Avoid duplicates
            
            int city2Id = cityPair2.second;
            string continent2 = getContinent(nodes[city2Id].lat, nodes[city2Id].lon);
            
            // Only connect cities on the SAME continent (no distance limit)
            if (continent1 == continent2) {
                double dist = haversine(nodes[city1Id].lat, nodes[city1Id].lon,
                                      nodes[city2Id].lat, nodes[city2Id].lon);
                // Weighted distance (2x for inland city-to-city)
                nodes[city1Id].adj.push_back({city2Id, dist * 2});
                nodes[city2Id].adj.push_back({city1Id, dist * 2});
                cityCityConnections++;
            }
        }
    }
    
    cerr << "Created " << nodes.size() << " total nodes" << endl;
    cerr << "Created " << cableConnections << " cable endpoint connections" << endl;
    cerr << "Created " << cityConnections << " city-cable connections" << endl;
    cerr << "Created " << cityCityConnections << " city-city inland connections (same continent)" << endl;
    
    int totalEdges = 0;
    for (int i = 0; i < (int)nodes.size(); i++) {
        totalEdges += nodes[i].adj.size();
    }
    cerr << "Total edges: " << totalEdges << endl;
    
    if (totalEdges == 0) {
        cerr << "ERROR: No edges created! Exiting." << endl;
        return 1;
    }
    
    // Check graph connectivity using BFS from first city
    cerr << "Checking graph connectivity..." << endl;
    vector<bool> visited(nodes.size(), false);
    queue<int> q;
    int firstCityId = cityToNode.begin()->second;
    q.push(firstCityId);
    visited[firstCityId] = true;
    int reachable = 1;
    
    while (!q.empty()) {
        int curr = q.front();
        q.pop();
        for (auto& edge : nodes[curr].adj) {
            int next = edge.first;
            if (!visited[next]) {
                visited[next] = true;
                reachable++;
                q.push(next);
            }
        }
    }
    
    int citiesReachable = 0;
    for (auto& cityPair : cityToNode) {
        if (visited[cityPair.second]) citiesReachable++;
    }
    
    cerr << "Connectivity check: " << reachable << "/" << nodes.size() << " nodes reachable" << endl;
    cerr << "Cities reachable: " << citiesReachable << "/" << cityToNode.size() << endl;
    
    if (citiesReachable < cityToNode.size()) {
        cerr << "WARNING: Graph is not fully connected! Some cities are unreachable." << endl;
        cerr << "Unreachable cities:" << endl;
        for (auto& cityPair : cityToNode) {
            if (!visited[cityPair.second]) {
                cerr << "  - " << cityPair.first << " (" << nodes[cityPair.second].lat 
                     << ", " << nodes[cityPair.second].lon << ")" << endl;
            }
        }
    }
    
    // Generate routes for city pairs using Dijkstra
    ofstream out("cable_paths_efficient.geojson");
    ofstream segments("cable_path_segments_efficient.csv");
    ofstream fail("failed_routes_efficient.csv");
    
    out << "{\n  \"type\":\"FeatureCollection\",\n  \"features\":[\n";
    segments << "source,target,segment_index,lat,lon,distance_km\n";
    fail << "source,target,source_lat,source_lon,target_lat,target_lon\n";
    
    bool first = true;
    int processed = 0;
    int total = cityToNode.size() * (cityToNode.size() - 1);
    
    for (auto& sourcePair : cityToNode) {
        for (auto& targetPair : cityToNode) {
            if (sourcePair.first == targetPair.first) continue;
            
            processed++;
            if (processed % 100 == 0) {
                cerr << "Route generation progress: " << (processed * 100.0 / total) << "% (" << processed << "/" << total << ")" << endl;
            }
            
            int sourceId = sourcePair.second;
            int targetId = targetPair.second;
            
            // Dijkstra
            vector<double> dist(nodes.size(), 1e18);
            vector<int> parent(nodes.size(), -1);
            priority_queue<pair<double, int>, vector<pair<double, int>>, greater<pair<double, int>>> pq;
            
            dist[sourceId] = 0;
            pq.push({0, sourceId});
            
            while (!pq.empty()) {
                double d = pq.top().first;
                int u = pq.top().second;
                pq.pop();
                
                if (d > dist[u]) continue;
                
                for (auto& edge : nodes[u].adj) {
                    int v = edge.first;
                    double w = edge.second;
                    
                    if (dist[u] + w < dist[v]) {
                        dist[v] = dist[u] + w;
                        parent[v] = u;
                        pq.push({dist[v], v});
                    }
                }
            }
            
            if (dist[targetId] >= 1e17) {
                fail << sourcePair.first << "," << targetPair.first << "," 
                     << nodes[sourceId].lat << "," << nodes[sourceId].lon << ","
                     << nodes[targetId].lat << "," << nodes[targetId].lon << "\n";
                continue;
            }
            
            // Reconstruct path
            vector<int> path;
            int curr = targetId;
            while (curr != -1) {
                path.push_back(curr);
                curr = parent[curr];
            }
            reverse(path.begin(), path.end());
            
            if (path.empty() || path.back() != targetId) {
                fail << sourcePair.first << "," << targetPair.first << "," 
                     << nodes[sourceId].lat << "," << nodes[sourceId].lon << ","
                     << nodes[targetId].lat << "," << nodes[targetId].lon << "\n";
                continue;
            }
            
            // Calculate actual distance (not weighted)
            double actualDist = 0;
            for (size_t i = 1; i < path.size(); i++) {
                double segmentDist = haversine(nodes[path[i-1]].lat, nodes[path[i-1]].lon,
                                             nodes[path[i]].lat, nodes[path[i]].lon);
                actualDist += segmentDist;
            }
            
            // Output GeoJSON
            if (!first) out << ",\n";
            first = false;
            
            out << "    {\n";
            out << "      \"type\":\"Feature\",\n";
            out << "      \"geometry\":{\n";
            out << "        \"type\":\"LineString\",\n";
            out << "        \"coordinates\":[";
            
            for (size_t k = 0; k < path.size(); k++) {
                if (k > 0) out << ",";
                out << "[" << nodes[path[k]].lon << "," << nodes[path[k]].lat << "]";
            }
            
            out << "]\n";
            out << "      },\n";
            out << "      \"properties\":{\n";
            out << "        \"source\":\"" << sourcePair.first << "\",\n";
            out << "        \"target\":\"" << targetPair.first << "\",\n";
            out << "        \"distance_km\":" << actualDist << "\n";
            out << "      }\n";
            out << "    }";
            
            // Output segments
            for (size_t i = 1; i < path.size(); i++) {
                double segmentDist = haversine(nodes[path[i-1]].lat, nodes[path[i-1]].lon,
                                             nodes[path[i]].lat, nodes[path[i]].lon);
                segments << sourcePair.first << "," << targetPair.first << "," 
                        << (i-1) << "," << nodes[path[i]].lat << "," << nodes[path[i]].lon 
                        << "," << segmentDist << "\n";
            }
        }
    }
    
    out << "\n  ]\n}\n";
    out.close();
    segments.close();
    fail.close();
    
    cerr << "Done. Generated cable_paths_efficient.geojson, cable_path_segments_efficient.csv, and failed_routes_efficient.csv" << endl;
    return 0;
}
