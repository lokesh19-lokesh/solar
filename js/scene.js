/**
 * ASTRA - Three.js Scene Setup & Environment
 * Handles WebGLRenderer, PerspectiveCamera, procedural starfields, and multi-source space illumination.
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
    this.cameraLight = null;
    this.hemiLight = null;
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

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.5, 9000);
    this.camera.position.set(0, 85, 230);
    this.camera.lookAt(0, 0, 0);
    this.scene.add(this.camera);

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
    this.renderer.toneMappingExposure = 1.35;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.domElement.id = 'solar-canvas';
    this.container.appendChild(this.renderer.domElement);

    // 4. Multi-Source Lighting (Ensures planets & moons are radiantly visible from any angle)
    this.setupLighting();

    // 5. Procedural Starfields
    this.createProceduralStarfields();

    // 6. Resize listener
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  setupLighting() {
    // 1. Powerful point light radiating from the Sun with gentle decay
    this.sunLight = new THREE.PointLight(0xfffaea, 7.5, 0, 0.25);
    this.sunLight.position.set(0, 0, 0);
    this.scene.add(this.sunLight);

    // 2. Space ambient light for rich, vibrant visibility of dark sides
    this.ambientLight = new THREE.AmbientLight(0xd2e3ff, 0.85);
    this.scene.add(this.ambientLight);

    // 3. Deep space hemisphere light (soft starlight fill)
    this.hemiLight = new THREE.HemisphereLight(0x8cb4e6, 0x141e30, 0.65);
    this.scene.add(this.hemiLight);

    // 4. Camera-mounted directional fill light
    // Keeps the planet surfaces brilliantly clear and illuminated during close-up inspection
    this.cameraLight = new THREE.DirectionalLight(0xffffff, 0.75);
    this.cameraLight.position.set(0, 0, 1);
    this.camera.add(this.cameraLight);
  }

  createProceduralStarfields() {
    const starCounts = this.isMobile ? [2000, 1200, 300] : [6000, 3500, 1000];

    const starColors = [
      new THREE.Color(0xffffff),
      new THREE.Color(0xdbe9ff),
      new THREE.Color(0xaec8ff),
      new THREE.Color(0xfff3da),
      new THREE.Color(0xffe6a3),
      new THREE.Color(0xffcaa1)
    ];

    const starTexture = this.generateStarSprite();

    // Layer 1: Deep field
    const deepGeo = new THREE.BufferGeometry();
    const deepPositions = new Float32Array(starCounts[0] * 3);
    const deepColors = new Float32Array(starCounts[0] * 3);

    for (let i = 0; i < starCounts[0]; i++) {
      const radius = 2200 + Math.random() * 3000;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);

      deepPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      deepPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      deepPositions[i * 3 + 2] = radius * Math.cos(phi);

      const color = starColors[Math.floor(Math.random() * starColors.length)];
      const dimFactor = 0.45 + Math.random() * 0.45;
      deepColors[i * 3] = color.r * dimFactor;
      deepColors[i * 3 + 1] = color.g * dimFactor;
      deepColors[i * 3 + 2] = color.b * dimFactor;
    }

    deepGeo.setAttribute('position', new THREE.BufferAttribute(deepPositions, 3));
    deepGeo.setAttribute('color', new THREE.BufferAttribute(deepColors, 3));

    const deepMat = new THREE.PointsMaterial({
      size: this.isMobile ? 1.8 : 2.4,
      vertexColors: true,
      map: starTexture,
      transparent: true,
      opacity: 0.8,
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
      const radius = 900 + Math.random() * 1600;
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
      size: this.isMobile ? 2.6 : 3.6,
      vertexColors: true,
      map: starTexture,
      transparent: true,
      opacity: 0.9,
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
      const radius = 600 + Math.random() * 1100;
      const theta = 2 * Math.PI * Math.random();
      const phi = Math.acos(2 * Math.random() - 1);

      brightPositions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      brightPositions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      brightPositions[i * 3 + 2] = radius * Math.cos(phi);

      const color = starColors[Math.floor(Math.random() * 3)];
      brightColors[i * 3] = color.r * 1.3;
      brightColors[i * 3 + 1] = color.g * 1.3;
      brightColors[i * 3 + 2] = color.b * 1.3;
    }

    brightGeo.setAttribute('position', new THREE.BufferAttribute(brightPositions, 3));
    brightGeo.setAttribute('color', new THREE.BufferAttribute(brightColors, 3));

    const brightMat = new THREE.PointsMaterial({
      size: this.isMobile ? 4.2 : 5.8,
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
    gradient.addColorStop(0.45, 'rgba(180, 215, 255, 0.4)');
    gradient.addColorStop(0.8, 'rgba(100, 160, 255, 0.1)');
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
