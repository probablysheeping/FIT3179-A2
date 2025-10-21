#include <iostream>
#include <fstream>
#include <sstream>
#include <vector>
#include <map>
#include <set>
#include <string>
#include <cmath>
#include <algorithm>

using namespace std;

struct Point {
    double lon, lat;
};

struct Cable {
    string name;
    vector<Point> coords;
};

struct Path {
    string source, target;
    vector<Point> coords;
};

double haversine(double lon1, double lat1, double lon2, double lat2) {
    const double R = 6371.0;
    double dLat = (lat2 - lat1) * M_PI / 180.0;
    double dLon = (lon2 - lon1) * M_PI / 180.0;
    double a = sin(dLat/2) * sin(dLat/2) +
               cos(lat1 * M_PI / 180.0) * cos(lat2 * M_PI / 180.0) *
               sin(dLon/2) * sin(dLon/2);
    double c = 2 * atan2(sqrt(a), sqrt(1-a));
    return R * c;
}

// Simple approach: just check if path points are near cable points (much faster)
set<string> findCablesNearPath(const Path& path, const vector<Cable>& cables, double threshold = 100.0) {
    set<string> result;
    
    // For each point in the path
    for (const auto& pathPt : path.coords) {
        // Check against each cable
        for (const auto& cable : cables) {
            bool found = false;
            // Check if any cable point is close to this path point
            for (const auto& cablePt : cable.coords) {
                double dist = haversine(pathPt.lon, pathPt.lat, cablePt.lon, cablePt.lat);
                if (dist < threshold) {
                    result.insert(cable.name);
                    found = true;
                    break;
                }
            }
            if (found) break;
        }
    }
    
    return result;
}

// Parse a simple JSON array of [lon, lat] coordinates
vector<Point> parseCoordinates(const string& coordStr) {
    vector<Point> points;
    istringstream iss(coordStr);
    char ch;
    double lon, lat;
    
    // Skip to first '['
    while (iss >> ch && ch != '[');
    
    while (iss) {
        // Skip '[' if present
        if (iss.peek() == '[') iss >> ch;
        
        if (iss >> lon >> ch >> lat) {  // Read lon, comma, lat
            points.push_back({lon, lat});
            
            // Skip closing ']' and comma if present
            while (iss >> ch && (ch == ']' || ch == ',' || ch == ' '));
            if (ch == ']' && iss.peek() != ',') break;
            iss.putback(ch);
        } else {
            break;
        }
    }
    
    return points;
}

int main() {
    cout << "Loading submarine cables..." << endl;
    
    // Load submarine cables
    vector<Cable> cables;
    ifstream cableFile("data/raw/submarine_cables_2d.geojson");
    string cableData((istreambuf_iterator<char>(cableFile)), istreambuf_iterator<char>());
    cableFile.close();
    
    // Simple parsing: find "coordinates" arrays and cable names
    size_t pos = 0;
    while (true) {
        // Find cable name
        size_t namePos = cableData.find("\"name\"", pos);
        if (namePos == string::npos) break;
        
        size_t nameStart = cableData.find(":", namePos) + 1;
        while (cableData[nameStart] == ' ' || cableData[nameStart] == '"') nameStart++;
        size_t nameEnd = cableData.find("\"", nameStart);
        string cableName = cableData.substr(nameStart, nameEnd - nameStart);
        
        // Find coordinates for this feature
        size_t coordPos = cableData.find("\"coordinates\"", namePos);
        if (coordPos == string::npos || coordPos > namePos + 1000) {
            pos = nameEnd;
            continue;
        }
        
        size_t coordStart = cableData.find(":[", coordPos) + 1;
        if (coordStart == string::npos) {
            pos = nameEnd;
            continue;
        }
        
        // Find matching closing bracket
        int depth = 0;
        size_t coordEnd = coordStart;
        for (; coordEnd < cableData.size(); coordEnd++) {
            if (cableData[coordEnd] == '[') depth++;
            else if (cableData[coordEnd] == ']') {
                depth--;
                if (depth == 0) break;
            }
        }
        
        string coordStr = cableData.substr(coordStart, coordEnd - coordStart + 1);
        vector<Point> coords = parseCoordinates(coordStr);
        
        if (coords.size() >= 2) {
            cables.push_back({cableName, coords});
        }
        
        pos = coordEnd;
    }
    
    cout << "Loaded " << cables.size() << " submarine cables" << endl;
    
    // Load cable paths
    cout << "Loading cable paths..." << endl;
    vector<Path> paths;
    ifstream pathFile("data/output/cable_paths.geojson");
    string pathData((istreambuf_iterator<char>(pathFile)), istreambuf_iterator<char>());
    pathFile.close();
    
    pos = 0;
    while (true) {
        // Find source
        size_t srcPos = pathData.find("\"source\"", pos);
        if (srcPos == string::npos) break;
        
        size_t srcStart = pathData.find(":", srcPos) + 1;
        while (pathData[srcStart] == ' ' || pathData[srcStart] == '"') srcStart++;
        size_t srcEnd = pathData.find("\"", srcStart);
        string source = pathData.substr(srcStart, srcEnd - srcStart);
        
        // Find target
        size_t tgtPos = pathData.find("\"target\"", srcPos);
        size_t tgtStart = pathData.find(":", tgtPos) + 1;
        while (pathData[tgtStart] == ' ' || pathData[tgtStart] == '"') tgtStart++;
        size_t tgtEnd = pathData.find("\"", tgtStart);
        string target = pathData.substr(tgtStart, tgtEnd - tgtStart);
        
        // Find coordinates
        size_t coordPos = pathData.find("\"coordinates\"", srcPos);
        if (coordPos == string::npos || coordPos > srcPos + 2000) {
            pos = srcEnd;
            continue;
        }
        
        size_t coordStart = pathData.find(":[", coordPos) + 1;
        int depth = 0;
        size_t coordEnd = coordStart;
        for (; coordEnd < pathData.size(); coordEnd++) {
            if (pathData[coordEnd] == '[') depth++;
            else if (pathData[coordEnd] == ']') {
                depth--;
                if (depth == 0) break;
            }
        }
        
        string coordStr = pathData.substr(coordStart, coordEnd - coordStart + 1);
        vector<Point> coords = parseCoordinates(coordStr);
        
        if (coords.size() >= 2) {
            paths.push_back({source, target, coords});
        }
        
        pos = coordEnd;
    }
    
    cout << "Loaded " << paths.size() << " cable paths" << endl;
    
    // Analyze dependencies
    cout << "Analyzing cable dependencies..." << endl;
    map<string, set<string>> cityToCables;
    map<string, int> cityDestCount;
    
    for (size_t i = 0; i < paths.size(); i++) {
        if (i % 1000 == 0) {
            cout << "\r  Processed " << i << "/" << paths.size() << " paths...";
            cout.flush();
        }
        
        const auto& path = paths[i];
        set<string> cablesUsed = findCablesNearPath(path, cables);
        
        cityToCables[path.source].insert(cablesUsed.begin(), cablesUsed.end());
        cityDestCount[path.source]++;
    }
    
    cout << "\r  Processed " << paths.size() << "/" << paths.size() << " paths... Done!" << endl;
    
    // Output results
    ofstream out("data/output/cable_dependencies.json");
    out << "[\n";
    
    vector<pair<string, int>> cityByCableCount;
    for (const auto& entry : cityToCables) {
        cityByCableCount.push_back({entry.first, entry.second.size()});
    }
    sort(cityByCableCount.begin(), cityByCableCount.end(), 
         [](const auto& a, const auto& b) { return a.second < b.second; });
    
    bool first = true;
    for (const auto& entry : cityByCableCount) {
        if (!first) out << ",\n";
        first = false;
        
        out << "  {\n";
        out << "    \"city\": \"" << entry.first << "\",\n";
        out << "    \"cable_count\": " << entry.second << ",\n";
        out << "    \"destinations\": " << cityDestCount[entry.first] << ",\n";
        out << "    \"cables\": [";
        
        bool firstCable = true;
        for (const auto& cable : cityToCables[entry.first]) {
            if (!firstCable) out << ", ";
            firstCable = false;
            out << "\"" << cable << "\"";
        }
        out << "]\n";
        out << "  }";
    }
    
    out << "\n]\n";
    out.close();
    
    cout << "\n✓ Saved cable dependencies to data/output/cable_dependencies.json" << endl;
    
    // Print summary
    cout << "\n" << string(80, '=') << endl;
    cout << "CABLE DEPENDENCY ANALYSIS" << endl;
    cout << string(80, '=') << endl;
    cout << "\nTotal cities analyzed: " << cityByCableCount.size() << endl;
    
    cout << "\n📊 Cities with LEAST cable dependencies (most vulnerable):" << endl;
    for (int i = 0; i < min(10, (int)cityByCableCount.size()); i++) {
        cout << "  " << (i+1) << ". " << cityByCableCount[i].first 
             << " → " << cityByCableCount[i].second << " cables, "
             << cityDestCount[cityByCableCount[i].first] << " destinations" << endl;
    }
    
    cout << "\n📊 Cities with MOST cable dependencies (most redundancy):" << endl;
    int start = max(0, (int)cityByCableCount.size() - 10);
    for (int i = start; i < cityByCableCount.size(); i++) {
        cout << "  " << (i-start+1) << ". " << cityByCableCount[i].first 
             << " → " << cityByCableCount[i].second << " cables, "
             << cityDestCount[cityByCableCount[i].first] << " destinations" << endl;
    }
    
    return 0;
}

