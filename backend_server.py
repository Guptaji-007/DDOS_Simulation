import asyncio
import json
import os
from typing import List

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import uvicorn

import backend

app = FastAPI()

clients: List[WebSocket] = []


async def tail_file_and_broadcast(filename: str):
    """Tail `filename` and broadcast new JSON lines to connected WebSocket clients."""
    if not os.path.exists(filename):
        open(filename, "a").close()

    with open(filename, "r") as fh:
        # Move to the end
        fh.seek(0, os.SEEK_END)
        while True:
            line = fh.readline()
            if not line:
                await asyncio.sleep(0.25)
                continue
            line = line.strip()
            if not line:
                continue
            try:
                pkt = json.loads(line)
            except json.JSONDecodeError:
                continue

            # Enrich with GeoIP for source and destination
            src_loc = backend.get_location(pkt.get("source_ip"))
            dst_loc = backend.get_location(pkt.get("destination_ip"))

            enriched = {
                "timestamp": pkt.get("timestamp"),
                "attack_type": pkt.get("attack_type"),
                "magnitude": pkt.get("magnitude"),
                "source_ip": pkt.get("source_ip"),
                "destination_ip": pkt.get("destination_ip"),
                "src_lat": src_loc["lat"] if src_loc else None,
                "src_lon": src_loc["lon"] if src_loc else None,
                "src_country": src_loc["country"] if src_loc else None,
                "dst_lat": dst_loc["lat"] if dst_loc else None,
                "dst_lon": dst_loc["lon"] if dst_loc else None,
                "dst_country": dst_loc["country"] if dst_loc else None,
            }

            # Broadcast to all connected clients
            disconnected = []
            for ws in clients:
                try:
                    await ws.send_text(json.dumps(enriched))
                except Exception:
                    disconnected.append(ws)

            for d in disconnected:
                try:
                    clients.remove(d)
                except ValueError:
                    pass


@app.on_event("startup")
async def startup_event():
    # Start tailing the traffic file in background
    filename = os.path.join(os.path.dirname(__file__), "network_traffic.jsonl")
    asyncio.create_task(tail_file_and_broadcast(filename))


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    clients.append(websocket)
    try:
        while True:
            # keep connection alive; the server pushes data
            await websocket.receive_text()
    except WebSocketDisconnect:
        try:
            clients.remove(websocket)
        except ValueError:
            pass


if __name__ == "__main__":
    uvicorn.run("backend_server:app", host="0.0.0.0", port=8000, reload=False)
