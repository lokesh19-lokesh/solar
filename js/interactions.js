/**
 * ASTRA - 3D Raycasting & User Interactions
 * Handles hover tooltips, click/tap selection, raycasting against 3D planets, and keyboard shortcuts.
 */

import * as THREE from 'three';

export class SolarInteractions {
  constructor(sceneController, planetsEngine, cameraController, uiController, animationsController) {
    this.scene = sceneController;
    this.planets = planetsEngine;
    this.camera = cameraController;
    this.ui = uiController;
    this.animations = animationsController;

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2(-1000, -1000);
    this.hoveredObject = null;
    this.hoverTooltip = document.getElementById('planet-hover-tooltip');

    this.clickableMeshes = [];
    this.buildClickableList();

    this.initEvents();
  }

  buildClickableList() {
    this.clickableMeshes = [];
    if (this.planets.sunMesh) {
      this.clickableMeshes.push(this.planets.sunMesh);
    }
    Object.keys(this.planets.planets).forEach(k => {
      const p = this.planets.planets[k];
      if (p.mesh && p.mesh !== this.planets.sunMesh) {
        this.clickableMeshes.push(p.mesh);
      }
    });
    if (this.planets.moonMesh) {
      this.clickableMeshes.push(this.planets.moonMesh);
    }
  }

  initEvents() {
    const dom = this.scene.renderer.domElement;

    // Pointer move for hover raycasting
    window.addEventListener('pointermove', (e) => {
      this.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;

      // Update hover tooltip position
      if (this.hoverTooltip && this.hoveredObject) {
        this.hoverTooltip.style.transform = `translate3d(${e.clientX + 16}px, ${e.clientY + 16}px, 0)`;
      }
    });

    // Click / Tap on 3D canvas
    dom.addEventListener('pointerup', (e) => {
      // Ignore if user was dragging orbit controls (distance > 6px)
      if (e.defaultPrevented) return;

      this.raycaster.setFromCamera(this.pointer, this.scene.camera);
      const intersects = this.raycaster.intersectObjects(this.clickableMeshes, false);

      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (hit.userData && hit.userData.id) {
          this.selectPlanet(hit.userData.id);
        }
      }
    });

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      // Escape to close inspector
      if (e.key === 'Escape') {
        if (this.ui) this.ui.closePlanetModal();
      }

      // Space to toggle pause/play
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        if (this.ui) this.ui.togglePlayPause();
      }

      // 0-9 to quickly focus celestial bodies
      const numKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8'];
      const map = ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
      const idx = numKeys.indexOf(e.key);
      if (idx !== -1 && map[idx]) {
        this.selectPlanet(map[idx]);
      }
    });
  }

  /**
   * Action when a planet is clicked or selected from navigation
   */
  selectPlanet(planetId) {
    if (planetId === 'moon') planetId = 'earth';

    // Focus camera
    this.camera.focusPlanet(planetId, 2.0);

    // Highlight orbit
    this.planets.highlightOrbit(planetId);

    // Open detail modal HUD
    if (this.ui) {
      this.ui.openPlanetModal(planetId);
      this.ui.updateActiveIndicator(planetId);
    }
  }

  /**
   * Updates raycasting on every render frame for hover state
   */
  update() {
    this.raycaster.setFromCamera(this.pointer, this.scene.camera);
    const intersects = this.raycaster.intersectObjects(this.clickableMeshes, false);

    if (intersects.length > 0) {
      const topObj = intersects[0].object;

      if (this.hoveredObject !== topObj) {
        this.hoveredObject = topObj;
        document.body.style.cursor = 'pointer';

        if (this.hoverTooltip && topObj.userData && topObj.userData.data) {
          const d = topObj.userData.data;
          this.hoverTooltip.innerHTML = `
            <div class="tooltip-badge">CELESTIAL BODY</div>
            <div class="tooltip-title">${d.name.toUpperCase()}</div>
            <div class="tooltip-stat">${d.distanceFromSun ? d.distanceFromSun : (d.diameter || '')}</div>
            <div class="tooltip-sub">Click to inspect in 3D</div>
          `;
          this.hoverTooltip.classList.add('visible');
        }

        // Highlight orbit
        if (topObj.userData && topObj.userData.id) {
          this.planets.highlightOrbit(topObj.userData.id);
        }
      }
    } else {
      if (this.hoveredObject) {
        this.hoveredObject = null;
        document.body.style.cursor = 'default';
        if (this.hoverTooltip) {
          this.hoverTooltip.classList.remove('visible');
        }
        if (!this.camera.isTracking) {
          this.planets.resetOrbitHighlights();
        }
      }
    }
  }
}
