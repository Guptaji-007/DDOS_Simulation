"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import DeckGL from '@deck.gl/react';
import { ArcLayer, GeoJsonLayer, ScatterplotLayer } from '@deck.gl/layers';

// --- Constants & Config ---
const MAX_ATTACKS = 30; // Strict limit on visible lines
const WORLD_MAP_URL = 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_110m_admin_0_countries.geojson';

const THEME = {
  background: '#050505',      // Deep black/grey
  land: [20, 20, 20],         // Dark land
  border: [60, 60, 60],       // Subtle borders
  sourceColor: [0, 255, 255], // Cyan (Source)
  targetColor: [255, 0, 128], // Hot Pink (Target)
};

export default function AttackMap() {
  const [attacks, setAttacks] = useState<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const url = (typeof window !== 'undefined' && window.location.hostname !== 'localhost')
      ? `wss://${window.location.host}/ws`
      : 'ws://localhost:8000/ws';

    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        const item = {
          id: Math.random().toString(36).substr(2, 9), // Unique ID for keying
          src_lon: data.src_lon,
          src_lat: data.src_lat,
          dst_lon: data.dst_lon,
          dst_lat: data.dst_lat,
          magnitude: data.magnitude || 1,
          attack_type: data.attack_type || "UNKNOWN",
          timestamp: new Date().toLocaleTimeString(),
        };

        // Keep only the last (MAX - 1) items + the new one
        setAttacks(prev => {
          const updated = [...prev, item];
          return updated.length > MAX_ATTACKS ? updated.slice(updated.length - MAX_ATTACKS) : updated;
        });
      } catch (e) { }
    };

    return () => {
      try { ws.close(); } catch (e) {}
    };
  }, []);

  // Filter valid coordinates
  const validData = useMemo(() => {
    return attacks.filter(a => 
      a.src_lon != null && a.src_lat != null && 
      a.dst_lon != null && a.dst_lat != null
    );
  }, [attacks]);

  // --- DeckGL Layers ---

  // 1. Base Map (Dark World)
  const backgroundLayer = new GeoJsonLayer({
    id: 'base-map',
    data: WORLD_MAP_URL,
    stroked: true,
    filled: true,
    lineWidthMinPixels: 1,
    getLineColor: THEME.border,
    getFillColor: THEME.land,
  });

  // 2. The Arcs (Flight paths)
  const arcsLayer = new ArcLayer({
    id: 'attack-arcs',
    data: validData,
    getSourcePosition: d => [d.src_lon, d.src_lat],
    getTargetPosition: d => [d.dst_lon, d.dst_lat],
    getSourceColor: THEME.sourceColor,
    getTargetColor: THEME.targetColor,
    getWidth: 2,
    getHeight: 0.5, // Make arcs taller for a better "orbit" look
  });

  // 3. Impact Points (Glowing circles at destination)
  const impactsLayer = new ScatterplotLayer({
    id: 'impact-points',
    data: validData,
    getPosition: d => [d.dst_lon, d.dst_lat],
    getRadius: d => Math.max(100000, d.magnitude * 5000), // Size based on magnitude
    getFillColor: [255, 0, 128, 150], // Pink with transparency
    stroked: true,
    getLineColor: [255, 255, 255],
    lineWidthMinPixels: 1,
    radiusMinPixels: 3,
    radiusMaxPixels: 30,
    animation: true
  });

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: THEME.background, overflow: 'hidden' }}>
      <DeckGL
        initialViewState={{
          longitude: 0,
          latitude: 20,
          zoom: 1.8,
          pitch: 45, // Tilted specifically for 3D Arc effect
          bearing: 0
        }}
        controller={true}
        layers={[backgroundLayer, arcsLayer, impactsLayer]}
      />

      {/* --- UI OVERLAY: Header --- */}
      <div style={{ 
        position: 'absolute', top: 0, left: 0, right: 0, 
        padding: '20px', background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
        pointerEvents: 'none', zIndex: 10
      }}>
        <h1 style={{ color: '#fff', margin: 0, fontFamily: 'monospace', fontSize: '24px', textTransform: 'uppercase', letterSpacing: '2px' }}>
          <span style={{ color: 'rgb(255, 0, 128)' }}>●</span> Live Threat Intelligence
        </h1>
        <p style={{ color: '#888', margin: '5px 0 0 0', fontFamily: 'monospace', fontSize: '12px' }}>
          Secure Socket Layer • Real-time Monitoring
        </p>
      </div>

      {/* --- UI OVERLAY: Attack Log (Terminal Style) --- */}
      <div style={{
        position: 'absolute', bottom: 20, left: 20,
        width: '350px', maxHeight: '300px',
        background: 'rgba(10, 10, 10, 0.85)',
        border: '1px solid #333',
        borderRadius: '8px',
        padding: '15px',
        fontFamily: 'monospace',
        backdropFilter: 'blur(4px)',
        overflow: 'hidden',
        boxShadow: '0 0 20px rgba(0,0,0,0.5)',
        zIndex: 10
      }}>
        <div style={{ borderBottom: '1px solid #333', paddingBottom: '8px', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#aaa', fontSize: '12px', fontWeight: 'bold' }}>EVENT LOG</span>
          <span style={{ color: 'rgb(0, 255, 255)', fontSize: '12px' }}>{attacks.length} ACTIVE</span>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '6px', overflowY: 'auto', maxHeight: '220px' }}>
          {attacks.length === 0 && <div style={{color: '#444', fontSize: '12px'}}>Waiting for traffic...</div>}
          
          {attacks.map((atk) => (
            <div key={atk.id} style={{ fontSize: '11px', display: 'flex', justifyContent: 'space-between', borderLeft: `2px solid ${THEME.targetColor}` , paddingLeft: '8px' }}>
              <div>
                <span style={{ color: '#fff' }}>{atk.attack_type.toUpperCase()}</span>
                <br/>
                <span style={{ color: '#666' }}>{atk.src_lon?.toFixed(1)},{atk.src_lat?.toFixed(1)} &rarr; TARGET</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: 'rgb(255, 0, 128)' }}>MAG {atk.magnitude}</span>
                <br/>
                <span style={{ color: '#444' }}>{atk.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- UI OVERLAY: Status Indicator --- */}
      <div style={{
        position: 'absolute', top: 20, right: 20,
        display: 'flex', alignItems: 'center', gap: '8px',
        background: 'rgba(0,0,0,0.6)', padding: '8px 12px', borderRadius: '20px',
        border: '1px solid #333',
        zIndex: 10
      }}>
        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0f0', boxShadow: '0 0 8px #0f0' }}></div>
        <span style={{ color: '#fff', fontFamily: 'monospace', fontSize: '12px' }}>SYSTEM ONLINE</span>
      </div>
    </div>
  );
}