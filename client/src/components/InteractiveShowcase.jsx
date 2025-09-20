import React, { useEffect, useRef } from "react";

// InteractiveShowcase: Networked Globe
// - Rotating orthographic globe made of glowing dots with subtle network lines
// - Black background, white monochrome look like the reference image

const InteractiveShowcase = () => {
  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const cursorGlowRef = useRef(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });

    // Sizing
    let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    let width = 0, height = 0, radius = 0;
    let cx = 0, cy = 0;

    // Motion prefs
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Globe state (rotation)
    let rotY = 0;        // longitude rotation
    let rotX = -0.15;    // slight tilt
    let spin = reduceMotion ? 0.0002 : 0.0006; // radians per ms

    // Generate points on sphere (Fibonacci sphere)
    function fibSphere(n) {
      const pts = new Array(n);
      const phi = Math.PI * (3 - Math.sqrt(5)); // golden angle
      for (let i = 0; i < n; i++) {
        const y = 1 - (i / (n - 1)) * 2; // y in [1,-1]
        const r = Math.sqrt(1 - y * y);
        const theta = i * phi;
        const x = Math.cos(theta) * r;
        const z = Math.sin(theta) * r;
        pts[i] = { x, y, z };
      }
      return pts;
    }

    // Simple pseudo land-mask using spherical harmonics-like blend
    function fauxLand(v) {
      // v: unit vector {x,y,z} on sphere
      // value in [-1,1]; thresholded to create continents-like patches
      const { x, y, z } = v;
      const a = Math.sin(3.2 * Math.asin(y)) * Math.cos(4.6 * Math.atan2(z, x));
      const b = 0.45 * Math.sin(7.1 * Math.atan2(z, x) + 2.2 * Math.asin(y));
      return a + b - 0.1; // tweak to get ~40-45% land coverage
    }

    // Rotation helpers
    function rotYMat(v, a) { // rotate around Y
      const ca = Math.cos(a), sa = Math.sin(a);
      return { x: ca * v.x + sa * v.z, y: v.y, z: -sa * v.x + ca * v.z };
    }
    function rotXMat(v, a) { // rotate around X
      const ca = Math.cos(a), sa = Math.sin(a);
      return { x: v.x, y: ca * v.y - sa * v.z, z: sa * v.y + ca * v.z };
    }

    function project(v) { // orthographic
      return { x: cx + radius * v.x, y: cy + radius * v.y, z: v.z };
    }

    // Build points and subset for network
    let points = [];
    let anchorsIdx = [];
    let neighbors = [];

    function rebuildPoints() {
      const N = reduceMotion ? 1100 : 2200;
      points = fibSphere(N);

      // pick anchors biased to land-ish areas for nicer silhouettes
      anchorsIdx = [];
      for (let i = 0; i < points.length; i++) {
        if ((i % 20 === 0) && fauxLand(points[i]) > -0.05) anchorsIdx.push(i);
      }
      // limit anchors for performance
      if (anchorsIdx.length > 140) anchorsIdx = anchorsIdx.slice(0, 140);
    }

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

      radius = Math.min(width, height) * 0.38;
      cx = width * 0.5;
      cy = height * 0.52;

      rebuildPoints();
    }
    resize();

    // Mouse interaction (subtle steering)
    const cursor = { x: 0, y: 0, inside: false };
    let boost = 0;
    const onEnter = () => { cursor.inside = true; boost = 1; if (cursorGlowRef.current) cursorGlowRef.current.style.opacity = '1'; };
    const onLeave = () => { cursor.inside = false; if (cursorGlowRef.current) cursorGlowRef.current.style.opacity = '0'; };
    const onMove = (e) => {
      const r = wrapper.getBoundingClientRect();
      cursor.x = (e.clientX - r.left) / r.width * 2 - 1;
      cursor.y = (e.clientY - r.top) / r.height * 2 - 1;
      if (cursorGlowRef.current) {
        const gx = (e.clientX - r.left);
        const gy = (e.clientY - r.top);
        cursorGlowRef.current.style.left = `${gx}px`; cursorGlowRef.current.style.top = `${gy}px`;
      }
    };
    wrapper.addEventListener('mouseenter', onEnter);
    wrapper.addEventListener('mouseleave', onLeave);
    wrapper.addEventListener('mousemove', onMove);

    // Neighbor building for network lines (front hemisphere only)
    function computeNeighbors(screenPts) {
      // screenPts: [{x,y,z,idx}] for front hemisphere
      const A = screenPts; const K = 3; const distMax = radius * 0.55;
      neighbors = new Array(A.length);
      for (let i = 0; i < A.length; i++) {
        const p = A[i];
        const dists = [];
        for (let j = 0; j < A.length; j++) {
          if (i === j) continue;
          const q = A[j];
          const dx = p.x - q.x, dy = p.y - q.y;
          const d = Math.hypot(dx, dy);
          if (d < distMax) dists.push({ j, d });
        }
        dists.sort((a, b) => a.d - b.d);
        neighbors[i] = dists.slice(0, K).map(o => o.j);
      }
    }

    // Draw rim glow
    function drawRim() {
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.restore();
    }

    // Animation
    let last = performance.now();
    let raf = 0; let tick = 0;
    function frame(now) {
      const dt = Math.min(32, now - last); last = now; tick++;
      rotY += spin * dt * (1 + 0.6 * boost);
      rotX += (cursor.inside ? cursor.y * 0.0004 : 0) * dt; // subtle tilt with mouse Y
      boost = Math.max(0, boost - 0.02);

      // clear
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      // rotate and project points
      const front = []; // {x,y,z,idx,land}
      const back = [];

      for (let i = 0; i < points.length; i++) {
        let v = points[i];
        v = rotYMat(v, rotY);
        v = rotXMat(v, rotX);
        const land = fauxLand(points[i]) > 0.0; // use original for consistent mask
        const sp = project(v);
        const rec = { x: sp.x, y: sp.y, z: v.z, idx: i, land };
        if (v.z >= 0) front.push(rec); else back.push(rec);
      }

      // Optionally rebuild neighbors occasionally (cheap N~100)
      if (tick % 90 === 0) {
        const anchorScreen = anchorsIdx
          .map(idx => {
            let v = points[idx]; v = rotYMat(v, rotY); v = rotXMat(v, rotX);
            if (v.z < 0) return null; // front only
            const sp = project(v);
            return { x: sp.x, y: sp.y, z: v.z, idx };
          })
          .filter(Boolean);
        computeNeighbors(anchorScreen);
        // stash screen for drawing lines this tick
        lastAnchorScreen = anchorScreen;
      }

      // draw back hemisphere points (dim)
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      for (let i = 0; i < back.length; i++) {
        const p = back[i];
        const r = p.land ? 1.1 : 0.9;
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();

      // draw network lines (front anchors)
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = 'rgba(255,255,255,0.18)';
      ctx.lineWidth = 0.8;
      if (lastAnchorScreen && neighbors.length === lastAnchorScreen.length) {
        for (let i = 0; i < lastAnchorScreen.length; i++) {
          const a = lastAnchorScreen[i];
          const nbrs = neighbors[i] || [];
          for (let k = 0; k < nbrs.length; k++) {
            const b = lastAnchorScreen[nbrs[k]];
            if (!b) continue;
            ctx.globalAlpha = 0.15 + 0.15 * ((a.z + b.z) * 0.5);
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }
      ctx.restore();

      // draw front hemisphere points (bright)
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < front.length; i++) {
        const p = front[i];
        const alpha = 0.22 + 0.58 * (p.z * 0.5 + 0.5); // depth-based brightness
        const r = p.land ? 1.25 : 1.0;
        ctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(3)})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();

      drawRim();

      raf = requestAnimationFrame(frame);
    }

    let lastAnchorScreen = null;
    raf = requestAnimationFrame(frame);

    const ro = new ResizeObserver(() => resize());
    ro.observe(wrapper);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      wrapper.removeEventListener('mouseenter', onEnter);
      wrapper.removeEventListener('mouseleave', onLeave);
      wrapper.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative" style={{ width: '100%', height: '100%', minHeight: '100vh', background: '#000' }}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div ref={cursorGlowRef} className="cursor-glow" style={{ opacity: 0, left: 0, top: 0, background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 30%, transparent 60%)' }} />
    </div>
  );
};

export default InteractiveShowcase;
