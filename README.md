DDOS Simulation - Continuous Workflow

Setup

1. Create a Python virtualenv and install deps:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

2. (Optional) Install Node deps for the `simulation` Next.js app:

```bash
cd simulation
npm install
```

Run

1. Start the continuous traffic generator (append mode):

```bash
source .venv/bin/activate
python data_gen.py --continuous --file network_traffic.jsonl
```

2. Start the backend WebSocket server (reads and enriches `network_traffic.jsonl`):

```bash
python backend_server.py
```

3. Start the Next.js frontend (from `simulation`):

```bash
cd simulation
npm run dev
```

Notes

- The backend expects the GeoLite2 database at `GeoLite2-City_20251226/GeoLite2-City.mmdb` as in the repo.
- The frontend uses `NEXT_PUBLIC_MAPBOX_TOKEN` if you want Mapbox tiles. Without a token, map rendering may fail; you can replace the `mapStyle` and provider with MapLibre if desired.
