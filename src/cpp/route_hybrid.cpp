#include <iostream>
#include <fstream>
#include <vector>
#include <unordered_map>
#include <string>
#include <cmath>
#include <algorithm>
#include <queue>
#include <iomanip>
#include <limits>

// -------------------- CONFIGURATION --------------------
#define INLAND_PENALTY 2.0  // Penalty multiplier for city-to-cable and city-to-city connections
#define DIRECT_PENALTY 10000000.0    // Penalty for direct point-to-point connections (fallback)
// -------------------------------------------------------

using namespace std;

// -------------------- Structures --------------------
struct Node {
    double lat, lon;
    vector<pair<int,double>> adj;
};
struct Conn {
    string sLabel,tLabel;
    double slat,slon,tlat,tlon,latency;
};
struct Edge { int to, rev, cap; };

// -------------------- Haversine --------------------
inline double rad(double d){ return d*M_PI/180.0; }
inline double hav(double la1,double lo1,double la2,double lo2){
    double dlat=rad(la2-la1), dlon=rad(lo2-lo1);
    double a=sin(dlat/2)*sin(dlat/2)+cos(rad(la1))*cos(rad(la2))*sin(dlon/2)*sin(dlon/2);
    return 6371.0*2*atan2(sqrt(a),sqrt(max(0.0,1-a)));
}

// -------------------- Continent Detection --------------------
string getContinent(double lat, double lon) {
    if (lat >= 35 && lat <= 71 && lon >= -25 && lon <= 40) return "Europe";
    if (lat >= 15 && lat <= 72 && lon >= -170 && lon <= -50) return "North America";
    if (lat >= -56 && lat <= 12 && lon >= -82 && lon <= -35) return "South America";
    if (lat >= -47 && lat <= 15 && lon >= -20 && lon <= 55) return "Africa";
    if (lat >= -50 && lat <= 70 && lon >= 25 && lon <= 180) return "Asia";
    if (lat >= -50 && lat <= -10 && lon >= 110 && lon <= 180) return "Oceania";
    return "Other";
}

// -------------------- Dinic (unit capacity) --------------------
struct Dinic {
    vector<vector<Edge>> g;
    int n;
    Dinic(int n_=0): n(n_) { g.assign(n,{}); }
    void addEdge(int u,int v,int c){ g[u].push_back({v,(int)g[v].size(),c}); g[v].push_back({u,(int)g[u].size()-1,0}); }
    bool bfs(int s,int t, vector<int>& level){
        fill(level.begin(), level.end(), -1);
        queue<int> q; level[s]=0; q.push(s);
        while(!q.empty()){
            int u=q.front(); q.pop();
            for(auto &e:g[u]) if(e.cap>0 && level[e.to]<0){ level[e.to]=level[u]+1; q.push(e.to); }
        }
        return level[t]>=0;
    }
    int dfs(int u,int t,int f, vector<int>& it, vector<int>& level){
        if(u==t) return f;
        for(int &i=it[u]; i<(int)g[u].size(); ++i){
            Edge &e=g[u][i];
            if(e.cap>0 && level[e.to]==level[u]+1){
                int ret=dfs(e.to,t,min(f,e.cap),it,level);
                if(ret>0){ e.cap-=ret; g[e.to][e.rev].cap+=ret; return ret; }
            }
        }
        return 0;
    }
    int maxflow(int s,int t){
        vector<int> level(n), it(n);
        int flow=0, inf=1e9;
        while(bfs(s,t,level)){
            fill(it.begin(), it.end(),0);
            int f;
            while((f=dfs(s,t,inf,it,level))) flow+=f;
        }
        return flow;
    }
};

// -------------------- Progress Bar --------------------
void printProgress(size_t done, size_t total){
    int barWidth = 40;
    double progress = double(done)/total;
    int pos = barWidth * progress;
    cout << "\r[";
    for(int i=0;i<barWidth;++i){
        if(i<pos) cout<<"=";
        else if(i==pos) cout<<">";
        else cout<<" ";
    }
    cout << "] " << fixed << setprecision(1) << (progress*100.0) << "% (" << done << "/" << total << ")" << flush;
}

// -------------------- Main --------------------
int main(){
    ios::sync_with_stdio(false); cin.tie(nullptr);

    vector<Node> nodes;
    unordered_map<string, int> cityToNode;  // Map city names to node IDs
    unordered_map<string, string> cityToLabel;  // Map city names to full labels
    
    // ---------- Load cities first ----------
    cerr << "Loading cities..." << endl;
    ifstream cityFile("region_to_region_bidirectional.csv");
    if(!cityFile){ cerr<<"region_to_region_bidirectional.csv not found\n"; return 1; }
    string line;
    getline(cityFile, line); // Skip header
    
    while (getline(cityFile, line)) {
        // Parse CSV: columns are sourceRegion,targetRegion,latency,sourceCity,sourceLat,sourceLon,targetCity,targetLat,targetLon,distance,sourceCountry,targetCountry,sourceLabel,targetLabel,...
        vector<string> fields;
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
        
        if (fields.size() < 14) continue;
        
        string sourceCity = fields[3];
        string sourceLat = fields[4];
        string sourceLon = fields[5];
        string targetCity = fields[6];
        string targetLat = fields[7];
        string targetLon = fields[8];
        string sourceLabel = fields[12];
        string targetLabel = fields[13];
        
        try {
            double lat1 = stod(sourceLat);
            double lon1 = stod(sourceLon);
            double lat2 = stod(targetLat);
            double lon2 = stod(targetLon);
            
            if (cityToNode.find(sourceCity) == cityToNode.end()) {
                int id = nodes.size();
                nodes.push_back({lat1, lon1, {}});
                cityToNode[sourceCity] = id;
                cityToLabel[sourceCity] = sourceLabel;
            }
            
            if (cityToNode.find(targetCity) == cityToNode.end()) {
                int id = nodes.size();
                nodes.push_back({lat2, lon2, {}});
                cityToNode[targetCity] = id;
                cityToLabel[targetCity] = targetLabel;
            }
        } catch (...) {
            // Skip invalid lines
        }
    }
    cityFile.close();
    cerr << "Loaded " << cityToNode.size() << " cities" << endl;

    int numCities = nodes.size();  // Track where cities end and cable nodes begin
    
    // ---------- Load submarine_cables_2d.geojson ----------
    cerr << "Loading cables..." << endl;
    ifstream gj("submarine_cables_2d.geojson");
    if(!gj){ cerr<<"submarine_cables_2d.geojson not found\n"; return 1; }
    string s((istreambuf_iterator<char>(gj)), istreambuf_iterator<char>());
    size_t pos=0; size_t countLS=0, edges=0; 
    
    while(true){
        size_t p=s.find("\"coordinates\"",pos); if(p==string::npos) break;
        p=s.find('[',p); if(p==string::npos) break;
        int depth=0; size_t q=p; bool started=false;
        do{ char c=s[q++]; if(c=='['){depth++; started=true;} else if(c==']'){depth--; if(started && depth==0) break;} } while(q<s.size());
        if(q>=s.size()) break;
        string block=s.substr(p,q-p);
        vector<pair<double,double>> pts;
        double num=0; bool neg=false, inNum=false, afterDot=false; int frac=0;
        vector<double> vals;
        auto pushNum=[&](){ if(!inNum) return; double v=num; if(frac){ for(int i=0;i<frac;++i) v/=10.0; } if(neg)v=-v; vals.push_back(v); num=0; neg=false; inNum=false; afterDot=false; frac=0; };
        for(char c:block){
            if(c=='-' && !inNum){ neg=true; inNum=true; num=0; afterDot=false; frac=0;}
            else if(c>='0'&&c<='9'){ if(!inNum){ inNum=true; num=0; afterDot=false; frac=0;} num=num*10+(c-'0'); if(afterDot) frac++; }
            else if(c=='.'){ if(!inNum){ inNum=true; num=0; afterDot=false; frac=0;} afterDot=true; }
            else pushNum();
        }
        pushNum();
        for(size_t i=0;i+1<vals.size();i+=2) pts.push_back({vals[i+1],vals[i]});
        if(pts.size()>=2){
            countLS++;
            
            // For each cable line, create nodes and connect them
            // Allow connections between cables only at landing points (exact coordinate matches)
            vector<int> cableNodes;
            for(auto& pt : pts) {
                // Check if this coordinate already exists (landing point)
                int existingId = -1;
                for(int i = 0; i < (int)nodes.size(); i++) {
                    if(abs(nodes[i].lat - pt.first) < 1e-6 && abs(nodes[i].lon - pt.second) < 1e-6) {
                        existingId = i;
                        break;
                    }
                }
                
                int id;
                if(existingId != -1) {
                    id = existingId; // Use existing landing point
                } else {
                    id = nodes.size();
                    nodes.push_back({pt.first, pt.second, {}});
                }
                cableNodes.push_back(id);
            }
            
            // Connect consecutive nodes within this cable
            for(size_t i=1;i<cableNodes.size();++i){
                int a = cableNodes[i-1];
                int b = cableNodes[i];
                double d=hav(nodes[a].lat,nodes[a].lon,nodes[b].lat,nodes[b].lon);
                nodes[a].adj.push_back({b,d});
                nodes[b].adj.push_back({a,d});
                edges++;
            }
        }
        pos=q;
    }
    cerr<<"Loaded " <<countLS<<" cables, graph has "<<nodes.size()<<" nodes and "<<edges<<" cable edges\n";
    
    // ---------- Add city-to-cable connections (same continent, 2x penalty) ----------
    cerr << "Connecting cities to cables..." << endl;
    vector<int> cableNodes;
    for (int i = numCities; i < (int)nodes.size(); i++) {
        cableNodes.push_back(i);
    }
    
    int cityToCableConnections = 0;
    for (auto& cityPair : cityToNode) {
        int cityId = cityPair.second;
        string continent = getContinent(nodes[cityId].lat, nodes[cityId].lon);
        
        for (int cableId : cableNodes) {
            string cableContinent = getContinent(nodes[cableId].lat, nodes[cableId].lon);
            if (continent == cableContinent) {
                double dist = hav(nodes[cityId].lat, nodes[cityId].lon,
                                  nodes[cableId].lat, nodes[cableId].lon);
                if (dist <= 2000) {  // 2000km threshold
                    // Weighted distance (INLAND_PENALTY for city to cable)
                    nodes[cityId].adj.push_back({cableId, dist * INLAND_PENALTY});
                    nodes[cableId].adj.push_back({cityId, dist * INLAND_PENALTY});
                    cityToCableConnections++;
                }
            }
        }
    }
    cerr << "Created " << cityToCableConnections << " city-to-cable connections" << endl;
    
    // ---------- Add city-to-city connections (same continent, 2x penalty, no distance limit) ----------
    cerr << "Connecting cities to other cities on same continent..." << endl;
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
                double dist = hav(nodes[city1Id].lat, nodes[city1Id].lon,
                                  nodes[city2Id].lat, nodes[city2Id].lon);
                // Weighted distance (INLAND_PENALTY for inland city-to-city)
                nodes[city1Id].adj.push_back({city2Id, dist * INLAND_PENALTY});
                nodes[city2Id].adj.push_back({city1Id, dist * INLAND_PENALTY});
                cityCityConnections++;
            }
        }
    }
    cerr << "Created " << cityCityConnections << " city-to-city connections (same continent)" << endl;
    
    int totalEdges = 0;
    for (int i = 0; i < (int)nodes.size(); i++) {
        totalEdges += nodes[i].adj.size();
    }
    cerr << "Total edges in graph: " << totalEdges << endl;

        // ---------- Load connections ----------
        ifstream csv("region_to_region_bidirectional.csv");
    if(!csv){ cerr<<"csv not found\n"; return 1; }
    line.clear(); getline(csv,line);
    vector<Conn> conns;
    while(getline(csv,line)){
        vector<string> row; bool inq=false; string cell;
        for(char c:line){ if(c=='"') inq=!inq; else if(c==','&&!inq){ row.push_back(cell); cell.clear();} else cell+=c; }
        row.push_back(cell);
        if(row.size()<16) continue;
        try{
            Conn c; c.latency=stod(row[2]);
            c.slat=stod(row[4]); c.slon=stod(row[5]);
            c.tlat=stod(row[7]); c.tlon=stod(row[8]);
            c.sLabel=row[12]; c.tLabel=row[13];
            conns.push_back(c);
        } catch(...){}
    }
    cerr<<"connections loaded="<<conns.size()<<"\n";

    // ---------- Precompute grid for fast nearest-neighbor ----------
    const double GRID_SIZE=1.0; // 1 degree
    unordered_map<long long,vector<int>> grid;
    auto gridKey=[&](double lat,double lon){ int il=int(floor(lat/GRID_SIZE)), jl=int(floor(lon/GRID_SIZE)); return (long long)il<<32|jl; };
    for(int i=0;i<nodes.size();++i){
        long long k=gridKey(nodes[i].lat,nodes[i].lon);
        grid[k].push_back(i);
    }

    auto nearestK=[&](double lat,double lon,int K,double maxKm){
        vector<pair<double,int>> cableCand, cityCand;
        int il=int(floor(lat/GRID_SIZE)), jl=int(floor(lon/GRID_SIZE));
        // Expand search radius until we have candidates or hit a cap
        for(int r=0; r<=20 && ((int)cableCand.size()<K || (int)cityCand.size()<K); ++r){
            for(int di=-r; di<=r; ++di){
                for(int dj=-r; dj<=r; ++dj){
                    if(abs(di)!=r && abs(dj)!=r) continue; // only ring border
                    long long k = ((long long)(il+di)<<32)|(jl+dj);
                    auto it=grid.find(k); if(it==grid.end()) continue;
                    for(int idx: it->second){
                        double d=hav(lat,lon,nodes[idx].lat,nodes[idx].lon);
                        if(d<=maxKm) {
                            // Separate cable nodes from city nodes
                            if(idx >= numCities) {
                                cableCand.push_back({d,idx});  // Cable node
                            } else {
                                cityCand.push_back({d,idx});   // City node
                            }
                        }
                    }
                }
            }
        }
        // Prefer cable nodes, only use city nodes if not enough cable nodes
        sort(cableCand.begin(),cableCand.end());
        sort(cityCand.begin(),cityCand.end());
        
        vector<pair<double,int>> result;
        // Take up to K cable nodes first
        int numCable = min((int)cableCand.size(), K);
        for(int i=0; i<numCable; i++) result.push_back(cableCand[i]);
        
        // Fill remaining with city nodes if needed
        int remaining = K - numCable;
        for(int i=0; i<min(remaining, (int)cityCand.size()); i++) {
            result.push_back(cityCand[i]);
        }
        
        return result;
    };

    // ---------- Routing ----------
    ofstream out("cable_paths.geojson");
    ofstream fail_csv("unrouted_connections.csv"); fail_csv<<"source_label,target_label,source_lat,source_lon,target_lat,target_lon\n";
    ofstream seg_csv("cable_path_segments.csv"); seg_csv<<"source_label,target_label,segment_index,lon1,lat1,lon2,lat2,cum_km_mid,total_km,percent_mid\n";

    out<<"{\n  \"type\":\"FeatureCollection\",\n  \"features\":[\n";
    bool first=true;
    vector<double> dist(nodes.size());
    vector<int> prev(nodes.size());
    size_t total_attempts = conns.size();

    // Group by source to reuse one Dijkstra per unique source city
    unordered_map<string, vector<size_t>> bySource;
    bySource.reserve(conns.size());
    for(size_t i=0;i<conns.size();++i){ bySource[conns[i].sLabel].push_back(i); }
    size_t done=0;
    for(auto &kv : bySource){
        // Any representative connection provides the source coordinates
        const Conn &rep = conns[kv.second.front()];
        auto sCands = nearestK(rep.slat, rep.slon, 500, 200000.0);
        if(sCands.empty()){ for(size_t idx: kv.second){ const auto &c=conns[idx]; fail_csv<<c.sLabel<<","<<c.tLabel<<","<<c.slat<<","<<c.slon<<","<<c.tlat<<","<<c.tlon<<"\n"; done++; printProgress(done,total_attempts);} continue; }

        // Run a single multi-source Dijkstra for this source city
        fill(dist.begin(),dist.end(),1e18); fill(prev.begin(),prev.end(),-1);
        using P=pair<double,int>; priority_queue<P,vector<P>,greater<P>> pq;
        for(auto &p:sCands){ dist[p.second]=p.first*INLAND_PENALTY; pq.push({dist[p.second],p.second}); }
        while(!pq.empty()){
            auto [d,u]=pq.top(); pq.pop(); if(d!=dist[u]) continue;
            for(auto &e:nodes[u].adj){ if(dist[e.first]>d+e.second){ dist[e.first]=d+e.second; prev[e.first]=u; pq.push({dist[e.first],e.first}); } }
        }

        // For each target under this source, pick the best target candidate and output the path
        for(size_t idx: kv.second){
            const auto &c = conns[idx];
            printProgress(++done,total_attempts);
            auto tCands = nearestK(c.tlat, c.tlon, 500, 200000.0);
            if(tCands.empty()){ fail_csv<<c.sLabel<<","<<c.tLabel<<","<<c.slat<<","<<c.slon<<","<<c.tlat<<","<<c.tlon<<"\n"; continue; }
            int bestTarget=-1; double bestCost=1e18; double bestEndSnap=0.0;
            for(auto &tp: tCands){ 
                double cost = dist[tp.second] + tp.first*INLAND_PENALTY; 
                if(cost < bestCost && cost < 1e17){ // Avoid (0,0) paths by checking reasonable cost
                    bestCost=cost; 
                    bestTarget=tp.second; 
                    bestEndSnap=tp.first; 
                } 
            }
            

            if(bestTarget<0 || bestCost>=1e17){ 
                // Failsafe: create direct connection if no cable path found
                double direct_km = hav(c.slat, c.slon, c.tlat, c.tlon);
                if(direct_km < 50000.0) { // Only for reasonable distances (< 50,000 km)
                    if(!first) out<<",\n"; first=false;
                    out<<"    {\n      \"type\":\"Feature\",\n      \"geometry\":{\"type\":\"LineString\",\"coordinates\":[["<<c.slon<<","<<c.slat<<"],["<<c.tlon<<","<<c.tlat<<"]]},\n      \"properties\":{\n        \"source\":\""<<c.sLabel<<"\",\n        \"target\":\""<<c.tLabel<<"\",\n        \"latency_ms\":"<<c.latency<<",\n        \"cable_distance_km\":"<<direct_km<<",\n        \"straight_distance_km\":"<<direct_km<<",\n        \"start_snap_km\":0.0,\n        \"end_snap_km\":0.0,\n        \"cable_only_km\":"<<direct_km<<"\n      }\n    }";
                    continue;
                } else {
                    fail_csv<<c.sLabel<<","<<c.tLabel<<","<<c.slat<<","<<c.slon<<","<<c.tlat<<","<<c.tlon<<"\n"; 
                    continue; 
                }
            }
            vector<int> path; for(int x=bestTarget;x!=-1;x=prev[x]) path.push_back(x); reverse(path.begin(),path.end());

            // Output GeoJSON + segment CSV
        double cable_only_km=0; for(size_t i=1;i<path.size();++i) cable_only_km += hav(nodes[path[i-1]].lat,nodes[path[i-1]].lon,nodes[path[i]].lat,nodes[path[i]].lon);
         double start_snap_km = hav(c.slat,c.slon,nodes[path.front()].lat,nodes[path.front()].lon);
         double end_snap_km = hav(nodes[path.back()].lat,nodes[path.back()].lon,c.tlat,c.tlon);
        double total = start_snap_km+cable_only_km+end_snap_km;

        double cum=0.0; vector<pair<double,double>> seq; seq.push_back({c.slat,c.slon});
        for(int pid:path) seq.push_back({nodes[pid].lat,nodes[pid].lon});
        seq.push_back({c.tlat,c.tlon});
        for(size_t si=1;si<seq.size();++si){
            double seg_km=hav(seq[si-1].first,seq[si-1].second,seq[si].first,seq[si].second);
            double mid = cum+seg_km/2.0;
            double pct = (total>0? mid/total*100.0:0.0);
            if(si>=2 && si<=seq.size()-2)
                seg_csv<<c.sLabel<<","<<c.tLabel<<","<<(si-1)<<","<<seq[si-1].second<<","<<seq[si-1].first<<","<<seq[si].second<<","<<seq[si].first<<","<<fixed<<setprecision(2)<<mid<<","<<total<<","<<pct<<"\n";
            cum+=seg_km;
        }

         if(!first) out<<",\n"; first=false;
        out<<"    {\n      \"type\":\"Feature\",\n      \"geometry\":{\"type\":\"LineString\",\"coordinates\":[";
        out<<"["<<fixed<<setprecision(6)<<c.slon<<","<<c.slat<<"]";
        for(int pid:path) out<<",["<<fixed<<setprecision(6)<<nodes[pid].lon<<","<<nodes[pid].lat<<"]";
        out<<",["<<fixed<<setprecision(6)<<c.tlon<<","<<c.tlat<<"]";
        out<<"]},\n      \"properties\":{\n";
        out<<"\"source\":\""<<c.sLabel<<"\",\"target\":\""<<c.tLabel<<"\",";
        out<<"\"latency_ms\":"<<fixed<<setprecision(1)<<c.latency<<",";
        out<<"\"cable_distance_km\":"<<fixed<<setprecision(2)<<total<<",";
        out<<"\"straight_distance_km\":"<<fixed<<setprecision(2)<<hav(c.slat,c.slon,c.tlat,c.tlon)<<",";
        out<<"\"start_snap_km\":"<<fixed<<setprecision(2)<<start_snap_km<<",";
        out<<"\"end_snap_km\":"<<fixed<<setprecision(2)<<end_snap_km<<",";
        out<<"\"cable_only_km\":"<<fixed<<setprecision(2)<<cable_only_km<<"\n";
        out<<"      }\n    }";
        }
    }
    out<<"\n  ]\n}\n";
    printProgress(total_attempts,total_attempts);
    cout<<"\nDone.\n";
    return 0;
}
