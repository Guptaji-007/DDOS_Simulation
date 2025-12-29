# DDoS Simulation – Real-Time Cyber Threat Dashboard

A real-time cyber threat visualization dashboard that simulates distributed denial-of-service (DDoS) traffic using randomly generated data. The system streams live attack events to an interactive 3D global map.

Built with Next.js 16, React 19, Deck.gl, and FastAPI.

---

## Features

- Live global attack visualization with animated 3D arcs
- Real-time data streaming via WebSockets
- Synthetic network traffic generator
- Pure Deck.gl rendering with a vector base map
- No Mapbox API token required
- Live attack log with a terminal-style interface
- Performance-optimized rolling window of the latest 30 attacks

---

## Tech Stack

### Frontend
- Next.js 16
- React 19
- deck.gl
- WebSockets (ws://localhost:8000/ws)

### Backend
- Python
- FastAPI
- WebSockets
- GeoLite2 IP geolocation database

---


## Setup

### 1. Backend (Python)

Create and activate a virtual environment, then install dependencies:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```
Important:
The backend requires the GeoLite2 City database. Ensure the following file exists in the project root:
GeoLite2-City_20251226/GeoLite2-City.mmdb

2. Frontend (Next.js)
Install Node.js dependencies:

```bash
cd simulation
npm install
```
Note:
This project uses a pure Deck.gl vector map. No Mapbox API key is required.

Running the Project
1. Start the Traffic Generator
Generates continuous synthetic network traffic and appends it to a JSONL file.

```bash
# From the project root
source .venv/bin/activate
python data_gen.py --continuous --file network_traffic.jsonl
```

2. Start the Backend Server
Tails the traffic file, enriches IPs with geolocation data, and streams events via WebSockets.

```bash
# In a new terminal (project root)
source .venv/bin/activate
python backend_server.py
```

3. Start the Frontend Dashboard
Launch the visualization interface:

```bash
# In a new terminal
cd simulation
npm run dev
Open your browser at:http://localhost:3000
```

## Architecture Overview

```arduino

[ data_gen.py ]
        |
        v
[ network_traffic.jsonl ]
        |
        v
[ FastAPI WebSocket Server ]
        |
        v
[ Next.js + Deck.gl Frontend ]

Traffic events are generated continuously

Backend enriches events with GeoIP data

Frontend renders attacks in real time

```

## Troubleshooting

WebSocket connection errors:
Ensure backend_server.py is running
Verify ws://localhost:8000/ws is reachable

No attacks visible:
Confirm data_gen.py is running
Ensure generated traffic contains valid coordinates

Frontend not loading:
Verify Node.js version compatibility
Re-run npm install

## Disclaimer
This project is for visualization purposes only.
It does not perform real attacks and must not be used for malicious activity.