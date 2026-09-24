/**
 * ASTRA - Three.js Scene Setup & Environment
 * Handles WebGLRenderer, PerspectiveCamera, procedural starfields, and space illumination.
 */

import * as THREE from 'three';

export class SolarScene {
  constructor(canvasContainer) {
    this.container = canvasContainer;
    this.isMobile = this.checkMobile();
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.sunLight = null;
    this.ambientLight = null;
    this.starGroups = [];

    this.init();
  }

  checkMobile() {
    return /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent) 
      || window.innerWidth < 768;
  }

  isWebGLAvailable() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && 
        (canvas.getContext('webgl') || canvas.getContext('experimental-webgl') || canvas.getContext('webgl2')));
    } catch (e) {
      return false;
    }
  }

  init() {
    if (!this.isWebGLAvailable()) {
      throw new Error('WEBGL_UNAVAILABLE');
    }

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x02040b, 0.00035);

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.5, 7000);
    this.camera.position.set(0, 75, 220);
    this.camera.lookAt(0, 0, 0);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: !this.isMobile,
      alpha: false,
      stencil: false
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.isMobile ? 1.5 : 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.id = 'solar-canvas';
    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting
    this.setupLighting();

    // 5. Procedural Starfields
    this.createProceduralStarfields();

    // 6. Resize listener
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  setupLighting() {
    // Point light radiating directly from the Sun at center
    this.sunLight = new THREE.PointLight(0xfff7e8, 3.8, 4500, 1.15);
    this.sunLight.position.set(0, 0, 0);
    this.scene.add(this.sunLight);

    // Subtle space ambient light so unlit sides of planets have a natural dark-navy silhouette
    this.ambientLight = new THREE.AmbientLight(0x09101f, 0.28);
    this.scene.add(this.ambientLight);

    // Very soft directional light for dramatic grazing light across planetary horizons
    const rimLight = new THREE.DirectionalLight(0x223355, 0.15);
    rimLight.position.set(30, 80, 50);
    this.scene.add(rimLight);
  }

  createProceduralStarfields() {
    // We generate 3 distinct layers of procedural stars using BufferGeometry & Points
    // Layer 1: Distant deep field (tiny faint stars)
    // Layer 2: Mid-distance stars with varying astronomical hues (blue, white, amber)
    // Layer 3: Foreground bright stars with subtle twinkling
    const starCounts = this.isMobile ? [2000, 1200, 300] : [5500, 3200, 900];

    // Star color palette (O, B, A, F, G, K, M stellar spectral classes)
    const starColors = [
      new THREE.Color(0xffffff), // White (A-class)
      new THREE.Color(0xdbe9ff), // Bluish white (B-class)
      new THREE.Color(0xaec8ff), // Blue (O-class)
      new THREE.Color(0xfff3da), // Warm white (F-class)
      new THREE.Color(0xffe6a3), // Pale yellow (G-class like Sun)
      new THREE.Color(0xffcaa1)  // Orange (K-class)
    ];

    // --- Helper to build a procedural soft circle star sprite ---
    const starTexture = this.generateStarSprite();

    // Layer 1: Deep field
    const deepGeo = new THREE.BufferGeometry();
    const deepPositions = new Float32Array(starCounts[0] * 3);
    const deepColors = new Float32Array(starCounts[0] * 3);

    for (let i = 0; i < starCounts[0]; i++) {
      const radius = 1800 + Math.random() * 2800;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);

      deepPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      deepPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      deepPositions[i * 3 + 2] = radius * Math.cos(phi);

      const color = starColors[Math.floor(Math.random() * starColors.length)];
      const dimFactor = 0.4 + Math.random() * 0.4;
      deepColors[i * 3] = color.r * dimFactor;
      deepColors[i * 3 + 1] = color.g * dimFactor;
      deepColors[i * 3 + 2] = color.b * dimFactor;
    }

    deepGeo.setAttribute('position', new THREE.BufferAttribute(deepPositions, 3));
    deepGeo.setAttribute('color', new THREE.BufferAttribute(deepColors, 3));

    const deepMat = new THREE.PointsMaterial({
      size: this.isMobile ? 1.5 : 2.0,
      vertexColors: true,
      map: starTexture,
      transparent: true,
      opacity: 0.75,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const deepStars = new THREE.Points(deepGeo, deepMat);
    this.scene.add(deepStars);
    this.starGroups.push({ points: deepStars, rotSpeed: 0.00003 });

    // Layer 2: Mid-field stars
    const midGeo = new THREE.BufferGeometry();
    const midPositions = new Float32Array(starCounts[1] * 3);
    const midColors = new Float32Array(starCounts[1] * 3);

    for (let i = 0; i < starCounts[1]; i++) {
      const radius = 700 + Math.random() * 1400;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);

      midPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      midPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      midPositions[i * 3 + 2] = radius * Math.cos(phi);

      const color = starColors[Math.floor(Math.random() * starColors.length)];
      midColors[i * 3] = color.r;
      midColors[i * 3 + 1] = color.g;
      midColors[i * 3 + 2] = color.b;
    }

    midGeo.setAttribute('position', new THREE.BufferAttribute(midPositions, 3));
    midGeo.setAttribute('color', new THREE.BufferAttribute(midColors, 3));

    const midMat = new THREE.PointsMaterial({
      size: this.isMobile ? 2.2 : 3.0,
      vertexColors: true,
      map: starTexture,
      transparent: true,
      opacity: 0.85,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const midStars = new THREE.Points(midGeo, midMat);
    this.scene.add(midStars);
    this.starGroups.push({ points: midStars, rotSpeed: -0.00005 });

    // Layer 3: Bright foreground stars
    const brightGeo = new THREE.BufferGeometry();
    const brightPositions = new Float32Array(starCounts[2] * 3);
    const brightColors = new Float32Array(starCounts[2] * 3);

    for (let i = 0; i < starCounts[2]; i++) {
      const radius = 500 + Math.random() * 900;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);

      brightPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      brightPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      brightPositions[i * 3 + 2] = radius * Math.cos(phi);

      const color = starColors[Math.floor(Math.random() * 3)]; // predominantly blue/white
      brightColors[i * 3] = color.r * 1.2;
      brightColors[i * 3 + 1] = color.g * 1.2;
      brightColors[i * 3 + 2] = color.b * 1.2;
    }

    brightGeo.setAttribute('position', new THREE.BufferAttribute(brightPositions, 3));
    brightGeo.setAttribute('color', new THREE.BufferAttribute(brightColors, 3));

    const brightMat = new THREE.PointsMaterial({
      size: this.isMobile ? 3.5 : 4.8,
      vertexColors: true,
      map: starTexture,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    const brightStars = new THREE.Points(brightGeo, brightMat);
    this.scene.add(brightStars);
    this.starGroups.push({ points: brightStars, rotSpeed: 0.00008 });
  }

  generateStarSprite() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.18, 'rgba(235, 245, 255, 0.9)');
    gradient.addColorStop(0.45, 'rgba(180, 215, 255, 0.35)');
    gradient.addColorStop(0.8, 'rgba(100, 160, 255, 0.08)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.generateMipmaps = true;
    return texture;
  }

  updateStars(delta) {
    for (let i = 0; i < this.starGroups.length; i++) {
      const g = this.starGroups[i];
      g.points.rotation.y += g.rotSpeed * delta * 60;
    }
  }

  onWindowResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.isMobile = this.checkMobile();

    if (this.camera) {
      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();
    }

    if (this.renderer) {
      this.renderer.setSize(this.width, this.height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, this.isMobile ? 1.5 : 2));
    }
  }

  render() {
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }
}
