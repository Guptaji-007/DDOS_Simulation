```markdown
# DDOS Simulation - Continuous Workflow

A real-time cyber threat visualization dashboard on random generated data using Next.js 16, React 19, Deck.gl, and FastAPI.

## Setup

### 1. Backend (Python)
Create a virtual environment and install dependencies:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

**Note:** The backend requires the GeoLite2 database. Ensure `GeoLite2-City_20251226/GeoLite2-City.mmdb` is present in the root directory (as per the repository structure).

### 2. Frontend (Next.js)

Install the Node.js dependencies.

*Update:* This project now uses a "Pure DeckGL" approach with a vector base map. **No Mapbox API token is required.**

```bash
cd simulation
npm install
```

---

## Run

### 1. Start Traffic Generator

This script generates synthetic network traffic and appends it to a JSONL file.

```bash
# In the root directory
source .venv/bin/activate
python data_gen.py --continuous --file network_traffic.jsonl
```

### 2. Start Backend Server

This WebSocket server tails the traffic file, enriches IPs with GeoLocation data, and broadcasts to the frontend.

```bash
# In a new terminal (root directory)
source .venv/bin/activate
python backend_server.py
```

### 3. Start Frontend Dashboard

Launch the visualization interface.

```bash
# In a new terminal
cd simulation
npm run dev
```

Open [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000) to view the live attack map.

---

## Architecture & Notes

* **Frontend**: Built with **Next.js 16** and **React 19**. It uses `deck.gl` to render a lightweight GeoJSON world map and animated 3D arcs. It connects to the backend via WebSockets (`ws://localhost:8000/ws`).
* **Visuals**: The map features a "Dark/Cyber" theme with:
* **Live Attack Log**: A terminal-style sidebar showing real-time hits.
* **Impact Layer**: Glowing indicators where attacks land.
* **Queue Limit**: For performance and aesthetics, the map visualizes a rolling window of the latest 20 attacks.


* **Troubleshooting**:
* If you see `WS error` in the browser console, ensure `backend_server.py` is running.
* If no lines appear, ensure `data_gen.py` is running and generating valid coordinates.
