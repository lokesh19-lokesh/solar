/**
 * ASTRA - GSAP & ScrollTrigger Animation Controller
 * Coordinates scroll-driven camera choreography, chapter transitions, and UI reveals.
 */

import { STORY_CHAPTERS } from './data.js';

export class SolarAnimations {
  constructor(cameraController, planetsEngine, uiController) {
    this.camera = cameraController;
    this.planets = planetsEngine;
    this.ui = uiController;
    this.gsap = window.gsap;
    this.ScrollTrigger = window.ScrollTrigger;

    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.activeChapterId = 'hero';

    if (this.gsap && this.ScrollTrigger) {
      this.gsap.registerPlugin(this.ScrollTrigger);
    }

    this.init();
  }

  init() {
    this.setupScrollTriggers();
    this.setupHeroEntrance();
  }

  /**
   * Staggered entrance animation for hero typography
   */
  setupHeroEntrance() {
    if (this.prefersReducedMotion) return;

    const tl = this.gsap.timeline({ delay: 0.3 });

    tl.from('.hero-badge', {
      opacity: 0,
      y: -20,
      duration: 0.9,
      ease: 'power3.out'
    })
    .from('.hero-title-line', {
      opacity: 0,
      y: 45,
      stagger: 0.15,
      duration: 1.1,
      ease: 'power4.out'
    }, '-=0.6')
    .from('.hero-subtitle', {
      opacity: 0,
      y: 25,
      duration: 0.9,
      ease: 'power3.out'
    }, '-=0.6')
    .from('.hero-cta-group', {
      opacity: 0,
      y: 20,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.5')
    .from('.hero-scroll-hint', {
      opacity: 0,
      y: 15,
      duration: 0.8,
      ease: 'power3.out'
    }, '-=0.4');
  }

  /**
   * Configures ScrollTriggers for every educational story section
   */
  setupScrollTriggers() {
    if (!this.ScrollTrigger) return;

    STORY_CHAPTERS.forEach((chapter) => {
      const sectionEl = document.getElementById(`section-${chapter.id}`);
      if (!sectionEl) return;

      // Animate child HUD card entrance
      const hudCard = sectionEl.querySelector('.story-card');
      if (hudCard && !this.prefersReducedMotion) {
        this.gsap.fromTo(hudCard, 
          { opacity: 0, y: 35, scale: 0.97 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.85,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: sectionEl,
              start: 'top 70%',
              end: 'bottom 30%',
              toggleActions: 'play reverse play reverse'
            }
          }
        );
      }

      // Camera choreography trigger
      this.ScrollTrigger.create({
        trigger: sectionEl,
        start: 'top 55%',
        end: 'bottom 45%',
        onEnter: () => this.activateChapter(chapter),
        onEnterBack: () => this.activateChapter(chapter)
      });
    });
  }

  /**
   * Activates chapter: transitions camera, updates active progress dot, and highlights orbit
   */
  activateChapter(chapter) {
    if (this.activeChapterId === chapter.id) return;
    this.activeChapterId = chapter.id;

    // Update UI progress indicator
    if (this.ui) {
      this.ui.updateActiveIndicator(chapter.planetId || chapter.id);
    }

    // Highlight orbital path if associated with a planet
    if (chapter.planetId && this.planets.orbits[chapter.planetId]) {
      this.planets.highlightOrbit(chapter.planetId);
    } else {
      this.planets.resetOrbitHighlights();
    }

    // Camera movement
    const duration = this.prefersReducedMotion ? 0.3 : 1.8;

    if (chapter.planetId) {
      this.camera.focusPlanet(chapter.planetId, duration);
    } else if (chapter.id === 'hero') {
      this.camera.resetCamera(duration);
    } else if (chapter.id === 'overview') {
      this.camera.showSolarSystem(duration);
    } else if (chapter.id === 'gravity') {
      this.camera.moveTo(
        { x: 0, y: 260, z: 380 },
        { x: 0, y: 0, z: 0 },
        duration
      );
    } else if (chapter.id === 'cosmic') {
      this.camera.zoomToDeepSpace(duration * 1.4);
    }
  }

  /**
   * Programmatically scrolls to a given section ID
   */
  scrollToSection(sectionId) {
    const el = document.getElementById(`section-${sectionId}`);
    if (el) {
      el.scrollIntoView({ behavior: this.prefersReducedMotion ? 'auto' : 'smooth' });
    }
  }
}
