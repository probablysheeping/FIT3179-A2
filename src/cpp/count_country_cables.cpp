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

// Determine country from coordinates
string getCountry(double lat, double lon) {
    // Simple bounding box approach for major countries
    if (lat >= 15 && lat <= 72 && lon >= -170 && lon <= -50) return "US";
    if (lat >= 35 && lat <= 71 && lon >= -25 && lon <= 40) return "GB"; // Europe region
    if (lat >= -50 && lat <= -10 && lon >= 110 && lon <= 180) return "AU";
    if (lat >= 15 && lat <= 72 && lon >= 25 && lon <= 180) return "CN"; // Asia
    if (lat >= -56 && lat <= 12 && lon >= -82 && lon <= -35) return "BR";
    if (lat >= -47 && lat <= 15 && lon >= -20 && lon <= 55) return "ZA";
    return "Unknown";
}

// Get country code from CSV
map<string, string> loadCityCountries() {
    map<string, string> cityToCountry;
    ifstream file("data/processed/region_to_region_normalized.csv");
    string line;
    getline(file, line); // Skip header
    
    while (getline(file, line)) {
        vector<string> fields;
        stringstream ss(line);
        string field;
        bool inQuote = false;
        string currentField;
        
        for (char c : line) {
            if (c == '"') {
                inQuote = !inQuote;
            } else if (c == ',' && !inQuote) {
                fields.push_back(currentField);
                currentField.clear();
            } else {
                currentField += c;
            }
        }
        fields.push_back(currentField);
        
        if (fields.size() >= 15) {
            string sourceLabel = fields[12];
            string sourceCountry = fields[14];
            string targetLabel = fields[13];
            string targetCountry = fields[15];
            
            cityToCountry[sourceLabel] = sourceCountry;
            cityToCountry[targetLabel] = targetCountry;
        }
    }
    file.close();
    
    return cityToCountry;
}

// Load city coordinates
map<string, Point> loadCityCoords() {
    map<string, Point> cityCoords;
    ifstream file("data/processed/region_to_region_normalized.csv");
    string line;
    getline(file, line); // Skip header
    
    while (getline(file, line)) {
        vector<string> fields;
        stringstream ss(line);
        string field;
        bool inQuote = false;
        string currentField;
        
        for (char c : line) {
            if (c == '"') {
                inQuote = !inQuote;
            } else if (c == ',' && !inQuote) {
                fields.push_back(currentField);
                currentField.clear();
            } else {
                currentField += c;
            }
        }
        fields.push_back(currentField);
        
        if (fields.size() >= 15) {
            try {
                string sourceLabel = fields[12];
                double srcLat = stod(fields[4]);
                double srcLon = stod(fields[5]);
                
                string targetLabel = fields[13];
                double tgtLat = stod(fields[7]);
                double tgtLon = stod(fields[8]);
                
                cityCoords[sourceLabel] = {srcLon, srcLat};
                cityCoords[targetLabel] = {tgtLon, tgtLat};
            } catch (...) {}
        }
    }
    file.close();
    
    return cityCoords;
}

int main() {
    cout << "Loading city data..." << endl;
    auto cityToCountry = loadCityCountries();
    auto cityCoords = loadCityCoords();
    
    cout << "Loading submarine cables..." << endl;
    
    // Load submarine cables and their endpoints
    ifstream cableFile("data/raw/submarine_cables_2d.geojson");
    string cableData((istreambuf_iterator<char>(cableFile)), istreambuf_iterator<char>());
    cableFile.close();
    
    // Parse cables - extract name and endpoints
    map<string, set<string>> cableToCountries; // cable name -> set of countries it connects
    
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
        if (coordPos == string::npos || coordPos > namePos + 2000) {
            pos = nameEnd;
            continue;
        }
        
        size_t coordStart = cableData.find(":[", coordPos) + 1;
        
        // Extract all coordinate pairs - simpler parsing
        vector<Point> cablePoints;
        size_t i = coordStart;
        int depth = 0;
        bool started = false;
        
        while (i < cableData.size()) {
            if (cableData[i] == '[') {
                depth++;
                started = true;
            } else if (cableData[i] == ']') {
                depth--;
                if (started && depth == 0) break;
            } else if (depth == 2 && cableData[i] == '[') {
                // Found a coordinate pair
                i++;
                string numStr;
                
                // Read lon
                while (i < cableData.size() && (isdigit(cableData[i]) || cableData[i] == '.' || cableData[i] == '-')) {
                    numStr += cableData[i++];
                }
                
                if (numStr.empty()) { i++; continue; }
                
                try {
                    double lon = stod(numStr);
                    
                    // Skip to next number
                    while (i < cableData.size() && !isdigit(cableData[i]) && cableData[i] != '-') i++;
                    
                    numStr.clear();
                    while (i < cableData.size() && (isdigit(cableData[i]) || cableData[i] == '.' || cableData[i] == '-')) {
                        numStr += cableData[i++];
                    }
                    
                    if (!numStr.empty()) {
                        double lat = stod(numStr);
                        cablePoints.push_back({lon, lat});
                    }
                } catch (...) {
                    // Skip invalid coordinates
                }
            }
            i++;
            
            // Safety check
            if (i > coordStart + 100000) break;
        }
        
        // Check cable endpoints (first and last 5 points) against cities
        set<string> countriesForThisCable;
        for (int idx = 0; idx < min(5, (int)cablePoints.size()); idx++) {
            // Check start
            for (const auto& cityEntry : cityCoords) {
                string cityLabel = cityEntry.first;
                Point cityPt = cityEntry.second;
                Point cablePt = cablePoints[idx];
                
                double dist = haversine(cityPt.lon, cityPt.lat, cablePt.lon, cablePt.lat);
                if (dist < 200) { // Within 200km of a city = landing point
                    string country = cityToCountry[cityLabel];
                    if (!country.empty()) {
                        countriesForThisCable.insert(country);
                    }
                }
            }
            
            // Check end
            int endIdx = cablePoints.size() - 1 - idx;
            if (endIdx >= 0 && endIdx < cablePoints.size()) {
                for (const auto& cityEntry : cityCoords) {
                    string cityLabel = cityEntry.first;
                    Point cityPt = cityEntry.second;
                    Point cablePt = cablePoints[endIdx];
                    
                    double dist = haversine(cityPt.lon, cityPt.lat, cablePt.lon, cablePt.lat);
                    if (dist < 200) {
                        string country = cityToCountry[cityLabel];
                        if (!country.empty()) {
                            countriesForThisCable.insert(country);
                        }
                    }
                }
            }
        }
        
        if (!countriesForThisCable.empty()) {
            cableToCountries[cableName] = countriesForThisCable;
        }
        
        pos = nameEnd;
    }
    
    cout << "Found " << cableToCountries.size() << " cables with identifiable landing points" << endl;
    
    // Build country -> cables mapping
    map<string, set<string>> countryToCables;
    for (const auto& entry : cableToCountries) {
        string cable = entry.first;
        for (const string& country : entry.second) {
            countryToCables[country].insert(cable);
        }
    }
    
    // Output results
    ofstream out("data/output/country_cable_counts.json");
    out << "{\n";
    
    bool first = true;
    for (const auto& entry : countryToCables) {
        if (!first) out << ",\n";
        first = false;
        
        out << "  \"" << entry.first << "\": {\n";
        out << "    \"cable_count\": " << entry.second.size() << ",\n";
        out << "    \"cables\": [";
        
        bool firstCable = true;
        for (const string& cable : entry.second) {
            if (!firstCable) out << ", ";
            firstCable = false;
            out << "\"" << cable << "\"";
        }
        out << "]\n";
        out << "  }";
    }
    
    out << "\n}\n";
    out.close();
    
    cout << "\n✓ Saved country cable counts to data/output/country_cable_counts.json" << endl;
    
    // Print summary
    cout << "\n" << string(80, '=') << endl;
    cout << "SUBMARINE CABLES BY COUNTRY" << endl;
    cout << string(80, '=') << endl;
    
    vector<pair<string, int>> sortedCountries;
    for (const auto& entry : countryToCables) {
        sortedCountries.push_back({entry.first, entry.second.size()});
    }
    sort(sortedCountries.begin(), sortedCountries.end(), 
         [](const auto& a, const auto& b) { return a.second > b.second; });
    
    for (const auto& entry : sortedCountries) {
        cout << entry.first << ": " << entry.second << " cables" << endl;
        
        // Show first 3 cables
        int count = 0;
        for (const string& cable : countryToCables[entry.first]) {
            cout << "  - " << cable << endl;
            if (++count >= 3) {
                if (countryToCables[entry.first].size() > 3) {
                    cout << "  ... and " << (countryToCables[entry.first].size() - 3) << " more" << endl;
                }
                break;
            }
        }
        cout << endl;
    }
    
    return 0;
}

