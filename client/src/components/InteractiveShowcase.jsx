import React, { useEffect, useRef, useState } from "react";
import { geoOrthographic, geoPath, geoGraticule10, geoInterpolate } from "d3-geo";
import { feature, mesh } from "topojson-client";
import countries110 from "world-atlas/countries-110m.json";
import land110 from "world-atlas/land-110m.json";

// InteractiveShowcase: Mapped Globe
// - Rotating orthographic globe with real continent outlines (no faux mask)
// - Clean monochrome look: subtle land fill, bright coastlines and borders, faint graticule

const InteractiveShowcase = ({ asBackground = false, globeAlign = 'center' }) => {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const cursorGlowRef = useRef(null);
  const [isDark, setIsDark] = useState(() => (
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  ));

  // Watch for theme toggles by observing the <html> class changes
  useEffect(() => {
    const el = document.documentElement;
    const update = () => setIsDark(el.classList.contains('dark'));
    update();
    const mo = new MutationObserver(update);
    mo.observe(el, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, []);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });

    // Sizing / DPR
    let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    let width = 0, height = 0;
    // Track globe center for proper screen-space arc lifting
    let cx = 0, cy = 0, sphereR = 0;

    // Motion prefs
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Projection & path
    const projection = geoOrthographic();
    const path = geoPath(projection, ctx);
    const graticule = geoGraticule10();

  // Geo data from TopoJSON
    const worldCountries = feature(countries110, countries110.objects?.countries || countries110.objects);
    // Prefer dedicated land topology when available for clean coastline
    const worldLand = feature(land110, land110.objects?.land || land110.objects);
    // Country borders (interior boundaries only)
    const borders = mesh(countries110, countries110.objects?.countries || countries110.objects, (a, b) => a !== b);

  // Connectivity arcs config/colors and sample set
  // Use a single brand green for arcs and beacons
  const BRAND_GREEN = "#16DB65"; // matches accent-primary vibe
  const BRAND_GREEN_DARK = "#0E7A35"; // darker variant for light theme arc strokes
  // Global multiplier to reduce arc curvature (screen-space lift). Lower = flatter arcs.
  const ARC_LIFT_SCALE = 0.6;
    const sampleArcs = [
  { order: 1, startLat: -19.885592, startLng: -43.951191, endLat: -22.9068, endLng: -43.1729, arcAlt: 0.1, color: BRAND_GREEN },
  { order: 1, startLat: 28.6139, startLng: 77.209, endLat: 3.139, endLng: 101.6869, arcAlt: 0.2, color: BRAND_GREEN },
  { order: 1, startLat: -19.885592, startLng: -43.951191, endLat: -1.303396, endLng: 36.852443, arcAlt: 0.5, color: BRAND_GREEN },
  { order: 2, startLat: 1.3521, startLng: 103.8198, endLat: 35.6762, endLng: 139.6503, arcAlt: 0.2, color: BRAND_GREEN },
  { order: 2, startLat: 51.5072, startLng: -0.1276, endLat: 3.139, endLng: 101.6869, arcAlt: 0.3, color: BRAND_GREEN },
  { order: 2, startLat: -15.785493, startLng: -47.909029, endLat: 36.162809, endLng: -115.119411, arcAlt: 0.3, color: BRAND_GREEN },
  { order: 3, startLat: -33.8688, startLng: 151.2093, endLat: 22.3193, endLng: 114.1694, arcAlt: 0.3, color: BRAND_GREEN },
  { order: 3, startLat: 21.3099, startLng: -157.8581, endLat: 40.7128, endLng: -74.006, arcAlt: 0.3, color: BRAND_GREEN },
  { order: 3, startLat: -6.2088, startLng: 106.8456, endLat: 51.5072, endLng: -0.1276, arcAlt: 0.3, color: BRAND_GREEN },
  { order: 4, startLat: 11.986597, startLng: 8.571831, endLat: -15.595412, endLng: -56.05918, arcAlt: 0.5, color: BRAND_GREEN },
  { order: 4, startLat: -34.6037, startLng: -58.3816, endLat: 22.3193, endLng: 114.1694, arcAlt: 0.7, color: BRAND_GREEN },
  { order: 4, startLat: 51.5072, startLng: -0.1276, endLat: 48.8566, endLng: -2.3522, arcAlt: 0.1, color: BRAND_GREEN },
  { order: 5, startLat: 14.5995, startLng: 120.9842, endLat: 51.5072, endLng: -0.1276, arcAlt: 0.3, color: BRAND_GREEN },
  { order: 5, startLat: 1.3521, startLng: 103.8198, endLat: -33.8688, endLng: 151.2093, arcAlt: 0.2, color: BRAND_GREEN },
  { order: 5, startLat: 34.0522, startLng: -118.2437, endLat: 48.8566, endLng: -2.3522, arcAlt: 0.2, color: BRAND_GREEN },
  { order: 6, startLat: -15.432563, startLng: 28.315853, endLat: 1.094136, endLng: -63.34546, arcAlt: 0.7, color: BRAND_GREEN },
  { order: 6, startLat: 37.5665, startLng: 126.978, endLat: 35.6762, endLng: 139.6503, arcAlt: 0.1, color: BRAND_GREEN },
  { order: 6, startLat: 22.3193, startLng: 114.1694, endLat: 51.5072, endLng: -0.1276, arcAlt: 0.3, color: BRAND_GREEN },
  { order: 7, startLat: -19.885592, startLng: -43.951191, endLat: -15.595412, endLng: -56.05918, arcAlt: 0.1, color: BRAND_GREEN },
  { order: 7, startLat: 48.8566, startLng: -2.3522, endLat: 52.52, endLng: 13.405, arcAlt: 0.1, color: BRAND_GREEN },
  { order: 7, startLat: 52.52, startLng: 13.405, endLat: 34.0522, endLng: -118.2437, arcAlt: 0.2, color: BRAND_GREEN },
  { order: 8, startLat: -8.833221, startLng: 13.264837, endLat: -33.936138, endLng: 18.436529, arcAlt: 0.2, color: BRAND_GREEN },
  { order: 8, startLat: 49.2827, startLng: -123.1207, endLat: 52.3676, endLng: 4.9041, arcAlt: 0.2, color: BRAND_GREEN },
  { order: 8, startLat: 1.3521, startLng: 103.8198, endLat: 40.7128, endLng: -74.006, arcAlt: 0.5, color: BRAND_GREEN },
  { order: 9, startLat: 51.5072, startLng: -0.1276, endLat: 34.0522, endLng: -118.2437, arcAlt: 0.2, color: BRAND_GREEN },
  { order: 9, startLat: 22.3193, startLng: 114.1694, endLat: -22.9068, endLng: -43.1729, arcAlt: 0.7, color: BRAND_GREEN },
  { order: 9, startLat: 1.3521, startLng: 103.8198, endLat: -34.6037, endLng: -58.3816, arcAlt: 0.5, color: BRAND_GREEN },
  { order: 10, startLat: -22.9068, startLng: -43.1729, endLat: 28.6139, endLng: 77.209, arcAlt: 0.7, color: BRAND_GREEN },
  { order: 10, startLat: 34.0522, startLng: -118.2437, endLat: 31.2304, endLng: 121.4737, arcAlt: 0.3, color: BRAND_GREEN },
  { order: 10, startLat: -6.2088, startLng: 106.8456, endLat: 52.3676, endLng: 4.9041, arcAlt: 0.3, color: BRAND_GREEN },
  { order: 11, startLat: 41.9028, startLng: 12.4964, endLat: 34.0522, endLng: -118.2437, arcAlt: 0.2, color: BRAND_GREEN },
  { order: 11, startLat: -6.2088, startLng: 106.8456, endLat: 31.2304, endLng: 121.4737, arcAlt: 0.2, color: BRAND_GREEN },
  { order: 11, startLat: 22.3193, startLng: 114.1694, endLat: 1.3521, endLng: 103.8198, arcAlt: 0.2, color: BRAND_GREEN },
  { order: 12, startLat: 34.0522, startLng: -118.2437, endLat: 37.7749, endLng: -122.4194, arcAlt: 0.1, color: BRAND_GREEN },
  { order: 12, startLat: 35.6762, startLng: 139.6503, endLat: 22.3193, endLng: 114.1694, arcAlt: 0.2, color: BRAND_GREEN },
  { order: 12, startLat: 22.3193, startLng: 114.1694, endLat: 34.0522, endLng: -118.2437, arcAlt: 0.3, color: BRAND_GREEN },
  { order: 13, startLat: 52.52, startLng: 13.405, endLat: 22.3193, endLng: 114.1694, arcAlt: 0.3, color: BRAND_GREEN },
  { order: 13, startLat: 11.986597, startLng: 8.571831, endLat: 35.6762, endLng: 139.6503, arcAlt: 0.3, color: BRAND_GREEN },
  { order: 13, startLat: -22.9068, startLng: -43.1729, endLat: -34.6037, endLng: -58.3816, arcAlt: 0.1, color: BRAND_GREEN },
      { order: 14, startLat: -33.936138, startLng: 18.436529, endLat: 21.395643, endLng: 39.883798, arcAlt: 0.3, color: BRAND_GREEN },
    ];

    // Shuffle helper for cycling arcs without repetition
    function shuffle(arr) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }
    const ARC_BATCH_SIZE = 3;
    const ARC_ROTATE_MS = 3500;
    let arcOrder = shuffle(sampleArcs.map((_, i) => i));
    let arcIdx = 0;
    let lastSwitch = performance.now();
    let nextSwitch = lastSwitch + ARC_ROTATE_MS;
    function currentArcBatchIndices() {
      const idxs = [];
      for (let k = 0; k < ARC_BATCH_SIZE; k++) {
        const idx = (arcIdx + k) % arcOrder.length;
        idxs.push(arcOrder[idx]);
      }
      return idxs;
    }

    // Helper to draw a ring with soft edge
    function drawRing(x, y, r, color, alpha = 1, line = 1.2) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = line;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // Helpers to draw filled glowing circles (beacons)
    function hexToRgb(hex) {
      let h = hex.replace('#', '');
      if (h.length === 3) {
        h = h.split('').map(c => c + c).join('');
      }
      const num = parseInt(h, 16);
      const r = (num >> 16) & 255;
      const g = (num >> 8) & 255;
      const b = num & 255;
      return { r, g, b };
    }
    function rgbaStr(color, a) {
      try {
        if (typeof color === 'string' && color.startsWith('#')) {
          const { r, g, b } = hexToRgb(color);
          return `rgba(${r},${g},${b},${a})`;
        }
      } catch {}
      // fallback: rely on globalAlpha outside if non-hex
      return color;
    }
    function drawBeacon(x, y, r, color, intensity = 1) {
      ctx.save();
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
      grad.addColorStop(0.0, rgbaStr(color, 0.95 * intensity));
      grad.addColorStop(0.5, rgbaStr(color, 0.45 * intensity));
      grad.addColorStop(1.0, rgbaStr(color, 0.00));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      // subtle rim for definition
      ctx.strokeStyle = rgbaStr('#ffffff', 0.5 * intensity);
      ctx.lineWidth = 1.0;
      ctx.stroke();
      ctx.restore();
    }

    // Front-hemisphere test vs current projection center
    function isFront(lonDeg, latDeg, centerLonDeg, centerLatDeg) {
      const toRad = Math.PI / 180;
      const λ = lonDeg * toRad, φ = latDeg * toRad;
      const λc = centerLonDeg * toRad, φc = centerLatDeg * toRad;
      const cosc = Math.sin(φ) * Math.sin(φc) + Math.cos(φ) * Math.cos(φc) * Math.cos(λ - λc);
      return cosc >= 0;
    }

    // Rotation state (degrees)
  let lon = 0;                 // rotation around Y (λ)
  let latBase = -10;           // base tilt (φ)
  let latHover = 0;            // mouse-induced tilt (vertical)
  let lonHover = 0;            // mouse-induced yaw (horizontal)
    const spin = reduceMotion ? 0.006 : 0.02; // degrees per ms

    function resize() {
      const rect = wrapper.getBoundingClientRect();
      width = Math.max(300, Math.floor(rect.width));
      height = Math.max(300, Math.floor(rect.height));
      dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const rLocal = Math.min(width, height) * 0.42;
      // Position globe horizontally based on globeAlign (left/center/right)
      let cxFactor = 0.5;
      if (globeAlign === 'left') cxFactor = 0.28;
      else if (globeAlign === 'right') cxFactor = 0.72;
      const cxLocal = width * cxFactor;
      const cyLocal = height * 0.5;
      // persist for use in animation/lift
      cx = cxLocal; cy = cyLocal; sphereR = rLocal;
      projection
        .fitExtent([[cxLocal - rLocal, cyLocal - rLocal], [cxLocal + rLocal, cyLocal + rLocal]], { type: "Sphere" })
        .precision(0.5);
    }
    resize();

  // Mouse interaction (subtle lat tilt and cursor glow)
    const cursor = { x: 0, y: 0, inside: false };
    const onEnter = () => { cursor.inside = true; if (cursorGlowRef.current) cursorGlowRef.current.style.opacity = '1'; };
    const onLeave = () => { cursor.inside = false; if (cursorGlowRef.current) cursorGlowRef.current.style.opacity = '0'; };
    const onMove = (e) => {
      const r = wrapper.getBoundingClientRect();
      cursor.x = (e.clientX - r.left) / r.width * 2 - 1;
      cursor.y = (e.clientY - r.top) / r.height * 2 - 1;
      // tilt latitude up to ±18°
      latHover = (cursor.y || 0) * 18;
      // steer longitude (yaw) up to ±35°
      lonHover = (cursor.x || 0) * 35;
      if (cursorGlowRef.current) {
        const gx = (e.clientX - r.left);
        const gy = (e.clientY - r.top);
        cursorGlowRef.current.style.left = `${gx}px`; cursorGlowRef.current.style.top = `${gy}px`;
      }
    };
    let cleanup;
    if (asBackground) {
      const onWindowMove = (e) => { onEnter(); onMove(e); };
      window.addEventListener('mousemove', onWindowMove);
      window.addEventListener('mouseenter', onEnter);
      window.addEventListener('mouseleave', onLeave);
      cleanup = () => {
        window.removeEventListener('mousemove', onWindowMove);
        window.removeEventListener('mouseenter', onEnter);
        window.removeEventListener('mouseleave', onLeave);
      };
    } else {
      wrapper.addEventListener('mouseenter', onEnter);
      wrapper.addEventListener('mouseleave', onLeave);
      wrapper.addEventListener('mousemove', onMove);
      cleanup = () => {
        wrapper.removeEventListener('mouseenter', onEnter);
        wrapper.removeEventListener('mouseleave', onLeave);
        wrapper.removeEventListener('mousemove', onMove);
      };
    }

    // Drawing helpers
    function strokePath(obj, style, width = 1, alpha = 1) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = style;
      ctx.lineWidth = width;
      ctx.beginPath();
      path(obj);
      ctx.stroke();
      ctx.restore();
    }
    function fillPath(obj, style, alpha = 1) {
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = style;
      ctx.beginPath();
      path(obj);
      ctx.fill();
      ctx.restore();
    }

    // Animation
    let last = performance.now();
    let raf = 0;
    // Theme-aware colors (invert for light mode)
    const BG = isDark ? '#000' : '#fff';
    const SPHERE_RIM = isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)';
    const GRAT = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.12)';
    const LAND_FILL_COLOR = isDark ? 'white' : 'black';
    const LAND_FILL_ALPHA = isDark ? 0.10 : 0.08;
    const COAST = isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.85)';
    const BORDERS = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)';

    function frame(now) {
  const dt = Math.min(32, now - last); last = now;
  lon = (lon + spin * dt) % 360;
  const lat = latBase + (cursor.inside ? latHover : 0);
  const lonView = lon + (cursor.inside ? lonHover : 0);
  const latView = lat;
  projection.rotate([lonView, -latView, 0]);

      // clear
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, width, height);

      // Sphere rim
      strokePath({ type: 'Sphere' }, SPHERE_RIM, 1.2);

  // Graticule (front hemisphere is auto-clipped by orthographic)
      strokePath(graticule, GRAT, 0.6);

      // Land fill for continent mass
      fillPath(worldLand, LAND_FILL_COLOR, LAND_FILL_ALPHA);

      // Coastline (land outline)
      strokePath(worldLand, COAST, 1.1, 0.9);

      // Country borders (interior boundaries) subtle
      strokePath(borders, BORDERS, 0.6, 0.8);

  // Connectivity arcs (solid green strokes) + origin/destination beacons
  ctx.save();
  // On dark backgrounds, 'lighter' gives a glow; on light backgrounds it washes to white.
  // Use normal compositing in light mode to preserve green color.
  ctx.globalCompositeOperation = isDark ? 'lighter' : 'source-over';
      ctx.lineCap = 'round';
      // rotate arc batch over time
      if (now >= nextSwitch) {
        arcIdx = (arcIdx + ARC_BATCH_SIZE) % arcOrder.length;
        lastSwitch = now;
        // reshuffle at cycle end for freshness
        if (arcIdx === 0) arcOrder = shuffle(arcOrder);
        nextSwitch = now + ARC_ROTATE_MS;
      }
      const fade = Math.min(1, (now - lastSwitch) / 400); // quick fade-in
      const batch = currentArcBatchIndices();
      for (const arcIndex of batch) {
        const arc = sampleArcs[arcIndex];
        const interp = geoInterpolate([arc.startLng, arc.startLat], [arc.endLng, arc.endLat]);
        const steps = 64;
        // Solid line: no dashes
        ctx.setLineDash([]);
        const speed = 0.8 + 0.15 * ((arc.order || 1) % 7);
        // Keep slight motion by varying globalAlpha over time if desired (skip for now)
        const ARC_COLOR = isDark ? (arc.color || BRAND_GREEN) : BRAND_GREEN_DARK;
        const BEACON_COLOR = BRAND_GREEN; // keep beacons bright green in both themes
        ctx.strokeStyle = ARC_COLOR;
        ctx.lineWidth = 1.1 + (arc.arcAlt || 0) * 1.2;

        // Build and draw visible segments only
        let open = false;
        ctx.globalAlpha = 0.75 * fade;
        ctx.beginPath();
        for (let i = 0; i <= steps; i++) {
          const t = i / steps;
          const [λ, φ] = interp(t);
          // clip to front hemisphere using current center
          const visible = isFront(λ, φ, -lonView, latView);
          if (!visible) {
            if (open) { ctx.stroke(); ctx.beginPath(); open = false; }
            continue;
          }
          const p = projection([λ, φ]);
          if (!p) {
            if (open) { ctx.stroke(); ctx.beginPath(); open = false; }
            continue;
          }
          // Lift in screen space for 3D-like arc (scaled to reduce curvature)
          const lift = (arc.arcAlt || 0) * ARC_LIFT_SCALE * Math.sin(Math.PI * t);
          // Lift relative to actual globe center (works for left/center/right alignments)
          const lx = cx + (p[0] - cx) * (1 + lift);
          const ly = cy + (p[1] - cy) * (1 + lift);
          if (!open) { ctx.moveTo(lx, ly); open = true; } else { ctx.lineTo(lx, ly); }
        }
        if (open) ctx.stroke();

        // Origin pulsing ring
  const originVisible = isFront(arc.startLng, arc.startLat, -lonView, latView);
  const destVisible = isFront(arc.endLng, arc.endLat, -lonView, latView);
        const p0 = projection([arc.startLng, arc.startLat]);
        const p1 = projection([arc.endLng, arc.endLat]);
        const baseR = Math.max(4, Math.min(width, height) * 0.012);
        // Pulse period uses speed to vary slightly per arc
        const period = 1000 + (arc.order % 5) * 200; // ms
        const pulse = (now % period) / period; // 0..1
        const ringR = baseR * (0.8 + 1.6 * pulse);
        if (originVisible && p0) {
          drawBeacon(p0[0], p0[1], ringR, BEACON_COLOR, 1.0 * fade);
        }

        // Destination ripple triggered by “arrival” loop
        // Align arrival every ARC_ROTATE_MS (same cadence as arc batch change)
        const arrivePhase = ((now - lastSwitch) % ARC_ROTATE_MS) / ARC_ROTATE_MS; // 0..1
        // ripple stronger towards the end of batch window
        const ripple = Math.max(0, (arrivePhase - 0.65) / 0.35); // starts after 65%
        if (destVisible && p1 && ripple > 0) {
          const rr = baseR * (1.0 + 3.2 * ripple);
          const intensity = (1 - ripple) * fade * 1.05;
          drawBeacon(p1[0], p1[1], rr, BEACON_COLOR, intensity);
        }
      }
      ctx.restore();

      raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    const ro = new ResizeObserver(() => resize());
    ro.observe(wrapper);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      cleanup && cleanup();
    };
  }, [isDark, asBackground, globeAlign]);

  const wrapperStyle = asBackground
    ? { position: 'absolute', inset: 0, width: '100%', height: '100%', minHeight: '100vh', pointerEvents: 'none' }
    : { width: '100%', height: '100%', minHeight: '100vh' };
  const wrapperClass = asBackground ? 'absolute inset-0' : 'relative';
  return (
    <div ref={wrapperRef} className={wrapperClass} style={wrapperStyle}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div ref={cursorGlowRef} className="cursor-glow" style={{ opacity: 0, left: 0, top: 0 }} />
    </div>
  );
};

export default InteractiveShowcase;
