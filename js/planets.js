/**
 * ASTRA - Solar System Planetary Engine
 * Real-time 3D planetary physics, authentic NASA textures, dynamic Sun corona,
 * moons, orbital trails, and Orrery Motion Gallery modes.
 */

import * as THREE from 'three';
import { CELESTIAL_DATA } from './data.js';

export class SolarPlanets {
  constructor(scene, isMobile = false) {
    this.scene = scene;
    this.isMobile = isMobile;

    this.textureLoader = new THREE.TextureLoader();
    this.textures = {};

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

    // Gallery / Orrery modes: 'orbit' | 'aligned'
    this.galleryMode = 'orbit';

    this.init();
  }

  init() {
    this.loadTextures();
    this.createSun();
    this.createPlanets();
    this.createAsteroidBelt();
    this.createOrbitalPaths();
  }

  loadTextures() {
    const list = [
      'sun.jpg', 'mercury.jpg', 'venus.jpg', 'earth.jpg',
      'earth_clouds.png', 'moon.jpg', 'mars.jpg', 'jupiter.jpg',
      'saturn.jpg', 'saturn_ring.png', 'uranus.jpg', 'neptune.jpg'
    ];

    list.forEach(name => {
      const key = name.split('.')[0];
      const tex = this.textureLoader.load(
        `textures/${name}`,
        undefined,
        undefined,
        (err) => console.warn(`Texture ${name} fallback to procedural:`, err)
      );
      tex.colorSpace = THREE.SRGBColorSpace;
      this.textures[key] = tex;
    });
  }

  // ==========================================
  // 3D BILLBOARD LABELS
  // ==========================================
  createPlanetLabel(text, color = '#00f0ff') {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, 256, 64);
    ctx.font = 'bold 20px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.shadowColor = color;
    ctx.shadowBlur = 8;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text.toUpperCase(), 128, 26);

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(128, 46, 3, 0, Math.PI * 2);
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
  // CELESTIAL BODIES CREATION
  // ==========================================

  createSun() {
    const data = CELESTIAL_DATA.sun;
    const segments = this.isMobile ? 36 : 64;
    const geo = new THREE.SphereGeometry(data.visualRadius, segments, segments);

    const sunTex = this.textures.sun;
    const mat = new THREE.MeshBasicMaterial({
      map: sunTex
    });

    this.sunMesh = new THREE.Mesh(geo, mat);
    this.sunMesh.userData = { id: 'sun', data };
    this.scene.add(this.sunMesh);

    // Glowing Atmospheric Corona Shell
    const coronaGeo = new THREE.SphereGeometry(data.visualRadius * 1.3, segments, segments);
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
          intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.2);
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

    const label = this.createPlanetLabel('THE SUN', '#ffaa00');
    label.position.set(0, data.visualRadius + 6, 0);
    this.sunMesh.add(label);

    this.planets['sun'] = {
      mesh: this.sunMesh,
      pivot: this.sunMesh,
      data,
      angle: 0
    };
  }

  createPlanets() {
    const segments = this.isMobile ? 32 : 56;
    const planetKeys = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];

    const emissiveColors = {
      mercury: 0x302a22,
      venus:   0x3d301b,
      earth:   0x152c4a,
      mars:    0x38190e,
      jupiter: 0x332417,
      saturn:  0x362f1e,
      uranus:  0x1c3a44,
      neptune: 0x14284d
    };

    planetKeys.forEach(key => {
      const data = CELESTIAL_DATA[key];
      const pivot = new THREE.Group();
      this.scene.add(pivot);

      let mesh;

      if (key === 'earth') {
        this.earthGroup = new THREE.Group();
        pivot.add(this.earthGroup);

        // 1. Earth Surface (Authentic NASA Blue Marble)
        const earthGeo = new THREE.SphereGeometry(data.visualRadius, segments, segments);
        const earthMat = new THREE.MeshStandardMaterial({
          map: this.textures.earth,
          roughness: 0.5,
          metalness: 0.08,
          emissive: emissiveColors.earth,
          emissiveIntensity: 0.35
        });
        this.earthMesh = new THREE.Mesh(earthGeo, earthMat);
        this.earthMesh.rotation.z = THREE.MathUtils.degToRad(data.tilt);
        this.earthMesh.userData = { id: key, data };
        this.earthGroup.add(this.earthMesh);

        // 2. Earth Clouds (Real NASA Cloud Texture)
        const cloudGeo = new THREE.SphereGeometry(data.visualRadius * 1.02, segments, segments);
        const cloudMat = new THREE.MeshStandardMaterial({
          map: this.textures.earth_clouds,
          transparent: true,
          opacity: 0.72,
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
              gl_FragColor = vec4(0.28, 0.65, 1.0, 1.0) * intensity * 0.95;
            }
          `,
          blending: THREE.AdditiveBlending,
          side: THREE.BackSide,
          transparent: true,
          depthWrite: false
        });
        this.earthAtmosphere = new THREE.Mesh(atmosGeo, atmosMat);
        this.earthMesh.add(this.earthAtmosphere);

        // 4. Moon (Authentic NASA Lunar map)
        const moonData = CELESTIAL_DATA.moon;
        const moonGeo = new THREE.SphereGeometry(moonData.visualRadius, 28, 28);
        const moonMat = new THREE.MeshStandardMaterial({
          map: this.textures.moon,
          roughness: 0.75,
          metalness: 0.05,
          emissive: 0x30323a,
          emissiveIntensity: 0.35
        });
        this.moonMesh = new THREE.Mesh(moonGeo, moonMat);
        this.moonMesh.position.set(moonData.orbitRadius, 0, 0);
        this.moonMesh.userData = { id: 'moon', data: moonData };
        this.earthGroup.add(this.moonMesh);

        // Moon Orbit Ring
        const moonOrbitGeo = new THREE.BufferGeometry();
        const moonPts = [];
        for (let i = 0; i <= 64; i++) {
          const t = (i / 64) * Math.PI * 2;
          moonPts.push(new THREE.Vector3(Math.cos(t) * moonData.orbitRadius, 0, Math.sin(t) * moonData.orbitRadius));
        }
        moonOrbitGeo.setFromPoints(moonPts);
        this.moonOrbitLine = new THREE.LineLoop(moonOrbitGeo, new THREE.LineBasicMaterial({
          color: 0x8ab4f8,
          transparent: true,
          opacity: 0.32,
          depthWrite: false
        }));
        this.earthGroup.add(this.moonOrbitLine);

        // Label
        const label = this.createPlanetLabel('EARTH', '#3a9bf0');
        label.position.set(0, data.visualRadius + 3.4, 0);
        this.earthMesh.add(label);

        this.earthGroup.position.x = data.orbitRadius;
        mesh = this.earthMesh;

      } else {
        const geo = new THREE.SphereGeometry(data.visualRadius, segments, segments);
        const tex = this.textures[key];

        const mat = new THREE.MeshStandardMaterial({
          map: tex,
          roughness: key === 'venus' ? 0.35 : 0.65,
          metalness: 0.06,
          emissive: emissiveColors[key] || 0x222222,
          emissiveIntensity: 0.32
        });

        mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.z = THREE.MathUtils.degToRad(data.tilt);
        mesh.userData = { id: key, data };
        mesh.position.x = data.orbitRadius;
        pivot.add(mesh);

        // Saturn 3D Rings
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

          const ringMat = new THREE.MeshStandardMaterial({
            map: this.textures.saturn_ring,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.95,
            roughness: 0.5,
            metalness: 0.08,
            emissive: 0x3d3522,
            emissiveIntensity: 0.3
          });

          const ringMesh = new THREE.Mesh(ringGeo, ringMat);
          ringMesh.rotation.x = Math.PI / 2;
          mesh.add(ringMesh);
        }

        // Uranus 3D Rings
        if (key === 'uranus') {
          const uRingGeo = new THREE.RingGeometry(data.ringInner, data.ringOuter, 56);
          const uRingMat = new THREE.MeshStandardMaterial({
            color: 0x9be3ec,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.55,
            emissive: 0x4aa6b4,
            emissiveIntensity: 0.35
          });
          const uRingMesh = new THREE.Mesh(uRingGeo, uRingMat);
          uRingMesh.rotation.x = Math.PI / 2;
          mesh.add(uRingMesh);
        }

        const label = this.createPlanetLabel(key, data.colorHex);
        label.position.set(0, data.visualRadius + 3.4, 0);
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
        line.material.opacity = 0.88;
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

  /**
   * Sets Gallery view mode:
   * - 'orbit': Planets in natural orbital revolution around the Sun
   * - 'aligned': Planets lined up side-by-side along the X axis for size & scale comparison
   */
  setGalleryMode(mode) {
    this.galleryMode = mode;
    const gsap = window.gsap;

    const planetKeys = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];

    if (mode === 'aligned') {
      // Line up planets along X-axis with nice spacing
      this.orbitLinesGroup.visible = false;
      if (this.asteroidBelt) this.asteroidBelt.visible = false;

      let currentX = 25; // start next to Sun
      planetKeys.forEach(k => {
        const p = this.planets[k];
        currentX += p.data.visualRadius * 2.6 + 6;

        if (gsap) {
          gsap.to(p.pivot.rotation, { y: 0, duration: 1.5, ease: 'power2.inOut' });
          const targetObj = k === 'earth' ? this.earthGroup : p.mesh;
          gsap.to(targetObj.position, { x: currentX, z: 0, duration: 1.5, ease: 'power2.inOut' });
        }
      });
    } else {
      // Restore standard orbital radius
      this.orbitLinesGroup.visible = true;
      if (this.asteroidBelt) this.asteroidBelt.visible = true;

      planetKeys.forEach(k => {
        const p = this.planets[k];
        const targetObj = k === 'earth' ? this.earthGroup : p.mesh;
        if (gsap) {
          gsap.to(targetObj.position, { x: p.data.orbitRadius, z: 0, duration: 1.5, ease: 'power2.inOut' });
        }
      });
    }
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

      // Orbital revolution (active in 'orbit' mode)
      if (this.galleryMode === 'orbit') {
        p.angle += p.data.orbitSpeed * 0.18 * step;
        p.pivot.rotation.y = p.angle;
      }
    });

    // 3. Asteroid belt
    if (this.asteroidBelt && this.galleryMode === 'orbit') {
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
