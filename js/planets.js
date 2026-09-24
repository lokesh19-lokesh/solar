/**
 * ASTRA - Solar System Planetary Engine
 * Real-time 3D procedural planets, Sun corona, rings, moons, orbital paths, and Instanced Asteroid Belt.
 */

import * as THREE from 'three';
import { CELESTIAL_DATA } from './data.js';

export class SolarPlanets {
  constructor(scene, isMobile = false) {
    this.scene = scene;
    this.isMobile = isMobile;

    this.planets = {};
    this.orbits = {};
    this.orbitLinesGroup = new THREE.Group();
    this.scene.add(this.orbitLinesGroup);

    this.sunMesh = null;
    this.sunCorona = null;
    this.earthGroup = null;
    this.earthMesh = null;
    this.earthClouds = null;
    this.earthAtmosphere = null;
    this.moonMesh = null;

    this.asteroidBelt = null;
    this.asteroidData = [];

    this.activeFocusKey = null;

    this.init();
  }

  init() {
    this.createSun();
    this.createPlanets();
    this.createAsteroidBelt();
    this.createOrbitalPaths();
  }

  // ==========================================
  // PROCEDURAL CANVAS TEXTURE GENERATORS
  // ==========================================

  /**
   * Generates procedural solar plasma surface
   */
  generateSunTexture() {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Base fiery gradient
    const grad = ctx.createLinearGradient(0, 0, 0, size);
    grad.addColorStop(0, '#ff4d00');
    grad.addColorStop(0.3, '#ff8000');
    grad.addColorStop(0.5, '#ffa200');
    grad.addColorStop(0.7, '#ffc400');
    grad.addColorStop(1, '#ff4400');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Convective plasma granulation & turbulence
    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const n1 = Math.sin(x * 0.04) * Math.cos(y * 0.04);
        const n2 = Math.sin(x * 0.08 + y * 0.06) * 0.5;
        const n3 = Math.cos(x * 0.15 - y * 0.12) * 0.25;
        const total = (n1 + n2 + n3 + 1.75) / 3.5;

        data[idx] = Math.min(255, data[idx] * (0.8 + total * 0.4));     // R
        data[idx + 1] = Math.min(255, data[idx + 1] * (0.6 + total * 0.6)); // G
        data[idx + 2] = Math.min(255, total * 60);                     // B
      }
    }
    ctx.putImageData(imgData, 0, 0);

    // Add bright flare hotspots and darker sunspot pores
    for (let i = 0; i < 40; i++) {
      const rx = Math.random() * size;
      const ry = Math.random() * size;
      const rad = 10 + Math.random() * 40;
      const flare = ctx.createRadialGradient(rx, ry, 0, rx, ry, rad);
      flare.addColorStop(0, 'rgba(255, 255, 220, 0.4)');
      flare.addColorStop(1, 'rgba(255, 120, 0, 0)');
      ctx.fillStyle = flare;
      ctx.beginPath();
      ctx.arc(rx, ry, rad, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }

  /**
   * Generates procedural Mercury rocky cratered surface
   */
  generateMercuryTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#6e6962';
    ctx.fillRect(0, 0, size, size);

    // Fine regolith noise
    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 45;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    // Procedural impact craters
    for (let i = 0; i < 90; i++) {
      const cx = Math.random() * size;
      const cy = Math.random() * size;
      const r = 3 + Math.random() * 22;

      // Rim
      ctx.strokeStyle = 'rgba(180, 175, 168, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      // Basin
      const craterGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      craterGrad.addColorStop(0, 'rgba(45, 42, 38, 0.45)');
      craterGrad.addColorStop(0.8, 'rgba(65, 62, 58, 0.2)');
      craterGrad.addColorStop(1, 'rgba(110, 105, 98, 0)');
      ctx.fillStyle = craterGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    return new THREE.CanvasTexture(canvas);
  }

  /**
   * Generates procedural Venus sulfuric cloud cover
   */
  generateVenusTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Warm golden-cream gradient
    const grad = ctx.createLinearGradient(0, 0, 0, size);
    grad.addColorStop(0, '#b8935c');
    grad.addColorStop(0.3, '#d8b577');
    grad.addColorStop(0.5, '#edd7a4');
    grad.addColorStop(0.7, '#d6ae6e');
    grad.addColorStop(1, '#b8935c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Atmospheric swirling chevron bands
    ctx.fillStyle = 'rgba(255, 240, 200, 0.12)';
    for (let y = 0; y < size; y += 4) {
      const wave = Math.sin(y * 0.03) * 20 + Math.cos(y * 0.08) * 10;
      ctx.fillRect(0, y + wave * 0.2, size, 2);
    }

    for (let i = 0; i < 25; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 20 + Math.random() * 60;
      const swirl = ctx.createRadialGradient(x, y, 0, x, y, r);
      swirl.addColorStop(0, 'rgba(215, 175, 110, 0.25)');
      swirl.addColorStop(1, 'rgba(215, 175, 110, 0)');
      ctx.fillStyle = swirl;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    return new THREE.CanvasTexture(canvas);
  }

  /**
   * Generates procedural Earth surface (Oceans, continents, polar caps)
   */
  generateEarthTexture() {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size / 2;
    const h = size / 2;
    const ctx = canvas.getContext('2d');

    // Deep ocean base
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, h);
    oceanGrad.addColorStop(0, '#0c2244');
    oceanGrad.addColorStop(0.5, '#0e386e');
    oceanGrad.addColorStop(1, '#0c2244');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, size, h);

    // Continental landmasses using multi-frequency procedural blobbing
    ctx.fillStyle = '#2c5e3b'; // lush land
    const drawLandmass = (cx, cy, rx, ry, rot = 0, color = '#2c5e3b') => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();

      // Mountain ridge / arid center
      ctx.fillStyle = '#695738';
      ctx.beginPath();
      ctx.ellipse(0, 0, rx * 0.5, ry * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    // North America & South America
    drawLandmass(size * 0.25, h * 0.35, 90, 60, -0.2, '#2f5d34');
    drawLandmass(size * 0.32, h * 0.65, 65, 95, 0.25, '#26542c');

    // Eurasia & Africa
    drawLandmass(size * 0.58, h * 0.32, 140, 70, 0.1, '#3a5e35');
    drawLandmass(size * 0.52, h * 0.58, 85, 90, 0.05, '#736035'); // Sahara & Africa

    // Australia & East Asia islands
    drawLandmass(size * 0.82, h * 0.70, 50, 40, -0.1, '#6b5428');
    drawLandmass(size * 0.78, h * 0.42, 60, 45, 0.3, '#2a6332');

    // Polar ice caps (North & South poles)
    const northIce = ctx.createLinearGradient(0, 0, 0, h * 0.15);
    northIce.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
    northIce.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = northIce;
    ctx.fillRect(0, 0, size, h * 0.15);

    const southIce = ctx.createLinearGradient(0, h * 0.85, 0, h);
    southIce.addColorStop(0, 'rgba(255, 255, 255, 0)');
    southIce.addColorStop(1, 'rgba(255, 255, 255, 0.95)');
    ctx.fillStyle = southIce;
    ctx.fillRect(0, h * 0.85, size, h * 0.15);

    return new THREE.CanvasTexture(canvas);
  }

  /**
   * Generates Earth cloud layer texture with transparency
   */
  generateEarthCloudsTexture() {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size / 2;
    const h = size / 2;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, size, h);

    // Swirling cloud bands and cyclone patterns
    for (let i = 0; i < 80; i++) {
      const cx = Math.random() * size;
      const cy = h * 0.15 + Math.random() * (h * 0.7);
      const rx = 40 + Math.random() * 110;
      const ry = 15 + Math.random() * 35;

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.75)');
      grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.35)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, Math.random() * 0.4 - 0.2, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    return texture;
  }

  /**
   * Generates Moon surface texture
   */
  generateMoonTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#8b8e96';
    ctx.fillRect(0, 0, size, size);

    // Lunar Maria (dark basaltic plains)
    const maria = [
      { x: 160, y: 180, r: 70 },
      { x: 260, y: 150, r: 90 },
      { x: 340, y: 220, r: 60 },
      { x: 220, y: 320, r: 80 }
    ];
    maria.forEach(m => {
      const grad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r);
      grad.addColorStop(0, 'rgba(60, 62, 68, 0.7)');
      grad.addColorStop(0.8, 'rgba(80, 83, 90, 0.3)');
      grad.addColorStop(1, 'rgba(139, 142, 150, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();
    });

    // Craters and ray systems (like Tycho)
    for (let i = 0; i < 70; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 2 + Math.random() * 12;

      ctx.strokeStyle = 'rgba(230, 233, 240, 0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    return new THREE.CanvasTexture(canvas);
  }

  /**
   * Generates Mars rusty iron oxide and polar cap texture
   */
  generateMarsTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Rusty base
    const grad = ctx.createLinearGradient(0, 0, 0, size);
    grad.addColorStop(0, '#9c381c');
    grad.addColorStop(0.4, '#c45129');
    grad.addColorStop(0.6, '#db6235');
    grad.addColorStop(1, '#8e3015');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Dark volcanic basalt regions (Syrtis Major, Acidalia Planitia)
    for (let i = 0; i < 15; i++) {
      const x = Math.random() * size;
      const y = size * 0.3 + Math.random() * (size * 0.4);
      const r = 30 + Math.random() * 70;
      const darkGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
      darkGrad.addColorStop(0, 'rgba(74, 25, 14, 0.55)');
      darkGrad.addColorStop(1, 'rgba(196, 81, 41, 0)');
      ctx.fillStyle = darkGrad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Canyon scar (Valles Marineris)
    ctx.strokeStyle = 'rgba(60, 18, 10, 0.6)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(size * 0.25, size * 0.52);
    ctx.quadraticCurveTo(size * 0.45, size * 0.55, size * 0.65, size * 0.5);
    ctx.stroke();

    // Polar ice caps
    ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
    ctx.beginPath();
    ctx.ellipse(size * 0.5, size * 0.04, 60, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(size * 0.5, size * 0.96, 50, 15, 0, 0, Math.PI * 2);
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  }

  /**
   * Generates Jupiter alternating cloud belts and the Great Red Spot
   */
  generateJupiterTexture() {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size / 2;
    const h = size / 2;
    const ctx = canvas.getContext('2d');

    // Horizontal atmospheric zones and belts
    const bands = [
      { y: 0.0, color: '#9e7b57' },
      { y: 0.12, color: '#d9ba96' },
      { y: 0.22, color: '#7a4a2f' }, // North Equatorial Belt
      { y: 0.35, color: '#f0dfcf' }, // Equatorial Zone
      { y: 0.48, color: '#8c5032' }, // South Equatorial Belt
      { y: 0.62, color: '#cbb092' },
      { y: 0.75, color: '#9e6d4c' },
      { y: 0.88, color: '#7a5a40' },
      { y: 1.0, color: '#59402e' }
    ];

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    bands.forEach(b => grad.addColorStop(b.y, b.color));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, h);

    // Jet stream turbulence and whorls
    for (let y = 0; y < h; y += 6) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      const wave = Math.sin(y * 0.05) * 15 + Math.cos(y * 0.12) * 8;
      ctx.fillRect(0, y + wave * 0.3, size, 3);
    }

    // The Great Red Spot (anticyclonic storm in the southern hemisphere)
    const grsX = size * 0.65;
    const grsY = h * 0.58;
    const grsGrad = ctx.createRadialGradient(grsX, grsY, 0, grsX, grsY, 55);
    grsGrad.addColorStop(0, '#c74424');
    grsGrad.addColorStop(0.6, '#b03518');
    grsGrad.addColorStop(0.85, '#d4886b');
    grsGrad.addColorStop(1, 'rgba(140, 80, 50, 0)');
    ctx.fillStyle = grsGrad;
    ctx.beginPath();
    ctx.ellipse(grsX, grsY, 55, 32, -0.05, 0, Math.PI * 2);
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  }

  /**
   * Generates Saturn banded atmosphere
   */
  generateSaturnTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size / 2;
    const h = size / 2;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#7d6f54');
    grad.addColorStop(0.2, '#b8a682');
    grad.addColorStop(0.35, '#d9cbab');
    grad.addColorStop(0.5, '#edd9b9');
    grad.addColorStop(0.65, '#c9b691');
    grad.addColorStop(0.85, '#9e8c6c');
    grad.addColorStop(1, '#66573e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, h);

    // Subtle fine latitude striations
    for (let y = 0; y < h; y += 4) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.fillRect(0, y, size, 2);
    }

    return new THREE.CanvasTexture(canvas);
  }

  /**
   * Generates Saturn ring alpha/color texture with Cassini division
   */
  generateSaturnRingTexture() {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, size, 64);

    // Gradient representing the radial cross-section from inner to outer ring edge
    const grad = ctx.createLinearGradient(0, 0, size, 0);
    grad.addColorStop(0, 'rgba(180, 160, 130, 0.1)'); // C-ring inner faint
    grad.addColorStop(0.18, 'rgba(215, 195, 165, 0.65)'); // B-ring dense
    grad.addColorStop(0.55, 'rgba(235, 215, 185, 0.9)'); // B-ring outer peak
    grad.addColorStop(0.58, 'rgba(0, 0, 0, 0)'); // Cassini Division!
    grad.addColorStop(0.64, 'rgba(0, 0, 0, 0)'); // Cassini gap
    grad.addColorStop(0.65, 'rgba(195, 175, 145, 0.7)'); // A-ring inner
    grad.addColorStop(0.92, 'rgba(175, 155, 125, 0.5)'); // A-ring outer
    grad.addColorStop(0.94, 'rgba(0, 0, 0, 0)'); // Encke division
    grad.addColorStop(0.96, 'rgba(160, 140, 115, 0.3)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)'); // Outer boundary

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, 64);

    // Add hundreds of ultra-fine sub-ringlets
    for (let x = 0; x < size; x += 3) {
      if (x < size * 0.58 || x > size * 0.64) {
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.12)';
        ctx.fillRect(x, 0, 1, 64);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    return texture;
  }

  /**
   * Generates Uranus cyan ice-giant texture
   */
  generateUranusTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size / 2;
    const h = size / 2;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#5ea8b8');
    grad.addColorStop(0.3, '#7ec2ce');
    grad.addColorStop(0.5, '#9ee0ec');
    grad.addColorStop(0.7, '#78bcc8');
    grad.addColorStop(1, '#539aa8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, h);

    return new THREE.CanvasTexture(canvas);
  }

  /**
   * Generates Neptune azure deep-blue storm texture
   */
  generateNeptuneTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size / 2;
    const h = size / 2;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#1c3e7a');
    grad.addColorStop(0.3, '#2a5bb0');
    grad.addColorStop(0.5, '#3b78de');
    grad.addColorStop(0.7, '#2654a8');
    grad.addColorStop(1, '#183469');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, h);

    // Great Dark Spot (deep anticyclone)
    const dsGrad = ctx.createRadialGradient(size * 0.35, h * 0.45, 0, size * 0.35, h * 0.45, 30);
    dsGrad.addColorStop(0, '#112247');
    dsGrad.addColorStop(1, 'rgba(59, 120, 222, 0)');
    ctx.fillStyle = dsGrad;
    ctx.beginPath();
    ctx.ellipse(size * 0.35, h * 0.45, 35, 18, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // High altitude white methane cirrus cloud streaks
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.fillRect(size * 0.3, h * 0.42, 65, 2);
    ctx.fillRect(size * 0.6, h * 0.62, 85, 2.5);

    return new THREE.CanvasTexture(canvas);
  }

  // ==========================================
  // CREATING CELESTIAL BODIES
  // ==========================================

  createSun() {
    const data = CELESTIAL_DATA.sun;
    const segments = this.isMobile ? 32 : 48;
    const geo = new THREE.SphereGeometry(data.visualRadius, segments, segments);

    const sunTex = this.generateSunTexture();
    const mat = new THREE.MeshBasicMaterial({
      map: sunTex
    });

    this.sunMesh = new THREE.Mesh(geo, mat);
    this.sunMesh.userData = { id: 'sun', data };
    this.scene.add(this.sunMesh);

    // Corona outer glow shell (additive blending with radial soft falloff)
    const coronaGeo = new THREE.SphereGeometry(data.visualRadius * 1.25, segments, segments);
    const coronaMat = new THREE.ShaderMaterial({
      uniforms: {
        glowColor: { value: new THREE.Color(0xff8800) },
        viewVector: { value: new THREE.Vector3() }
      },
      vertexShader: `
        uniform vec3 viewVector;
        varying float intensity;
        void main() {
          vec3 vNormal = normalize(normalMatrix * normal);
          vec3 vNormel = normalize(normalMatrix * viewVector);
          intensity = pow(0.65 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() {
          vec3 glow = glowColor * intensity;
          gl_FragColor = vec4(glow, intensity * 0.85);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    });

    this.sunCorona = new THREE.Mesh(coronaGeo, coronaMat);
    this.sunMesh.add(this.sunCorona);

    this.planets['sun'] = {
      mesh: this.sunMesh,
      pivot: this.sunMesh,
      data,
      angle: 0
    };
  }

  createPlanets() {
    const segments = this.isMobile ? 28 : 40;

    // Helper to instantiate planet meshes
    const planetKeys = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];

    planetKeys.forEach(key => {
      const data = CELESTIAL_DATA[key];
      const pivot = new THREE.Group();
      this.scene.add(pivot);

      let mat;
      let mesh;

      if (key === 'earth') {
        // Special multi-layer Earth setup (surface + clouds + atmosphere + Moon)
        this.earthGroup = new THREE.Group();
        pivot.add(this.earthGroup);

        // 1. Earth Surface
        const earthGeo = new THREE.SphereGeometry(data.visualRadius, segments, segments);
        const earthTex = this.generateEarthTexture();
        const earthMat = new THREE.MeshStandardMaterial({
          map: earthTex,
          roughness: 0.65,
          metalness: 0.1
        });
        this.earthMesh = new THREE.Mesh(earthGeo, earthMat);
        this.earthMesh.rotation.z = THREE.MathUtils.degToRad(data.tilt);
        this.earthMesh.userData = { id: key, data };
        this.earthGroup.add(this.earthMesh);

        // 2. Earth Clouds
        const cloudGeo = new THREE.SphereGeometry(data.visualRadius * 1.018, segments, segments);
        const cloudTex = this.generateEarthCloudsTexture();
        const cloudMat = new THREE.MeshStandardMaterial({
          map: cloudTex,
          transparent: true,
          opacity: 0.55,
          blending: THREE.NormalBlending,
          depthWrite: false
        });
        this.earthClouds = new THREE.Mesh(cloudGeo, cloudMat);
        this.earthMesh.add(this.earthClouds);

        // 3. Earth Atmosphere Rim Glow
        const atmosGeo = new THREE.SphereGeometry(data.visualRadius * 1.08, segments, segments);
        const atmosMat = new THREE.ShaderMaterial({
          vertexShader: `
            varying vec3 vNormal;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            varying vec3 vNormal;
            void main() {
              float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.5);
              gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity * 0.85;
            }
          `,
          blending: THREE.AdditiveBlending,
          side: THREE.BackSide,
          transparent: true,
          depthWrite: false
        });
        this.earthAtmosphere = new THREE.Mesh(atmosGeo, atmosMat);
        this.earthMesh.add(this.earthAtmosphere);

        // 4. Moon
        const moonData = CELESTIAL_DATA.moon;
        const moonGeo = new THREE.SphereGeometry(moonData.visualRadius, 20, 20);
        const moonTex = this.generateMoonTexture();
        const moonMat = new THREE.MeshStandardMaterial({
          map: moonTex,
          roughness: 0.9,
          metalness: 0.05
        });
        this.moonMesh = new THREE.Mesh(moonGeo, moonMat);
        this.moonMesh.position.set(moonData.orbitRadius, 0, 0);
        this.moonMesh.userData = { id: 'moon', data: moonData };
        this.earthGroup.add(this.moonMesh);

        this.earthGroup.position.x = data.orbitRadius;
        mesh = this.earthMesh;

      } else {
        // Standard planets
        const geo = new THREE.SphereGeometry(data.visualRadius, segments, segments);
        let tex;

        if (key === 'mercury') tex = this.generateMercuryTexture();
        else if (key === 'venus') tex = this.generateVenusTexture();
        else if (key === 'mars') tex = this.generateMarsTexture();
        else if (key === 'jupiter') tex = this.generateJupiterTexture();
        else if (key === 'saturn') tex = this.generateSaturnTexture();
        else if (key === 'uranus') tex = this.generateUranusTexture();
        else if (key === 'neptune') tex = this.generateNeptuneTexture();

        mat = new THREE.MeshStandardMaterial({
          map: tex,
          roughness: key === 'venus' ? 0.4 : 0.75,
          metalness: 0.05
        });

        mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.z = THREE.MathUtils.degToRad(data.tilt);
        mesh.userData = { id: key, data };

        // Position on orbit
        mesh.position.x = data.orbitRadius;
        pivot.add(mesh);

        // Saturn Ring System
        if (key === 'saturn') {
          const ringGeo = new THREE.RingGeometry(data.ringInner, data.ringOuter, 64);
          // Correct UV mapping for radial ring texture
          const pos = ringGeo.attributes.position;
          const uvs = ringGeo.attributes.uv;
          for (let i = 0; i < pos.count; i++) {
            const vx = pos.getX(i);
            const vy = pos.getY(i);
            const dist = Math.sqrt(vx * vx + vy * vy);
            const u = (dist - data.ringInner) / (data.ringOuter - data.ringInner);
            uvs.setXY(i, u, 0.5);
          }
          uvs.needsUpdate = true;

          const ringTex = this.generateSaturnRingTexture();
          const ringMat = new THREE.MeshStandardMaterial({
            map: ringTex,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.92,
            roughness: 0.6,
            metalness: 0.1
          });

          const ringMesh = new THREE.Mesh(ringGeo, ringMat);
          ringMesh.rotation.x = Math.PI / 2; // Lie in equator plane
          mesh.add(ringMesh);
        }

        // Uranus Ring System (faint cyan rings)
        if (key === 'uranus') {
          const uRingGeo = new THREE.RingGeometry(data.ringInner, data.ringOuter, 48);
          const uRingMat = new THREE.MeshBasicMaterial({
            color: 0x9be3ec,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.35
          });
          const uRingMesh = new THREE.Mesh(uRingGeo, uRingMat);
          uRingMesh.rotation.x = Math.PI / 2;
          mesh.add(uRingMesh);
        }
      }

      this.planets[key] = {
        mesh,
        pivot,
        data,
        angle: Math.random() * Math.PI * 2 // spread planets out initially
      };
    });
  }

  /**
   * Procedural Asteroid Belt using InstancedMesh for performance
   */
  createAsteroidBelt() {
    const count = this.isMobile ? 650 : 1600;
    const data = CELESTIAL_DATA.asteroidBelt;

    // Small irregular asteroid geometry
    const geo = new THREE.DodecahedronGeometry(0.5, 0);

    const mat = new THREE.MeshStandardMaterial({
      color: 0x8a847c,
      roughness: 0.92,
      metalness: 0.15,
      flatShading: true
    });

    this.asteroidBelt = new THREE.InstancedMesh(geo, mat, count);
    this.asteroidBelt.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      // Semi-major axis between inner and outer belt radius
      const radius = data.innerRadius + Math.random() * (data.outerRadius - data.innerRadius);
      const angle = Math.random() * Math.PI * 2;
      // Slight vertical inclination scatter
      const y = (Math.random() - 0.5) * 8.5;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      // Scale variation
      const scale = 0.3 + Math.random() * 0.9;
      dummy.scale.set(scale, scale * (0.8 + Math.random() * 0.4), scale);
      dummy.position.set(x, y, z);

      // Random rotation
      dummy.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      dummy.updateMatrix();
      this.asteroidBelt.setMatrixAt(i, dummy.matrix);

      this.asteroidData.push({
        radius,
        angle,
        speed: data.orbitSpeed * (0.85 + Math.random() * 0.3),
        y,
        scale,
        rotX: (Math.random() - 0.5) * 0.02,
        rotY: (Math.random() - 0.5) * 0.02
      });
    }

    this.asteroidBelt.instanceMatrix.needsUpdate = true;
    this.scene.add(this.asteroidBelt);
  }

  /**
   * Generates elegant, scientific orbital paths using LineLoop
   */
  createOrbitalPaths() {
    const planetKeys = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];

    planetKeys.forEach(key => {
      const data = CELESTIAL_DATA[key];
      const segments = 128;
      const points = [];

      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(
          Math.cos(theta) * data.orbitRadius,
          0,
          Math.sin(theta) * data.orbitRadius
        ));
      }

      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: 0x4fc3f7,
        transparent: true,
        opacity: 0.18,
        depthWrite: false
      });

      const line = new THREE.LineLoop(geo, mat);
      this.orbits[key] = line;
      this.orbitLinesGroup.add(line);
    });
  }

  /**
   * Highlights specific orbit line when active or hovered
   */
  highlightOrbit(planetKey) {
    Object.keys(this.orbits).forEach(k => {
      const line = this.orbits[k];
      if (k === planetKey) {
        line.material.opacity = 0.75;
        line.material.color.setHex(0x00f0ff);
      } else {
        line.material.opacity = 0.15;
        line.material.color.setHex(0x4fc3f7);
      }
    });
  }

  resetOrbitHighlights() {
    Object.keys(this.orbits).forEach(k => {
      const line = this.orbits[k];
      line.material.opacity = 0.18;
      line.material.color.setHex(0x4fc3f7);
    });
  }

  /**
   * Returns current world position of a planet for camera focus
   */
  getPlanetWorldPosition(key) {
    if (key === 'sun' || !this.planets[key]) {
      return new THREE.Vector3(0, 0, 0);
    }
    const target = new THREE.Vector3();
    this.planets[key].mesh.getWorldPosition(target);
    return target;
  }

  /**
   * Updates rotations and orbital positions based on time delta and speed multiplier
   */
  update(delta, speedMultiplier = 1) {
    const step = delta * speedMultiplier;

    // 1. Sun rotation
    if (this.sunMesh) {
      this.sunMesh.rotation.y += 0.002 * step * 60;
    }

    // 2. Planets
    Object.keys(this.planets).forEach(key => {
      if (key === 'sun') return;
      const p = this.planets[key];

      // Axial rotation
      if (key === 'earth') {
        if (this.earthMesh) this.earthMesh.rotation.y += p.data.rotationSpeed * step * 60;
        if (this.earthClouds) this.earthClouds.rotation.y += p.data.rotationSpeed * 1.15 * step * 60;

        // Moon orbit around Earth
        if (this.moonMesh) {
          const mSpeed = CELESTIAL_DATA.moon.orbitSpeed * step * 60;
          this.moonAngle = (this.moonAngle || 0) + mSpeed;
          this.moonMesh.position.x = Math.cos(this.moonAngle) * CELESTIAL_DATA.moon.orbitRadius;
          this.moonMesh.position.z = Math.sin(this.moonAngle) * CELESTIAL_DATA.moon.orbitRadius;
        }
      } else if (p.mesh) {
        p.mesh.rotation.y += p.data.rotationSpeed * step * 60;
      }

      // Orbital revolution around the Sun
      p.angle += p.data.orbitSpeed * 0.18 * step;
      p.pivot.rotation.y = p.angle;
    });

    // 3. Asteroid belt slow cosmic orbit
    if (this.asteroidBelt) {
      const dummy = new THREE.Object3D();
      for (let i = 0; i < this.asteroidData.length; i++) {
        const item = this.asteroidData[i];
        item.angle += item.speed * 0.1 * step;

        const x = Math.cos(item.angle) * item.radius;
        const z = Math.sin(item.angle) * item.radius;

        dummy.position.set(x, item.y, z);
        dummy.scale.set(item.scale, item.scale, item.scale);
        dummy.rotation.x += item.rotX * step * 60;
        dummy.rotation.y += item.rotY * step * 60;

        dummy.updateMatrix();
        this.asteroidBelt.setMatrixAt(i, dummy.matrix);
      }
      this.asteroidBelt.instanceMatrix.needsUpdate = true;
    }
  }
}
