/**
 * ASTRA - Main Application Orchestrator
 * Bootstraps the 3D scene, manages the animation loop, and synchronizes real-time modules.
 */

import * as THREE from 'three';
import { SolarScene } from './scene.js';
import { SolarPlanets } from './planets.js';
import { SolarCamera } from './camera.js';
import { SolarAnimations } from './animations.js';
import { SolarInteractions } from './interactions.js';
import { SolarUI } from './ui.js';

class AstraApp {
  constructor() {
    this.scene = null;
    this.planets = null;
    this.camera = null;
    this.animations = null;
    this.interactions = null;
    this.ui = null;

    this.clock = new THREE.Clock();
    this.fpsCounter = document.getElementById('fps-counter');
    this.frameCount = 0;
    this.lastTime = performance.now();

    this.init();
  }

  init() {
    try {
      const container = document.getElementById('canvas-container');

      // 1. Scene & Renderer
      this.scene = new SolarScene(container);

      // 2. Planetary Engine
      this.planets = new SolarPlanets(this.scene.scene, this.scene.isMobile);

      // 3. Cinematic Camera Controller
      this.camera = new SolarCamera(this.scene.camera, this.scene.renderer, this.planets);

      // 4. UI Controller
      this.ui = new SolarUI(this.planets, this.camera);

      // 5. GSAP ScrollTrigger Animations
      this.animations = new SolarAnimations(this.camera, this.planets, this.ui);

      // 6. Raycasting & Interactions
      this.interactions = new SolarInteractions(this.scene, this.planets, this.camera, this.ui, this.animations);

      // Connect Hero CTA buttons
      const startBtn = document.getElementById('btn-hero-start');
      if (startBtn) {
        startBtn.addEventListener('click', () => {
          this.animations.scrollToSection('overview');
        });
      }

      const viewPlanetsBtn = document.getElementById('btn-cosmic-planets');
      if (viewPlanetsBtn) {
        viewPlanetsBtn.addEventListener('click', () => {
          this.camera.showSolarSystem(2.5);
          this.animations.scrollToSection('overview');
        });
      }

      const exploreAgainBtn = document.getElementById('btn-cosmic-again');
      if (exploreAgainBtn) {
        exploreAgainBtn.addEventListener('click', () => {
          this.camera.resetCamera(2.5);
          this.animations.scrollToSection('hero');
        });
      }

      // Progressive loading simulation
      this.runProgressiveLoader();

      // Start animation loop
      this.animate = this.animate.bind(this);
      requestAnimationFrame(this.animate);

    } catch (err) {
      console.error('Initialization error:', err);
      this.showWebGLError();
    }
  }

  runProgressiveLoader() {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 18 + 7;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
      }
      if (this.ui) {
        this.ui.updateLoader(progress);
      }
    }, 60);
  }

  showWebGLError() {
    const errorEl = document.getElementById('webgl-error-overlay');
    if (errorEl) {
      errorEl.classList.remove('hidden');
    }
  }

  animate() {
    requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);

    // 1. Update starfield parallax rotation
    if (this.scene) {
      this.scene.updateStars(delta);
    }

    // 2. Update planets rotation and orbital revolution
    if (this.planets && this.ui) {
      const speed = this.ui.isPlaying ? this.ui.speedMultiplier : 0;
      this.planets.update(delta, speed);
    }

    // 3. Update camera tracking and controls
    if (this.camera) {
      this.camera.update(delta);
    }

    // 4. Update 3D hover raycasting
    if (this.interactions) {
      this.interactions.update();
    }

    // 5. Render Scene
    if (this.scene) {
      this.scene.render();
    }

    // FPS calculation
    this.frameCount++;
    const now = performance.now();
    if (now - this.lastTime >= 1000) {
      if (this.fpsCounter) {
        this.fpsCounter.textContent = `${this.frameCount} FPS`;
      }
      this.frameCount = 0;
      this.lastTime = now;
    }
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  new AstraApp();
});
