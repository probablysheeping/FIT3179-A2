#include <iostream>
#include <fstream>
#include <vector>
#include <string>
#include <sstream>
#include <cmath>
#include <queue>
#include <set>
#include <algorithm>
#include <iomanip>
using namespace std;

struct Node
{
    double lat, lon;
    vector<int> adj;
};
static inline double deg2rad(double d) { return d * M_PI / 180.0; }
static inline double haversine(double lat1, double lon1, double lat2, double lon2)
{
    double dlat = deg2rad(lat2 - lat1), dlon = deg2rad(lon2 - lon1);
    double a = sin(dlat / 2) * sin(dlat / 2) + cos(deg2rad(lat1)) * cos(deg2rad(lat2)) * sin(dlon / 2) * sin(dlon / 2);
    double c = 2 * atan2(sqrt(a), sqrt(1 - a));
    return 6371.0 * c;
}

vector<vector<pair<double, double>>> parseCableLines(const string &path)
{
    ifstream in(path);
    string s((istreambuf_iterator<char>(in)), {});
    vector<vector<pair<double, double>>> lines;
    size_t pos = 0;
    const string key = "\"coordinates\"";
    while ((pos = s.find(key, pos)) != string::npos)
    {
        size_t b = s.find('[', pos + key.size());
        if (b == string::npos)
            break;
        int bracket = 1;
        string num;
        vector<double> nums;
        vector<pair<double, double>> cur;
        for (size_t i = b + 1; i < s.size(); ++i)
        {
            char c = s[i];
            if (c == '[')
                bracket++;
            else if (c == ']')
            {
                if (!num.empty())
                {
                    nums.push_back(stod(num));
                    num.clear();
                }
                if (nums.size() >= 2)
                {
                    double lon = nums[nums.size() - 2], lat = nums[nums.size() - 1];
                    cur.push_back({lat, lon});
                    nums.clear();
                }
                bracket--;
                if (bracket == 0)
                {
                    if (cur.size() >= 2)
                        lines.push_back(cur);
                    pos = i;
                    break;
                }
            }
            else if ((c >= '0' && c <= '9') || c == '-' || c == '+' || c == '.' || c == 'e' || c == 'E')
            {
                num.push_back(c);
            }
            else if (c == ',' && !num.empty())
            {
                nums.push_back(stod(num));
                num.clear();
            }
        }
    }
    return lines;
}

struct City
{
    string label;
    double lat, lon;
};
vector<City> loadCities(const string &csv)
{
    ifstream in(csv);
    string line;
    getline(in, line);
    vector<City> out;
    set<string> seen;
    while (getline(in, line))
    {
        vector<string> cols;
        bool inq = false;
        string cur;
        for (char c : line)
        {
            if (c == '"')
            {
                inq = !inq;
            }
            else if (c == ',' && !inq)
            {
                cols.push_back(cur);
                cur.clear();
            }
            else
                cur.push_back(c);
        }
        cols.push_back(cur);
        if (cols.size() < 14)
            continue;
        string label = cols[12];
        double lat = atof(cols[4].c_str());
        double lon = atof(cols[5].c_str());
        if (!label.empty() && !seen.count(label))
        {
            out.push_back({label, lat, lon});
            seen.insert(label);
        }
    }
    return out;
}

int main(int argc, char **argv)
{
    string sourceLabel = argc >= 2 ? string(argv[1]) : string("London, GB");
    auto lines = parseCableLines("submarine_cables_2d.geojson");
    vector<Node> nodes;
    for (auto &ln : lines)
    {
        int prev = -1;
        for (auto &p : ln)
        {
            nodes.push_back({p.first, p.second, {}});
            int id = nodes.size() - 1;
            if (prev != -1)
            {
                nodes[prev].adj.push_back(id);
                nodes[id].adj.push_back(prev);
            }
            prev = id;
        }
    }
    if (nodes.empty())
    {
        cerr << "No cable nodes parsed\n";
        return 1;
    }
    auto cities = loadCities("region_to_region_ping_clean.csv");
    int srcIdx = -1;
    for (int i = 0; i < (int)cities.size(); ++i)
    {
        if (cities[i].label == sourceLabel)
        {
            srcIdx = i;
            break;
        }
    }
    if (srcIdx == -1)
    {
        cerr << "Source city not found\n";
        return 1;
    }
    auto source = cities[srcIdx];
    auto nearest = [&](double lat, double lon)
    { int best=-1; double bestD=1e18; for(int i=0;i<(int)nodes.size();++i){ double d=haversine(lat,lon,nodes[i].lat,nodes[i].lon); if(d<bestD){ bestD=d; best=i; }} return best; };
    int srcNode = nearest(source.lat, source.lon);
    // Dijkstra
    const double INF = 1e18;
    vector<double> dist(nodes.size(), INF);
    vector<int> parent(nodes.size(), -1);
    using P = pair<double, int>;
    priority_queue<P, vector<P>, greater<P>> pq;
    dist[srcNode] = 0;
    pq.push({0, srcNode});
    while (!pq.empty())
    {
        auto [d, u] = pq.top();
        pq.pop();
        if (d != dist[u])
            continue;
        for (int v : nodes[u].adj)
        {
            double w = haversine(nodes[u].lat, nodes[u].lon, nodes[v].lat, nodes[v].lon);
            if (dist[v] > d + w)
            {
                dist[v] = d + w;
                parent[v] = u;
                pq.push({dist[v], v});
            }
        }
    }

    ofstream out("cable_paths_from_city.geojson");
    out << "{\n  \"type\": \"FeatureCollection\",\n  \"features\": [\n";

    bool firstFeature = true;

    for (auto &city : cities)
    {
        if (city.label == source.label)
            continue;

        int dstNode = nearest(city.lat, city.lon);

        vector<int> path;
        for (int v = dstNode; v != -1; v = parent[v])
            path.push_back(v);
        reverse(path.begin(), path.end());

        if (path.empty())
            continue;

        // Build coordinates
        vector<pair<double, double>> coords;

        // Start with source city
        coords.push_back({source.lon, source.lat});

        // Cable nodes along shortest path
        for (int id : path)
            coords.push_back({nodes[id].lon, nodes[id].lat});

        // End with destination city
        coords.push_back({city.lon, city.lat});

        if (!firstFeature)
            out << ",\n";
        firstFeature = false;

        out << "    {\n";
        out << "      \"type\": \"Feature\",\n";
        out << "      \"geometry\": { \"type\": \"LineString\", \"coordinates\": [";

        for (size_t i = 0; i < coords.size(); ++i)
        {
            if (i > 0)
                out << ",";
            out << "[" << fixed << setprecision(6) << coords[i].first << "," << coords[i].second << "]";
        }

        out << "] },\n";
        out << "      \"properties\": { \"source\": \"" << source.label
            << "\", \"target\": \"" << city.label << "\" }\n";
        out << "    }";
    }

    out << "\n  ]\n}\n";
    out.close();
    cerr << "Wrote cable_paths_from_city.geojson\n";
}
