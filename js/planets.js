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
    this.moonOrbitLine = null;

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

  generateSunTexture() {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, size);
    grad.addColorStop(0, '#ff3b00');
    grad.addColorStop(0.25, '#ff7700');
    grad.addColorStop(0.5, '#ffa200');
    grad.addColorStop(0.75, '#ffbe00');
    grad.addColorStop(1, '#ff3b00');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const idx = (y * size + x) * 4;
        const n1 = Math.sin(x * 0.05) * Math.cos(y * 0.05);
        const n2 = Math.sin(x * 0.1 + y * 0.08) * 0.5;
        const n3 = Math.cos(x * 0.2 - y * 0.15) * 0.25;
        const total = (n1 + n2 + n3 + 1.75) / 3.5;

        data[idx] = Math.min(255, data[idx] * (0.85 + total * 0.35));
        data[idx + 1] = Math.min(255, data[idx + 1] * (0.7 + total * 0.5));
        data[idx + 2] = Math.min(255, total * 80);
      }
    }
    ctx.putImageData(imgData, 0, 0);

    for (let i = 0; i < 45; i++) {
      const rx = Math.random() * size;
      const ry = Math.random() * size;
      const rad = 15 + Math.random() * 45;
      const flare = ctx.createRadialGradient(rx, ry, 0, rx, ry, rad);
      flare.addColorStop(0, 'rgba(255, 255, 230, 0.45)');
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

  generateMercuryTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#8f887f';
    ctx.fillRect(0, 0, size, size);

    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const noise = (Math.random() - 0.5) * 55;
      data[i] = Math.min(255, Math.max(0, data[i] + noise));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
    }
    ctx.putImageData(imgData, 0, 0);

    for (let i = 0; i < 90; i++) {
      const cx = Math.random() * size;
      const cy = Math.random() * size;
      const r = 3 + Math.random() * 24;

      ctx.strokeStyle = 'rgba(220, 215, 205, 0.45)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();

      const craterGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      craterGrad.addColorStop(0, 'rgba(55, 50, 45, 0.5)');
      craterGrad.addColorStop(0.8, 'rgba(85, 80, 75, 0.25)');
      craterGrad.addColorStop(1, 'rgba(143, 136, 127, 0)');
      ctx.fillStyle = craterGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    return new THREE.CanvasTexture(canvas);
  }

  generateVenusTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, size);
    grad.addColorStop(0, '#caa266');
    grad.addColorStop(0.3, '#e5c48b');
    grad.addColorStop(0.5, '#f5e3bc');
    grad.addColorStop(0.7, '#e4bd80');
    grad.addColorStop(1, '#caa266');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = 'rgba(255, 245, 215, 0.16)';
    for (let y = 0; y < size; y += 4) {
      const wave = Math.sin(y * 0.03) * 22 + Math.cos(y * 0.08) * 12;
      ctx.fillRect(0, y + wave * 0.2, size, 2);
    }

    for (let i = 0; i < 28; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 25 + Math.random() * 70;
      const swirl = ctx.createRadialGradient(x, y, 0, x, y, r);
      swirl.addColorStop(0, 'rgba(235, 195, 130, 0.35)');
      swirl.addColorStop(1, 'rgba(235, 195, 130, 0)');
      ctx.fillStyle = swirl;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    return new THREE.CanvasTexture(canvas);
  }

  generateEarthTexture() {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size / 2;
    const h = size / 2;
    const ctx = canvas.getContext('2d');

    // Vibrant deep blue ocean
    const oceanGrad = ctx.createLinearGradient(0, 0, 0, h);
    oceanGrad.addColorStop(0, '#103565');
    oceanGrad.addColorStop(0.5, '#154e8c');
    oceanGrad.addColorStop(1, '#103565');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, 0, size, h);

    const drawLandmass = (cx, cy, rx, ry, rot = 0, color = '#387346') => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#8a7248';
      ctx.beginPath();
      ctx.ellipse(0, 0, rx * 0.52, ry * 0.42, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    // Americas
    drawLandmass(size * 0.25, h * 0.35, 95, 65, -0.2, '#3b784a');
    drawLandmass(size * 0.32, h * 0.65, 70, 100, 0.25, '#336a40');

    // Eurasia & Africa
    drawLandmass(size * 0.58, h * 0.32, 145, 75, 0.1, '#477540');
    drawLandmass(size * 0.52, h * 0.58, 90, 95, 0.05, '#947a46');

    // Australia & Asia islands
    drawLandmass(size * 0.82, h * 0.70, 55, 45, -0.1, '#876935');
    drawLandmass(size * 0.78, h * 0.42, 65, 50, 0.3, '#35753d');

    // Polar ice caps
    const northIce = ctx.createLinearGradient(0, 0, 0, h * 0.16);
    northIce.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
    northIce.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = northIce;
    ctx.fillRect(0, 0, size, h * 0.16);

    const southIce = ctx.createLinearGradient(0, h * 0.84, 0, h);
    southIce.addColorStop(0, 'rgba(255, 255, 255, 0)');
    southIce.addColorStop(1, 'rgba(255, 255, 255, 0.98)');
    ctx.fillStyle = southIce;
    ctx.fillRect(0, h * 0.84, size, h * 0.16);

    return new THREE.CanvasTexture(canvas);
  }

  generateEarthCloudsTexture() {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size / 2;
    const h = size / 2;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, size, h);

    for (let i = 0; i < 90; i++) {
      const cx = Math.random() * size;
      const cy = h * 0.12 + Math.random() * (h * 0.76);
      const rx = 45 + Math.random() * 120;
      const ry = 18 + Math.random() * 40;

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rx);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
      grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
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

  generateMoonTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#9da0a8';
    ctx.fillRect(0, 0, size, size);

    const maria = [
      { x: 160, y: 180, r: 75 },
      { x: 260, y: 150, r: 95 },
      { x: 340, y: 220, r: 65 },
      { x: 220, y: 320, r: 85 }
    ];
    maria.forEach(m => {
      const grad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r);
      grad.addColorStop(0, 'rgba(55, 58, 65, 0.75)');
      grad.addColorStop(0.8, 'rgba(75, 78, 85, 0.35)');
      grad.addColorStop(1, 'rgba(157, 160, 168, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
      ctx.fill();
    });

    for (let i = 0; i < 80; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const r = 2 + Math.random() * 14;

      ctx.strokeStyle = 'rgba(240, 243, 250, 0.5)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    return new THREE.CanvasTexture(canvas);
  }

  generateMarsTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, size);
    grad.addColorStop(0, '#b84422');
    grad.addColorStop(0.4, '#e06234');
    grad.addColorStop(0.6, '#f07444');
    grad.addColorStop(1, '#a83918');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    for (let i = 0; i < 20; i++) {
      const x = Math.random() * size;
      const y = size * 0.25 + Math.random() * (size * 0.5);
      const r = 35 + Math.random() * 80;
      const darkGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
      darkGrad.addColorStop(0, 'rgba(85, 30, 18, 0.6)');
      darkGrad.addColorStop(1, 'rgba(224, 98, 52, 0)');
      ctx.fillStyle = darkGrad;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Canyon scar
    ctx.strokeStyle = 'rgba(70, 22, 12, 0.7)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(size * 0.22, size * 0.52);
    ctx.quadraticCurveTo(size * 0.45, size * 0.56, size * 0.68, size * 0.5);
    ctx.stroke();

    // Polar caps
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.beginPath();
    ctx.ellipse(size * 0.5, size * 0.04, 65, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(size * 0.5, size * 0.96, 55, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  }

  generateJupiterTexture() {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size / 2;
    const h = size / 2;
    const ctx = canvas.getContext('2d');

    const bands = [
      { y: 0.0, color: '#ab8863' },
      { y: 0.12, color: '#e5c9a7' },
      { y: 0.22, color: '#8f5636' },
      { y: 0.35, color: '#faece0' },
      { y: 0.48, color: '#9e5a39' },
      { y: 0.62, color: '#dcbf9f' },
      { y: 0.75, color: '#ab7853' },
      { y: 0.88, color: '#8a6549' },
      { y: 1.0, color: '#694a36' }
    ];

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    bands.forEach(b => grad.addColorStop(b.y, b.color));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, h);

    for (let y = 0; y < h; y += 5) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      const wave = Math.sin(y * 0.05) * 18 + Math.cos(y * 0.12) * 10;
      ctx.fillRect(0, y + wave * 0.3, size, 3);
    }

    const grsX = size * 0.65;
    const grsY = h * 0.58;
    const grsGrad = ctx.createRadialGradient(grsX, grsY, 0, grsX, grsY, 65);
    grsGrad.addColorStop(0, '#db4f2c');
    grsGrad.addColorStop(0.6, '#c43d1c');
    grsGrad.addColorStop(0.85, '#e89c80');
    grsGrad.addColorStop(1, 'rgba(158, 90, 57, 0)');
    ctx.fillStyle = grsGrad;
    ctx.beginPath();
    ctx.ellipse(grsX, grsY, 65, 38, -0.05, 0, Math.PI * 2);
    ctx.fill();

    return new THREE.CanvasTexture(canvas);
  }

  generateSaturnTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size / 2;
    const h = size / 2;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#8c7d61');
    grad.addColorStop(0.2, '#c7b693');
    grad.addColorStop(0.35, '#e8dcbd');
    grad.addColorStop(0.5, '#f5e4c6');
    grad.addColorStop(0.65, '#d9c6a0');
    grad.addColorStop(0.85, '#ab9978');
    grad.addColorStop(1, '#75654a');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, h);

    for (let y = 0; y < h; y += 4) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.fillRect(0, y, size, 2);
    }

    return new THREE.CanvasTexture(canvas);
  }

  generateSaturnRingTexture() {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, size, 64);

    const grad = ctx.createLinearGradient(0, 0, size, 0);
    grad.addColorStop(0, 'rgba(190, 170, 140, 0.15)');
    grad.addColorStop(0.18, 'rgba(225, 205, 175, 0.75)');
    grad.addColorStop(0.55, 'rgba(245, 225, 195, 0.95)');
    grad.addColorStop(0.58, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(0.64, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(0.65, 'rgba(210, 190, 160, 0.8)');
    grad.addColorStop(0.92, 'rgba(185, 165, 135, 0.6)');
    grad.addColorStop(0.94, 'rgba(0, 0, 0, 0)');
    grad.addColorStop(0.96, 'rgba(170, 150, 125, 0.35)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, 64);

    for (let x = 0; x < size; x += 3) {
      if (x < size * 0.58 || x > size * 0.64) {
        ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.15)';
        ctx.fillRect(x, 0, 1, 64);
      }
    }

    return new THREE.CanvasTexture(canvas);
  }

  generateUranusTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size / 2;
    const h = size / 2;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#6cb6c6');
    grad.addColorStop(0.3, '#8ed0dc');
    grad.addColorStop(0.5, '#adeef9');
    grad.addColorStop(0.7, '#88cbda');
    grad.addColorStop(1, '#61a7b6');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, h);

    return new THREE.CanvasTexture(canvas);
  }

  generateNeptuneTexture() {
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size / 2;
    const h = size / 2;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, '#244ca3');
    grad.addColorStop(0.3, '#326bd6');
    grad.addColorStop(0.5, '#4a8bf2');
    grad.addColorStop(0.7, '#2e63c9');
    grad.addColorStop(1, '#1e408c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, h);

    const dsGrad = ctx.createRadialGradient(size * 0.35, h * 0.45, 0, size * 0.35, h * 0.45, 35);
    dsGrad.addColorStop(0, '#15295c');
    dsGrad.addColorStop(1, 'rgba(74, 139, 242, 0)');
    ctx.fillStyle = dsGrad;
    ctx.beginPath();
    ctx.ellipse(size * 0.35, h * 0.45, 40, 22, -0.1, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fillRect(size * 0.3, h * 0.42, 70, 2.5);
    ctx.fillRect(size * 0.6, h * 0.62, 95, 3);

    return new THREE.CanvasTexture(canvas);
  }

  /**
   * Helper: creates a floating 3D text/dot billboard sprite label above a planet
   */
  createPlanetLabel(text, color = '#00f0ff') {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 256, 64);

    // Glowing cyan/white text
    ctx.font = 'bold 22px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.shadowColor = color;
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text.toUpperCase(), 128, 28);

    // Small glowing indicator dot below text
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(128, 48, 3.5, 0, Math.PI * 2);
    ctx.fill();

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
      opacity: 0.85,
      depthTest: false
    });

    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(16, 4, 1);
    return sprite;
  }

  // ==========================================
  // CREATING CELESTIAL BODIES
  // ==========================================

  createSun() {
    const data = CELESTIAL_DATA.sun;
    const segments = this.isMobile ? 36 : 56;
    const geo = new THREE.SphereGeometry(data.visualRadius, segments, segments);

    const sunTex = this.generateSunTexture();
    const mat = new THREE.MeshBasicMaterial({
      map: sunTex
    });

    this.sunMesh = new THREE.Mesh(geo, mat);
    this.sunMesh.userData = { id: 'sun', data };
    this.scene.add(this.sunMesh);

    // Corona outer glow shell (additive blending with radial soft falloff)
    const coronaGeo = new THREE.SphereGeometry(data.visualRadius * 1.35, segments, segments);
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
          intensity = pow(0.68 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() {
          vec3 glow = glowColor * intensity;
          gl_FragColor = vec4(glow, intensity * 0.95);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
      depthWrite: false
    });

    this.sunCorona = new THREE.Mesh(coronaGeo, coronaMat);
    this.sunMesh.add(this.sunCorona);

    // Label
    const label = this.createPlanetLabel('THE SUN', '#ffaa00');
    label.position.set(0, data.visualRadius + 7, 0);
    this.sunMesh.add(label);

    this.planets['sun'] = {
      mesh: this.sunMesh,
      pivot: this.sunMesh,
      data,
      angle: 0
    };
  }

  createPlanets() {
    const segments = this.isMobile ? 32 : 48;
    const planetKeys = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];

    // Emissive baseline colors so night-sides remain radiantly visible
    const emissiveMap = {
      mercury: { color: 0x3a342c, intensity: 0.35 },
      venus:   { color: 0x483a22, intensity: 0.35 },
      earth:   { color: 0x122e4c, intensity: 0.35 },
      mars:    { color: 0x421d12, intensity: 0.35 },
      jupiter: { color: 0x3d2c1d, intensity: 0.3 },
      saturn:  { color: 0x3d3524, intensity: 0.3 },
      uranus:  { color: 0x1e3e4a, intensity: 0.35 },
      neptune: { color: 0x142c54, intensity: 0.35 }
    };

    planetKeys.forEach(key => {
      const data = CELESTIAL_DATA[key];
      const pivot = new THREE.Group();
      this.scene.add(pivot);

      let mat;
      let mesh;

      if (key === 'earth') {
        this.earthGroup = new THREE.Group();
        pivot.add(this.earthGroup);

        // 1. Earth Surface
        const earthGeo = new THREE.SphereGeometry(data.visualRadius, segments, segments);
        const earthTex = this.generateEarthTexture();
        const earthMat = new THREE.MeshStandardMaterial({
          map: earthTex,
          roughness: 0.55,
          metalness: 0.08,
          emissive: emissiveMap.earth.color,
          emissiveIntensity: emissiveMap.earth.intensity
        });
        this.earthMesh = new THREE.Mesh(earthGeo, earthMat);
        this.earthMesh.rotation.z = THREE.MathUtils.degToRad(data.tilt);
        this.earthMesh.userData = { id: key, data };
        this.earthGroup.add(this.earthMesh);

        // 2. Earth Clouds
        const cloudGeo = new THREE.SphereGeometry(data.visualRadius * 1.02, segments, segments);
        const cloudTex = this.generateEarthCloudsTexture();
        const cloudMat = new THREE.MeshStandardMaterial({
          map: cloudTex,
          transparent: true,
          opacity: 0.65,
          blending: THREE.NormalBlending,
          depthWrite: false
        });
        this.earthClouds = new THREE.Mesh(cloudGeo, cloudMat);
        this.earthMesh.add(this.earthClouds);

        // 3. Earth Atmosphere Rim Glow
        const atmosGeo = new THREE.SphereGeometry(data.visualRadius * 1.1, segments, segments);
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
              float intensity = pow(0.72 - dot(vNormal, vec3(0, 0, 1.0)), 2.2);
              gl_FragColor = vec4(0.25, 0.65, 1.0, 1.0) * intensity * 0.9;
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
        const moonGeo = new THREE.SphereGeometry(moonData.visualRadius, 24, 24);
        const moonTex = this.generateMoonTexture();
        const moonMat = new THREE.MeshStandardMaterial({
          map: moonTex,
          roughness: 0.75,
          metalness: 0.05,
          emissive: 0x383a42,
          emissiveIntensity: 0.35
        });
        this.moonMesh = new THREE.Mesh(moonGeo, moonMat);
        this.moonMesh.position.set(moonData.orbitRadius, 0, 0);
        this.moonMesh.userData = { id: 'moon', data: moonData };
        this.earthGroup.add(this.moonMesh);

        // Moon Orbit Ring around Earth
        const moonOrbitGeo = new THREE.BufferGeometry();
        const moonPoints = [];
        for (let i = 0; i <= 64; i++) {
          const theta = (i / 64) * Math.PI * 2;
          moonPoints.push(new THREE.Vector3(
            Math.cos(theta) * moonData.orbitRadius,
            0,
            Math.sin(theta) * moonData.orbitRadius
          ));
        }
        moonOrbitGeo.setFromPoints(moonPoints);
        const moonOrbitMat = new THREE.LineBasicMaterial({
          color: 0x8ab4f8,
          transparent: true,
          opacity: 0.28,
          depthWrite: false
        });
        this.moonOrbitLine = new THREE.LineLoop(moonOrbitGeo, moonOrbitMat);
        this.earthGroup.add(this.moonOrbitLine);

        // Label for Earth
        const earthLabel = this.createPlanetLabel('EARTH', '#3a9bf0');
        earthLabel.position.set(0, data.visualRadius + 3.2, 0);
        this.earthMesh.add(earthLabel);

        this.earthGroup.position.x = data.orbitRadius;
        mesh = this.earthMesh;

      } else {
        const geo = new THREE.SphereGeometry(data.visualRadius, segments, segments);
        let tex;

        if (key === 'mercury') tex = this.generateMercuryTexture();
        else if (key === 'venus') tex = this.generateVenusTexture();
        else if (key === 'mars') tex = this.generateMarsTexture();
        else if (key === 'jupiter') tex = this.generateJupiterTexture();
        else if (key === 'saturn') tex = this.generateSaturnTexture();
        else if (key === 'uranus') tex = this.generateUranusTexture();
        else if (key === 'neptune') tex = this.generateNeptuneTexture();

        const em = emissiveMap[key] || { color: 0x222222, intensity: 0.3 };

        mat = new THREE.MeshStandardMaterial({
          map: tex,
          roughness: key === 'venus' ? 0.35 : 0.65,
          metalness: 0.06,
          emissive: em.color,
          emissiveIntensity: em.intensity
        });

        mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.z = THREE.MathUtils.degToRad(data.tilt);
        mesh.userData = { id: key, data };

        mesh.position.x = data.orbitRadius;
        pivot.add(mesh);

        // Saturn Ring System
        if (key === 'saturn') {
          const ringGeo = new THREE.RingGeometry(data.ringInner, data.ringOuter, 72);
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
            opacity: 0.95,
            roughness: 0.5,
            metalness: 0.1,
            emissive: 0x483e28,
            emissiveIntensity: 0.3
          });

          const ringMesh = new THREE.Mesh(ringGeo, ringMat);
          ringMesh.rotation.x = Math.PI / 2;
          mesh.add(ringMesh);
        }

        // Uranus Ring System
        if (key === 'uranus') {
          const uRingGeo = new THREE.RingGeometry(data.ringInner, data.ringOuter, 56);
          const uRingMat = new THREE.MeshStandardMaterial({
            color: 0x9be3ec,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.5,
            emissive: 0x5ab8c6,
            emissiveIntensity: 0.35
          });
          const uRingMesh = new THREE.Mesh(uRingGeo, uRingMat);
          uRingMesh.rotation.x = Math.PI / 2;
          mesh.add(uRingMesh);
        }

        // Planet Label Billboard
        const label = this.createPlanetLabel(key, data.colorHex);
        label.position.set(0, data.visualRadius + 3.2, 0);
        mesh.add(label);
      }

      this.planets[key] = {
        mesh,
        pivot,
        data,
        angle: Math.random() * Math.PI * 2
      };
    });
  }

  createAsteroidBelt() {
    const count = this.isMobile ? 700 : 1800;
    const data = CELESTIAL_DATA.asteroidBelt;

    const geo = new THREE.DodecahedronGeometry(0.7, 0);

    const mat = new THREE.MeshStandardMaterial({
      color: 0x9a9288,
      roughness: 0.85,
      metalness: 0.18,
      flatShading: true,
      emissive: 0x2d2822,
      emissiveIntensity: 0.25
    });

    this.asteroidBelt = new THREE.InstancedMesh(geo, mat, count);
    this.asteroidBelt.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    const dummy = new THREE.Object3D();

    for (let i = 0; i < count; i++) {
      const radius = data.innerRadius + Math.random() * (data.outerRadius - data.innerRadius);
      const angle = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 9.5;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const scale = 0.4 + Math.random() * 1.1;
      dummy.scale.set(scale, scale * (0.8 + Math.random() * 0.4), scale);
      dummy.position.set(x, y, z);

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
        opacity: 0.28,
        depthWrite: false
      });

      const line = new THREE.LineLoop(geo, mat);
      this.orbits[key] = line;
      this.orbitLinesGroup.add(line);
    });
  }

  highlightOrbit(planetKey) {
    Object.keys(this.orbits).forEach(k => {
      const line = this.orbits[k];
      if (k === planetKey) {
        line.material.opacity = 0.85;
        line.material.color.setHex(0x00f0ff);
      } else {
        line.material.opacity = 0.2;
        line.material.color.setHex(0x4fc3f7);
      }
    });
  }

  resetOrbitHighlights() {
    Object.keys(this.orbits).forEach(k => {
      const line = this.orbits[k];
      line.material.opacity = 0.28;
      line.material.color.setHex(0x4fc3f7);
    });
  }

  getPlanetWorldPosition(key) {
    if (key === 'sun' || !this.planets[key]) {
      return new THREE.Vector3(0, 0, 0);
    }
    const target = new THREE.Vector3();
    this.planets[key].mesh.getWorldPosition(target);
    return target;
  }

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

    // 3. Asteroid belt
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
