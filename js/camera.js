/**
 * ASTRA - Camera System & Motion Controller
 * Orchestrates cinematic camera transitions, GSAP interpolations, OrbitControls, and planet tracking.
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export class SolarCamera {
  constructor(camera, renderer, planetsEngine) {
    this.camera = camera;
    this.renderer = renderer;
    this.planetsEngine = planetsEngine;

    // Current lookAt target vector
    this.target = new THREE.Vector3(0, 0, 0);
    this.currentTarget = new THREE.Vector3(0, 0, 0);

    // OrbitControls for free inspection
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enablePan = false;
    this.controls.minDistance = 3.0;
    this.controls.maxDistance = 2500;
    this.controls.maxPolarAngle = Math.PI * 0.92;
    this.controls.minPolarAngle = 0.05;

    // Tracking state
    this.trackedPlanetKey = null;
    this.isTracking = false;
    this.isTransitioning = false;
    this.currentTween = null;

    // Default hero pose
    this.defaultPos = new THREE.Vector3(0, 75, 220);
    this.defaultTarget = new THREE.Vector3(0, 0, 0);

    // Bind controls change
    this.controls.addEventListener('start', () => {
      // If user starts manually interacting, don't jerk
      if (this.currentTween) {
        this.currentTween.kill();
        this.isTransitioning = false;
      }
    });
  }

  /**
   * Helper: smoothly interpolates camera position and target vector using GSAP
   */
  moveTo(targetPos, targetLookAt, duration = 2.0, ease = 'power3.inOut', onComplete = null) {
    const gsap = window.gsap;

    if (this.currentTween) {
      this.currentTween.kill();
    }

    this.isTransitioning = true;
    this.controls.enabled = false;

    const startPos = {
      x: this.camera.position.x,
      y: this.camera.position.y,
      z: this.camera.position.z
    };

    const startLook = {
      x: this.target.x,
      y: this.target.y,
      z: this.target.z
    };

    const timeline = gsap.timeline({
      onUpdate: () => {
        this.camera.position.set(startPos.x, startPos.y, startPos.z);
        this.target.set(startLook.x, startLook.y, startLook.z);
        this.controls.target.copy(this.target);
        this.camera.lookAt(this.target);
      },
      onComplete: () => {
        this.isTransitioning = false;
        this.controls.enabled = true;
        this.controls.target.copy(this.target);
        if (onComplete) onComplete();
      }
    });

    timeline.to(startPos, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration,
      ease
    }, 0);

    timeline.to(startLook, {
      x: targetLookAt.x,
      y: targetLookAt.y,
      z: targetLookAt.z,
      duration,
      ease
    }, 0);

    this.currentTween = timeline;
    return timeline;
  }

  /**
   * Focuses on the Sun with cinematic framing
   */
  focusSun(duration = 2.2) {
    this.isTracking = false;
    this.trackedPlanetKey = null;

    const targetPos = new THREE.Vector3(0, 16, 52);
    const targetLook = new THREE.Vector3(0, 0, 0);

    return this.moveTo(targetPos, targetLook, duration);
  }

  /**
   * Focuses on a specific planet by key
   */
  focusPlanet(planetKey, duration = 2.2, customOffset = null) {
    if (planetKey === 'sun') {
      return this.focusSun(duration);
    }

    const planet = this.planetsEngine.planets[planetKey];
    if (!planet) return null;

    this.trackedPlanetKey = planetKey;
    this.isTracking = true;

    // Calculate intelligent camera framing offset based on planet radius
    const radius = planet.data.visualRadius;
    const defaultDist = Math.max(radius * 3.8, 6.0);
    const offset = customOffset || new THREE.Vector3(
      defaultDist * 0.9,
      defaultDist * 0.45,
      defaultDist * 1.3
    );

    const worldPos = this.planetsEngine.getPlanetWorldPosition(planetKey);
    const camPos = new THREE.Vector3().copy(worldPos).add(offset);

    return this.moveTo(camPos, worldPos, duration);
  }

  /**
   * Zoom specifically into Earth with close-up observation angle
   */
  zoomToEarth(duration = 2.5) {
    return this.focusPlanet('earth', duration, new THREE.Vector3(5.5, 2.5, 7.5));
  }

  /**
   * Resets camera back to default Hero overview
   */
  resetCamera(duration = 2.0) {
    this.isTracking = false;
    this.trackedPlanetKey = null;
    return this.moveTo(this.defaultPos, this.defaultTarget, duration);
  }

  /**
   * Wide Solar System overview
   */
  showSolarSystem(duration = 2.5) {
    this.isTracking = false;
    this.trackedPlanetKey = null;
    const pos = new THREE.Vector3(0, 210, 420);
    const target = new THREE.Vector3(0, 0, 0);
    return this.moveTo(pos, target, duration);
  }

  /**
   * Deep space zoom out for the final cosmic perspective section
   */
  zoomToDeepSpace(duration = 3.5) {
    this.isTracking = false;
    this.trackedPlanetKey = null;
    const pos = new THREE.Vector3(0, 750, 1350);
    const target = new THREE.Vector3(0, 0, 0);
    return this.moveTo(pos, target, duration, 'power2.inOut');
  }

  /**
   * Called on every animation loop frame
   */
  update(delta) {
    // If tracking a moving planet, keep the camera target glued to the planet
    if (this.isTracking && this.trackedPlanetKey && !this.isTransitioning) {
      const worldPos = this.planetsEngine.getPlanetWorldPosition(this.trackedPlanetKey);
      
      // Compute displacement vector
      const diff = new THREE.Vector3().subVectors(worldPos, this.controls.target);
      
      // Move camera along with the planet
      this.camera.position.add(diff);
      this.target.copy(worldPos);
      this.controls.target.copy(worldPos);
    }

    if (this.controls && this.controls.enabled) {
      this.controls.update();
    }
  }
}
