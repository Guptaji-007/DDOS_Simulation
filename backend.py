import geoip2.database
import json

# Load the free MaxMind database (you need to download the .mmdb file)
reader = geoip2.database.Reader('your_mmdb_file.mmdb')

def get_location(ip):
    try:
        response = reader.city(ip)
        return {
            "lat": response.location.latitude,
            "lon": response.location.longitude,
            "country": response.country.name
        }
    except:
        return None # Handle private/local IPs that don't map

def load_traffic(filename):
    packets = []
    with open(filename, "r") as file:
        for line_num, line in enumerate(file, 1):
            line = line.strip()
            if not line:
                continue
            try:
                packets.append(json.loads(line))
            except json.JSONDecodeError as e:
                print(f"Skipping bad line {line_num}: {e}")
    return packets


if __name__ == "__main__":
    traffic_data = load_traffic("network_traffic.jsonl")
    for i in range(len(traffic_data)):
        print(get_location(traffic_data[i]['source_ip']))