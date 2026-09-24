/**
 * ASTRA - User Interface & HUD Controller
 * Manages floating time simulation controls, quick navigation, scientific inspector modal,
 * 3D Planetary Gallery & Orrery modes, loading experience, and Web Audio ambient space soundscape.
 */

import { CELESTIAL_DATA } from './data.js';

export class SolarUI {
  constructor(planetsEngine, cameraController) {
    this.planets = planetsEngine;
    this.camera = cameraController;

    // Simulation state
    this.isPlaying = true;
    this.speedMultiplier = 1;
    this.speedPresets = [1, 10, 100, 1000];

    // Sound state (Web Audio API)
    this.audioCtx = null;
    this.isMuted = true;
    this.droneNodes = [];

    // DOM Elements
    this.timePlayBtn = document.getElementById('btn-time-play');
    this.timeResetBtn = document.getElementById('btn-time-reset');
    this.speedBtns = document.querySelectorAll('.speed-btn');
    this.speedDisplay = document.getElementById('speed-display-val');

    this.navPlanetBtns = document.querySelectorAll('.nav-planet-link');
    this.progressDots = document.querySelectorAll('.progress-dot');
    this.inspectorModal = document.getElementById('planet-inspector-modal');
    this.inspectorClose = document.getElementById('inspector-close-btn');

    this.soundToggleBtn = document.getElementById('sound-toggle-btn');
    this.mobileMenuBtn = document.getElementById('mobile-menu-btn');
    this.mobileNav = document.getElementById('mobile-nav-drawer');

    this.galleryModal = document.getElementById('solar-gallery-modal');
    this.galleryOpenBtn = document.getElementById('btn-open-gallery');
    this.heroGalleryBtn = document.getElementById('btn-hero-gallery');
    this.galleryCloseBtn = document.getElementById('gallery-close-btn');

    this.loaderEl = document.getElementById('app-loader');
    this.loaderProgress = document.getElementById('loader-progress-val');
    this.loaderBtn = document.getElementById('loader-enter-btn');

    this.init();
  }

  init() {
    this.setupSimulationControls();
    this.setupPlanetNavigation();
    this.setupProgressIndicator();
    this.setupInspectorModal();
    this.setupGalleryModal();
    this.setupAudio();
    this.setupMobileMenu();
    this.setupEarthButton();
  }

  // ==========================================
  // TIME SIMULATION CONTROLS
  // ==========================================

  setupSimulationControls() {
    if (this.timePlayBtn) {
      this.timePlayBtn.addEventListener('click', () => this.togglePlayPause());
    }

    if (this.timeResetBtn) {
      this.timeResetBtn.addEventListener('click', () => {
        this.speedMultiplier = 1;
        this.updateSpeedUI(1);
        if (!this.isPlaying) {
          this.togglePlayPause();
        }
      });
    }

    this.speedBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseFloat(btn.dataset.speed);
        if (!isNaN(val)) {
          this.speedMultiplier = val;
          this.updateSpeedUI(val);
        }
      });
    });
  }

  togglePlayPause() {
    this.isPlaying = !this.isPlaying;
    if (this.timePlayBtn) {
      if (this.isPlaying) {
        this.timePlayBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16"/>
            <rect x="14" y="4" width="4" height="16"/>
          </svg>
          <span>PAUSE</span>
        `;
        this.timePlayBtn.setAttribute('aria-label', 'Pause Simulation');
      } else {
        this.timePlayBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          <span>RESUME</span>
        `;
        this.timePlayBtn.setAttribute('aria-label', 'Resume Simulation');
      }
    }
  }

  updateSpeedUI(activeVal) {
    this.speedBtns.forEach(btn => {
      const val = parseFloat(btn.dataset.speed);
      if (val === activeVal) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (this.speedDisplay) {
      this.speedDisplay.textContent = `${activeVal}×`;
    }
  }

  // ==========================================
  // PLANET QUICK NAVIGATION
  // ==========================================

  setupPlanetNavigation() {
    this.navPlanetBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const planetKey = btn.dataset.planet;
        if (planetKey) {
          this.camera.focusPlanet(planetKey, 2.0);
          this.openPlanetModal(planetKey);
          this.updateActiveIndicator(planetKey);
          if (this.mobileNav) this.mobileNav.classList.remove('open');
        }
      });
    });
  }

  // ==========================================
  // VERTICAL PROGRESS INDICATOR
  // ==========================================

  setupProgressIndicator() {
    this.progressDots.forEach(dot => {
      dot.addEventListener('click', () => {
        const targetId = dot.dataset.target;
        if (targetId) {
          const section = document.getElementById(`section-${targetId}`);
          if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
          } else {
            this.camera.focusPlanet(targetId, 2.0);
            this.openPlanetModal(targetId);
          }
        }
      });
    });
  }

  updateActiveIndicator(activeKey) {
    this.progressDots.forEach(dot => {
      if (dot.dataset.target === activeKey) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    this.navPlanetBtns.forEach(btn => {
      if (btn.dataset.planet === activeKey) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // ==========================================
  // SCIENTIFIC INSPECTOR MODAL
  // ==========================================

  setupInspectorModal() {
    if (this.inspectorClose) {
      this.inspectorClose.addEventListener('click', () => this.closePlanetModal());
    }

    if (this.inspectorModal) {
      this.inspectorModal.addEventListener('click', (e) => {
        if (e.target === this.inspectorModal) {
          this.closePlanetModal();
        }
      });
    }

    const focusBtn = document.getElementById('inspector-focus-btn');
    if (focusBtn) {
      focusBtn.addEventListener('click', () => {
        const id = focusBtn.dataset.currentPlanet;
        if (id) {
          this.camera.focusPlanet(id, 2.0);
          this.closePlanetModal();
        }
      });
    }
  }

  openPlanetModal(planetKey) {
    const data = CELESTIAL_DATA[planetKey];
    if (!data || !this.inspectorModal) return;

    const titleEl = document.getElementById('inspector-title');
    const typeEl = document.getElementById('inspector-type');
    const descEl = document.getElementById('inspector-desc');
    const statsContainer = document.getElementById('inspector-stats-grid');
    const factsList = document.getElementById('inspector-facts-list');
    const focusBtn = document.getElementById('inspector-focus-btn');

    if (titleEl) titleEl.textContent = data.name;
    if (typeEl) typeEl.textContent = data.type || 'Celestial Object';
    if (descEl) descEl.textContent = data.description;
    if (focusBtn) focusBtn.dataset.currentPlanet = planetKey;

    if (statsContainer) {
      statsContainer.innerHTML = '';
      const stats = [
        { label: 'DISTANCE FROM SUN', val: data.distanceFromSun || data.distanceFromEarth || 'Center (0 AU)' },
        { label: 'DIAMETER', val: data.diameter || 'N/A' },
        { label: 'ORBITAL PERIOD', val: data.orbitalPeriod || 'Stationary Center' },
        { label: 'ROTATION PERIOD', val: data.rotationPeriod || 'N/A' },
        { label: 'NATURAL MOONS', val: data.moons !== undefined ? `${data.moons} Moons` : 'N/A' },
        { label: 'TEMPERATURE', val: data.surfaceTemp || 'N/A' },
        { label: 'SURFACE GRAVITY', val: data.gravity || 'N/A' },
        { label: 'DENSITY', val: data.density || 'N/A' }
      ];

      stats.forEach(s => {
        const card = document.createElement('div');
        card.className = 'inspector-stat-card';
        card.innerHTML = `
          <div class="stat-card-value">${s.val}</div>
          <div class="stat-card-label">${s.label}</div>
        `;
        statsContainer.appendChild(card);
      });
    }

    if (factsList && data.facts) {
      factsList.innerHTML = '';
      data.facts.forEach(fact => {
        const li = document.createElement('li');
        li.textContent = fact;
        factsList.appendChild(li);
      });
    }

    this.inspectorModal.classList.add('visible');
    document.body.classList.add('modal-open');
  }

  closePlanetModal() {
    if (this.inspectorModal) {
      this.inspectorModal.classList.remove('visible');
      document.body.classList.remove('modal-open');
    }
  }

  // ==========================================
  // 3D PLANETARY GALLERY & ORRERY MODAL
  // ==========================================

  setupGalleryModal() {
    const openModal = () => {
      if (this.galleryModal) {
        this.galleryModal.classList.add('visible');
        document.body.classList.add('modal-open');
        this.camera.showSolarSystem(2.0);
      }
    };

    const closeModal = () => {
      if (this.galleryModal) {
        this.galleryModal.classList.remove('visible');
        document.body.classList.remove('modal-open');
        this.planets.setGalleryMode('orbit');
      }
    };

    if (this.galleryOpenBtn) this.galleryOpenBtn.addEventListener('click', openModal);
    if (this.heroGalleryBtn) this.heroGalleryBtn.addEventListener('click', openModal);
    if (this.galleryCloseBtn) this.galleryCloseBtn.addEventListener('click', closeModal);

    // Gallery Mode Tabs
    const tabOrrery = document.getElementById('tab-gallery-orrery');
    const tabScale = document.getElementById('tab-gallery-scale');
    const viewTopBtn = document.getElementById('btn-view-top');
    const viewIsoBtn = document.getElementById('btn-view-iso');
    const viewInnerBtn = document.getElementById('btn-view-inner');

    if (tabOrrery) {
      tabOrrery.addEventListener('click', () => {
        tabOrrery.classList.add('active');
        if (tabScale) tabScale.classList.remove('active');
        this.planets.setGalleryMode('orbit');
        this.camera.moveTo({ x: 0, y: 240, z: 380 }, { x: 0, y: 0, z: 0 }, 2.0);
      });
    }

    if (tabScale) {
      tabScale.addEventListener('click', () => {
        tabScale.classList.add('active');
        if (tabOrrery) tabOrrery.classList.remove('active');
        this.planets.setGalleryMode('aligned');
        this.camera.moveTo({ x: 120, y: 35, z: 170 }, { x: 120, y: 0, z: 0 }, 2.2);
      });
    }

    if (viewTopBtn) {
      viewTopBtn.addEventListener('click', () => {
        this.camera.moveTo({ x: 0, y: 460, z: 1 }, { x: 0, y: 0, z: 0 }, 2.0);
      });
    }

    if (viewIsoBtn) {
      viewIsoBtn.addEventListener('click', () => {
        this.camera.moveTo({ x: 0, y: 220, z: 360 }, { x: 0, y: 0, z: 0 }, 2.0);
      });
    }

    if (viewInnerBtn) {
      viewInnerBtn.addEventListener('click', () => {
        this.camera.moveTo({ x: 0, y: 85, z: 130 }, { x: 0, y: 0, z: 0 }, 2.0);
      });
    }

    // Gallery Planet Showcase Cards
    const galleryPlanetCards = document.querySelectorAll('.gallery-card');
    galleryPlanetCards.forEach(card => {
      card.addEventListener('click', () => {
        const planetKey = card.dataset.planet;
        if (planetKey) {
          closeModal();
          this.camera.focusPlanet(planetKey, 2.2);
          this.openPlanetModal(planetKey);
          this.updateActiveIndicator(planetKey);
        }
      });
    });
  }

  // ==========================================
  // EARTH INTERACTIVE BUTTON
  // ==========================================

  setupEarthButton() {
    const exploreEarthBtn = document.getElementById('btn-explore-earth');
    if (exploreEarthBtn) {
      exploreEarthBtn.addEventListener('click', () => {
        this.camera.zoomToEarth(2.2);
        this.openPlanetModal('earth');
      });
    }
  }

  // ==========================================
  // WEB AUDIO PROCEDURAL COSMIC AMBIANCE
  // ==========================================

  setupAudio() {
    if (!this.soundToggleBtn) return;

    this.soundToggleBtn.addEventListener('click', () => {
      if (this.isMuted) {
        this.startCosmicSoundscape();
        this.isMuted = false;
        this.soundToggleBtn.classList.add('active');
        this.soundToggleBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
          </svg>
          <span>SOUND: ON</span>
        `;
      } else {
        this.stopCosmicSoundscape();
        this.isMuted = true;
        this.soundToggleBtn.classList.remove('active');
        this.soundToggleBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
            <line x1="23" y1="9" x2="17" y2="15"/>
            <line x1="17" y1="9" x2="23" y2="15"/>
          </svg>
          <span>SOUND: OFF</span>
        `;
      }
    });
  }

  startCosmicSoundscape() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!this.audioCtx) {
        this.audioCtx = new AudioContext();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const frequencies = [55.0, 82.4, 110.0, 164.8];
      const masterGain = this.audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.01, this.audioCtx.currentTime);
      masterGain.gain.exponentialRampToValueAtTime(0.12, this.audioCtx.currentTime + 3);

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, this.audioCtx.currentTime);

      frequencies.forEach((freq, idx) => {
        const osc = this.audioCtx.createOscillator();
        const oscGain = this.audioCtx.createGain();

        osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

        osc.detune.setValueAtTime((idx - 1.5) * 4, this.audioCtx.currentTime);
        oscGain.gain.setValueAtTime(0.25 / frequencies.length, this.audioCtx.currentTime);

        osc.connect(oscGain);
        oscGain.connect(filter);
        osc.start();

        this.droneNodes.push(osc);
      });

      filter.connect(masterGain);
      masterGain.connect(this.audioCtx.destination);
      this.droneNodes.push(masterGain);

    } catch (err) {
      console.warn('Web Audio could not be started:', err);
    }
  }

  stopCosmicSoundscape() {
    if (this.droneNodes.length > 0) {
      this.droneNodes.forEach(node => {
        try {
          if (node.stop) node.stop();
          if (node.disconnect) node.disconnect();
        } catch (e) {}
      });
      this.droneNodes = [];
    }
  }

  // ==========================================
  // MOBILE MENU
  // ==========================================

  setupMobileMenu() {
    if (this.mobileMenuBtn && this.mobileNav) {
      this.mobileMenuBtn.addEventListener('click', () => {
        this.mobileNav.classList.toggle('open');
        this.mobileMenuBtn.classList.toggle('active');
      });
    }
  }

  // ==========================================
  // PROGRESSIVE LOADER
  // ==========================================

  updateLoader(progress) {
    if (this.loaderProgress) {
      this.loaderProgress.textContent = `${Math.round(progress)}%`;
    }

    if (progress >= 100 && this.loaderBtn) {
      this.loaderBtn.classList.remove('hidden');
      this.loaderBtn.addEventListener('click', () => {
        if (this.loaderEl) {
          this.loaderEl.classList.add('fade-out');
          setTimeout(() => {
            this.loaderEl.style.display = 'none';
          }, 800);
        }
      });
    }
  }
}
