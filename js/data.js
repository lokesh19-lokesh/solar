/**
 * ASTRA - Solar System Scientific & Educational Dataset
 * Accurate scientific data, astronomical parameters, and educational narrative content.
 */

export const CELESTIAL_DATA = {
  sun: {
    id: 'sun',
    name: 'The Sun',
    type: 'Yellow Dwarf (G2V Main-Sequence Star)',
    tagline: 'The blazing heart and gravitational anchor of our Solar System',
    description: 'The Sun accounts for 99.86% of all mass in the Solar System. Powered by nuclear fusion at its core, it converts approximately 600 million tons of hydrogen into helium every second, unleashing the light and warmth that sustains life on Earth and dictates planetary climate across billions of kilometers.',
    diameter: '1,392,700 km',
    diameterRaw: 1392700,
    surfaceTemp: '5,500 °C (5,778 K)',
    coreTemp: '15,000,000 °C',
    age: '4.603 Billion Years',
    mass: '1.989 × 10³⁰ kg (333,000 Earths)',
    rotationPeriod: '25.05 Days (equator) to 34.4 Days (poles)',
    distanceFromEarth: '149.6 Million km (1.0 AU)',
    role: 'Central gravitational anchor; dictates orbital mechanics, solar wind, and heliosphere boundaries.',
    composition: '73.46% Hydrogen, 24.85% Helium, 0.77% Oxygen, 0.29% Carbon, trace metals',
    colorHex: '#ffaa00',
    visualRadius: 14.0,
    orbitRadius: 0,
    orbitSpeed: 0,
    rotationSpeed: 0.003,
    tilt: 7.25,
    facts: [
      'Over 1.3 million Earths could fit inside the Sun.',
      'Photons generated in the core take over 100,000 years to reach the surface, then just 8 minutes 20 seconds to reach Earth.',
      'The solar wind extends past Neptune, carving out a giant magnetic bubble known as the Heliosphere.'
    ]
  },

  mercury: {
    id: 'mercury',
    name: 'Mercury',
    type: 'Terrestrial Planet',
    tagline: 'The scorched, cratered swift messenger',
    description: 'The closest planet to the Sun and the smallest in the Solar System. Mercury experiences the most extreme temperature fluctuations of any planet, swinging from boiling days to liquid-nitrogen cold nights due to its virtually non-existent atmosphere.',
    distanceFromSun: '57.9 Million km (0.39 AU)',
    diameter: '4,879 km',
    diameterRaw: 4879,
    orbitalPeriod: '88 Earth Days',
    rotationPeriod: '58.6 Earth Days (3:2 spin-orbit resonance)',
    moons: 0,
    surfaceTemp: '-180 °C to 430 °C',
    gravity: '3.7 m/s² (0.38g)',
    density: '5.43 g/cm³ (second densest after Earth)',
    composition: 'Huge metallic iron core (70% of planet radius) covered by silicate crust',
    colorHex: '#a89f91',
    visualRadius: 1.2,
    orbitRadius: 32,
    orbitSpeed: 0.04,
    rotationSpeed: 0.008,
    tilt: 0.034,
    facts: [
      'Mercury has a 3:2 spin-orbit resonance, rotating three times for every two orbits around the Sun.',
      'Despite proximity to the Sun, radar observations found water ice preserved in permanently shadowed polar craters.',
      'Mercury is slowly shrinking as its colossal iron core cools and contracts.'
    ]
  },

  venus: {
    id: 'venus',
    name: 'Venus',
    type: 'Terrestrial Planet (Superheated Greenhouse)',
    tagline: 'Earth’s shrouded, volcanic twin',
    description: 'Similar in size and mass to Earth, Venus is a hellish world cloaked in opaque, reflective clouds of toxic sulfuric acid. A runaway greenhouse effect produces surface pressures 92 times greater than Earth and temperatures hot enough to melt lead.',
    distanceFromSun: '108.2 Million km (0.72 AU)',
    diameter: '12,104 km',
    diameterRaw: 12104,
    orbitalPeriod: '224.7 Earth Days',
    rotationPeriod: '243 Earth Days (Retrograde rotation)',
    moons: 0,
    surfaceTemp: '465 °C (Hottest planet in the Solar System)',
    gravity: '8.87 m/s² (0.904g)',
    density: '5.24 g/cm³',
    composition: 'Carbon dioxide atmosphere (96.5%) with sulfuric acid cloud decks; basaltic volcanic crust',
    colorHex: '#e3bb7b',
    visualRadius: 2.1,
    orbitRadius: 50,
    orbitSpeed: 0.03,
    rotationSpeed: -0.004, // Retrograde spin
    tilt: 177.3,
    facts: [
      'Venus rotates clockwise (retrograde); the Sun rises in the west and sets in the east.',
      'A day on Venus (243 Earth days) is longer than its entire year (225 Earth days).',
      'Surface atmospheric pressure equals the pressure 900 meters deep in Earth’s oceans.'
    ]
  },

  earth: {
    id: 'earth',
    name: 'Earth',
    type: 'Terrestrial Planet (Oasis of Life)',
    tagline: 'Our vibrant home in the cosmic habitable zone',
    description: 'The third planet from the Sun and the only known harbor for life in the universe. Earth features liquid water oceans covering 71% of its crust, an oxygen-rich atmosphere, an active plate tectonic engine, and a protective magnetosphere powered by its liquid outer core.',
    distanceFromSun: '149.6 Million km (1.0 AU)',
    diameter: '12,742 km',
    diameterRaw: 12742,
    orbitalPeriod: '365.25 Earth Days',
    rotationPeriod: '23.93 Hours',
    moons: 1,
    surfaceTemp: 'Average 15 °C (-89 °C to 58 °C)',
    gravity: '9.81 m/s² (1.0g)',
    density: '5.51 g/cm³ (Densest planet)',
    composition: '78% Nitrogen, 21% Oxygen, 1% Argon & trace gases; iron-nickel core, silicate mantle',
    colorHex: '#2b82c9',
    visualRadius: 2.5,
    orbitRadius: 72,
    orbitSpeed: 0.022,
    rotationSpeed: 0.015,
    tilt: 23.44,
    facts: [
      'Earth’s axial tilt of 23.44° is stabilized by our unusually large Moon, giving us dependable seasons.',
      'Our protective magnetic field shields the biosphere from lethal solar and galactic cosmic rays.',
      'Earth is the only planet known where water naturally exists simultaneously in solid, liquid, and gas phases.'
    ]
  },

  moon: {
    id: 'moon',
    name: 'The Moon (Luna)',
    type: 'Natural Satellite',
    tagline: 'Earth’s celestial companion and tidal anchor',
    description: 'Formed ~4.5 billion years ago from a colossal impact between proto-Earth and a Mars-sized planetesimal named Theia. The Moon is gravitationally tidally locked to Earth, showing only one face to our world.',
    distanceFromEarth: '384,400 km',
    diameter: '3,474 km (27% of Earth)',
    diameterRaw: 3474,
    orbitalPeriod: '27.3 Earth Days',
    rotationPeriod: '27.3 Earth Days (Tidally locked)',
    surfaceTemp: '-130 °C to 120 °C',
    gravity: '1.62 m/s² (0.166g)',
    colorHex: '#c7c9d0',
    visualRadius: 0.68,
    orbitRadius: 6.8, // Orbit around Earth
    orbitSpeed: 0.06,
    facts: [
      'The Moon causes ocean tides, stabilizing Earth’s axial wobble and preventing climate extremes.',
      'Astronauts from the Apollo missions left footprints that will endure for millions of years with no wind or water erosion.',
      'The Moon is slowly spiraling away from Earth at a rate of approximately 3.8 cm per year.'
    ]
  },

  mars: {
    id: 'mars',
    name: 'Mars',
    type: 'Terrestrial Planet (The Red Planet)',
    tagline: 'The frozen desert frontier of future exploration',
    description: 'Half the size of Earth, Mars owes its rusty crimson hue to iron oxide (rust) coating its surface regolith. Home to the Solar System’s tallest volcano (Olympus Mons) and deepest canyon (Valles Marineris), Mars preserves ancient dry river valleys from an era when liquid water flowed freely.',
    distanceFromSun: '227.9 Million km (1.52 AU)',
    diameter: '6,779 km',
    diameterRaw: 6779,
    orbitalPeriod: '687 Earth Days (1.88 Years)',
    rotationPeriod: '24.62 Hours (1 Martian Sol)',
    moons: 2, // Phobos & Deimos
    surfaceTemp: 'Average -63 °C (-140 °C to 20 °C)',
    gravity: '3.72 m/s² (0.38g)',
    density: '3.93 g/cm³',
    composition: 'Thin CO2 atmosphere (95.3%); basaltic and iron oxide crust; frozen water/CO2 polar caps',
    colorHex: '#c45837',
    visualRadius: 1.6,
    orbitRadius: 96,
    orbitSpeed: 0.016,
    rotationSpeed: 0.014,
    tilt: 25.19,
    facts: [
      'Olympus Mons stands 21.9 km high—nearly three times the height of Mount Everest.',
      'Valles Marineris stretches over 4,000 km across the equator, dwarfing Earth’s Grand Canyon.',
      'Mars has two captured asteroid moons, Phobos and Deimos; Phobos is doomed to crash into Mars in ~50 million years.'
    ]
  },

  asteroidBelt: {
    id: 'asteroidBelt',
    name: 'The Asteroid Belt',
    type: 'Circumstellar Debris Ring',
    tagline: 'Primordial rubble frozen in time by Jupiter’s gravity',
    description: 'Located between the orbits of Mars and Jupiter, this vast donut-shaped region contains millions of rocky and metallic remnants from the early Solar System. Jupiter’s massive gravitational tugs prevented these planetesimals from coalescing into a single planet.',
    distanceFromSun: '329 to 478 Million km (2.2 to 3.2 AU)',
    totalMass: 'Approx 4% the mass of Earth’s Moon (half in Ceres, Vesta, Pallas, Hygiea)',
    largestObject: 'Ceres (Dwarf Planet, 940 km diameter)',
    count: 'Estimated 1.1 to 1.9 million asteroids larger than 1 km',
    composition: 'Carbonaceous (C-type), Silicate (S-type), and Metallic nickel-iron (M-type)',
    colorHex: '#8e8a84',
    innerRadius: 122,
    outerRadius: 156,
    orbitSpeed: 0.008,
    facts: [
      'Contrary to movie depictions, the average distance between asteroids in the belt is roughly 1 million kilometers.',
      'Ceres contains a subterranean water-ice mantle and active cryovolcanoes.',
      'Meteorites landing on Earth are predominantly fragments knocked out of the asteroid belt by gravitational resonances.'
    ]
  },

  jupiter: {
    id: 'jupiter',
    name: 'Jupiter',
    type: 'Gas Giant (Colossus of the System)',
    tagline: 'The monarch of worlds and cosmic shield',
    description: 'More massive than all other planets combined (2.5 times), Jupiter is a colossal hydrogen-helium sphere. Its swirling banded atmosphere is swept by jet streams reaching 600 km/h, framing the Great Red Spot—an anticyclonic storm larger than Earth that has raged for centuries.',
    distanceFromSun: '778.5 Million km (5.20 AU)',
    diameter: '139,820 km (11 Earth diameters)',
    diameterRaw: 139820,
    orbitalPeriod: '11.86 Earth Years',
    rotationPeriod: '9.93 Hours (Fastest spin in the Solar System)',
    moons: 95, // Including Io, Europa, Ganymede, Callisto
    surfaceTemp: '-110 °C (cloud deck level)',
    gravity: '24.79 m/s² (2.53g)',
    density: '1.33 g/cm³',
    composition: '89% Hydrogen, 10% Helium, trace methane/ammonia; metallic liquid hydrogen mantle',
    colorHex: '#d8a97b',
    visualRadius: 6.2,
    orbitRadius: 195,
    orbitSpeed: 0.01,
    rotationSpeed: 0.03,
    tilt: 3.13,
    facts: [
      'Jupiter acts as a gravitational vacuum cleaner, deflecting or capturing comets that could threaten inner planets.',
      'Its moon Ganymede is the largest moon in the Solar System—larger than Mercury and Pluto.',
      'Europa conceals a global liquid ocean under its ice shell containing twice the water of all Earth’s oceans.'
    ]
  },

  saturn: {
    id: 'saturn',
    name: 'Saturn',
    type: 'Gas Giant (The Ringed Masterpiece)',
    tagline: 'Adorned by the most spectacular ring system in the cosmos',
    description: 'Famed for its thousands of dazzling ringlets made of pristine water ice and pulverized comet fragments. Saturn is the least dense planet in the Solar System—so light that it would float if placed in a sufficiently large bathtub of water.',
    distanceFromSun: '1.43 Billion km (9.58 AU)',
    diameter: '116,460 km (9 Earth diameters)',
    diameterRaw: 116460,
    orbitalPeriod: '29.45 Earth Years',
    rotationPeriod: '10.7 Hours',
    moons: 146, // Titan, Enceladus, Mimas
    surfaceTemp: '-140 °C',
    gravity: '10.44 m/s² (1.06g)',
    density: '0.687 g/cm³ (Floats in water)',
    composition: '96% Hydrogen, 3% Helium, trace methane/ammonia/ethane',
    colorHex: '#e4cd9e',
    visualRadius: 5.2,
    orbitRadius: 260,
    orbitSpeed: 0.007,
    rotationSpeed: 0.025,
    tilt: 26.73,
    ringInner: 7.2,
    ringOuter: 14.2,
    facts: [
      'Saturn’s rings span 282,000 km across, yet are astonishingly thin—averaging only 10 to 30 meters thick.',
      'Moon Titan possesses a dense nitrogen atmosphere and liquid methane/ethane lakes and rain cycles.',
      'Enceladus sprays plumes of water vapor and organic molecules into space from an underground ocean.'
    ]
  },

  uranus: {
    id: 'uranus',
    name: 'Uranus',
    type: 'Ice Giant (The Sideways World)',
    tagline: 'The tilted cyan ice giant rolling through the darkness',
    description: 'An ice giant dominated by water, ammonia, and methane ices over a small rocky core. Methane in its upper atmosphere absorbs red photons, tinting the planet a serene aquamarine. Uranus boasts a 97.77° axial tilt, rolling almost entirely on its side as it orbits.',
    distanceFromSun: '2.87 Billion km (19.2 AU)',
    diameter: '50,724 km (4 Earth diameters)',
    diameterRaw: 50724,
    orbitalPeriod: '84 Earth Years',
    rotationPeriod: '17.24 Hours (Retrograde spin)',
    moons: 28, // Miranda, Titania, Oberon, Ariel, Umbriel
    surfaceTemp: '-195 °C to -224 °C (Coldest planetary atmosphere)',
    gravity: '8.69 m/s² (0.886g)',
    density: '1.27 g/cm³',
    composition: '83% Hydrogen, 15% Helium, 2.3% Methane; mantle of super-pressurized water, ammonia, and methane ices',
    colorHex: '#88d9e6',
    visualRadius: 3.4,
    orbitRadius: 325,
    orbitSpeed: 0.005,
    rotationSpeed: -0.016,
    tilt: 97.77,
    ringInner: 4.8,
    ringOuter: 6.8,
    facts: [
      'Because of its 97.77° axial tilt, each pole experiences 42 continuous years of sunlight followed by 42 years of darkness.',
      'A massive ancient collision with an Earth-sized protoplanet is hypothesized to have knocked Uranus onto its side.',
      'Uranus features 13 known narrow rings composed of dark boulder-sized particles.'
    ]
  },

  neptune: {
    id: 'neptune',
    name: 'Neptune',
    type: 'Ice Giant (The Supersonic Wind Realm)',
    tagline: 'Deep azure realm of supersonic storms and icy geysers',
    description: 'The most distant major planet in our Solar System, located 30 times farther from the Sun than Earth. Neptune is enveloped in deep cobalt-blue clouds whipped by the fastest supersonic winds recorded anywhere in the Solar System, exceeding 2,100 km/h.',
    distanceFromSun: '4.50 Billion km (30.1 AU)',
    diameter: '49,244 km',
    diameterRaw: 49244,
    orbitalPeriod: '164.8 Earth Years',
    rotationPeriod: '16.11 Hours',
    moons: 16, // Triton, Proteus, Nereid
    surfaceTemp: '-201 °C',
    gravity: '11.15 m/s² (1.14g)',
    density: '1.64 g/cm³',
    composition: '80% Hydrogen, 19% Helium, 1.5% Methane; slushy supercritical water-ammonia mantle',
    colorHex: '#3d6cb9',
    visualRadius: 3.3,
    orbitRadius: 390,
    orbitSpeed: 0.0035,
    rotationSpeed: 0.018,
    tilt: 28.32,
    facts: [
      'Neptune was the first planet discovered via mathematical prediction (by Le Verrier and Adams) before being observed in 1846.',
      'Its largest moon Triton orbits backwards (retrograde) and shoots nitrogen cryovolcanic geysers 8 km into space.',
      'Neptune radiates 2.6 times more heat into space than it absorbs from the faint, distant Sun.'
    ]
  }
};

/**
 * Storytelling educational narrative milestones for the scroll-driven journey
 */
export const STORY_CHAPTERS = [
  {
    id: 'hero',
    planetId: null,
    chapterIndex: '00',
    title: 'EXPLORE THE SOLAR SYSTEM',
    subtitle: 'An interactive journey through our cosmic neighborhood.',
    question: 'Where are we in the boundless universe?',
    narrative: 'Orbiting a vibrant G-type star on the inner rim of the Orion Arm, our Solar System is an intricate cosmic ballet woven by gravity, thermodynamics, and 4.6 billion years of stellar evolution.',
    camPos: { x: 0, y: 75, z: 220 },
    lookAt: { x: 0, y: 0, z: 0 }
  },
  {
    id: 'overview',
    planetId: null,
    chapterIndex: '01',
    title: 'OUR SOLAR SYSTEM',
    subtitle: 'Eight planets, one star, infinite wonders.',
    question: 'What constitutes our celestial family?',
    narrative: 'Divided cleanly into the inner rocky worlds, a chaotic asteroid belt, mighty gas giants, freezing ice giants, and the distant frozen Kuiper Belt spanning tens of billions of kilometers.',
    camPos: { x: 0, y: 190, z: 360 },
    lookAt: { x: 0, y: 0, z: 0 }
  },
  {
    id: 'sun',
    planetId: 'sun',
    chapterIndex: '02',
    title: 'THE SUN',
    subtitle: 'The star at the center of our Solar System.',
    question: 'How does our parent star power the entire system?',
    narrative: 'A raging thermonuclear furnace containing 99.86% of the system’s total mass. Its gravitational well bends spacetime into the orbits that guide every planet, moon, and asteroid.',
    camPos: { x: 0, y: 16, z: 52 },
    lookAt: { x: 0, y: 0, z: 0 }
  },
  {
    id: 'mercury',
    planetId: 'mercury',
    chapterIndex: '03',
    title: 'MERCURY',
    subtitle: 'The scorched inner sentry.',
    question: 'Why does Mercury endure such temperature extremes?',
    narrative: 'Lacking a shielding atmosphere, Mercury experiences brutal 600°C temperature swings between blazing day and cryogenic night, orbiting closer to the solar corona than any other world.',
    camPos: { x: 30, y: 8, z: 42 },
    lookAt: { x: 32, y: 0, z: 0 }
  },
  {
    id: 'venus',
    planetId: 'venus',
    chapterIndex: '04',
    title: 'VENUS',
    subtitle: 'The runaway greenhouse.',
    question: 'How did Earth’s sister planet turn into an inferno?',
    narrative: 'Trapped under an ultra-dense carbon dioxide blanket with sulfuric acid clouds, Venus is the hottest planet in the Solar System, providing a cautionary tale of extreme greenhouse dynamics.',
    camPos: { x: 48, y: 9, z: 62 },
    lookAt: { x: 50, y: 0, z: 0 }
  },
  {
    id: 'earth',
    planetId: 'earth',
    chapterIndex: '05',
    title: 'EARTH & MOON',
    subtitle: 'The sanctuary of life.',
    question: 'How does Earth harbor liquid oceans and life?',
    narrative: 'Positioned precisely in the circumstellar Goldilocks zone, Earth combines an active tectonic heat engine, an atmosphere rich in oxygen and nitrogen, and a stabilizing celestial Moon.',
    camPos: { x: 70, y: 10, z: 86 },
    lookAt: { x: 72, y: 0, z: 0 }
  },
  {
    id: 'mars',
    planetId: 'mars',
    chapterIndex: '06',
    title: 'MARS',
    subtitle: 'The crimson frontier.',
    question: 'Where did the ancient Martian water go?',
    narrative: 'Once warm and wet with expansive seas, Mars lost its global magnetic shield to core cooling billions of years ago. Solar winds stripped its air, leaving a frozen rust-covered planetary desert.',
    camPos: { x: 94, y: 8, z: 110 },
    lookAt: { x: 96, y: 0, z: 0 }
  },
  {
    id: 'asteroidBelt',
    planetId: 'asteroidBelt',
    chapterIndex: '07',
    title: 'THE ASTEROID BELT',
    subtitle: 'The primordial building blocks.',
    question: 'Why did no planet form between Mars and Jupiter?',
    narrative: 'Jupiter’s colossal gravitational resonance continuously stirred this zone, accelerating planetesimals to violent collision speeds that shattered emerging bodies rather than allowing them to accrete.',
    camPos: { x: 0, y: 50, z: 175 },
    lookAt: { x: 139, y: 0, z: 0 }
  },
  {
    id: 'jupiter',
    planetId: 'jupiter',
    chapterIndex: '08',
    title: 'JUPITER',
    subtitle: 'The colossal protector.',
    question: 'How does Jupiter shield the inner terrestrial worlds?',
    narrative: 'Over two and a half times more massive than all other planets combined, Jupiter acts as a gravitational shield, capturing and deflecting stray comets and asteroids away from Earth.',
    camPos: { x: 190, y: 22, z: 225 },
    lookAt: { x: 195, y: 0, z: 0 }
  },
  {
    id: 'saturn',
    planetId: 'saturn',
    chapterIndex: '09',
    title: 'SATURN',
    subtitle: 'The ringed jewel.',
    question: 'What created Saturn’s magnificent rings?',
    narrative: 'Composed of billions of water-ice fragments and dust grains from disintegrated comets and icy moons torn apart by tidal gravitational forces within Saturn’s Roche limit.',
    camPos: { x: 254, y: 24, z: 295 },
    lookAt: { x: 260, y: 0, z: 0 }
  },
  {
    id: 'uranus',
    planetId: 'uranus',
    chapterIndex: '10',
    title: 'URANUS',
    subtitle: 'The rolling ice giant.',
    question: 'Why does Uranus rotate almost completely on its side?',
    narrative: 'Tilted at an astonishing 97.77°—likely the violent souvenir of a cataclysmic impact with an Earth-sized protoplanet during the early violent formation era of the Solar System.',
    camPos: { x: 320, y: 16, z: 355 },
    lookAt: { x: 325, y: 0, z: 0 }
  },
  {
    id: 'neptune',
    planetId: 'neptune',
    chapterIndex: '11',
    title: 'NEPTUNE',
    subtitle: 'The deep blue tempest.',
    question: 'What fuels supersonic 2,100 km/h winds so far from the Sun?',
    narrative: 'Despite receiving 900 times less sunlight than Earth, Neptune’s warm internal core radiates heat upward, driving severe atmospheric convection storms across deep methane clouds.',
    camPos: { x: 384, y: 16, z: 420 },
    lookAt: { x: 390, y: 0, z: 0 }
  },
  {
    id: 'gravity',
    planetId: null,
    chapterIndex: '12',
    title: 'GRAVITATIONAL INFLUENCE',
    subtitle: 'How gravity orchestrates planetary motion.',
    question: 'How does gravity keep planets in stable orbits?',
    narrative: 'Isaac Newton and Albert Einstein revealed that planets are in perpetual free fall toward the Sun, but their sideways orbital velocity constantly causes them to miss it, creating enduring elliptical orbits.',
    camPos: { x: 0, y: 260, z: 380 },
    lookAt: { x: 0, y: 0, z: 0 }
  },
  {
    id: 'cosmic',
    planetId: null,
    chapterIndex: '13',
    title: 'OUR COSMIC NEIGHBORHOOD',
    subtitle: 'The Solar System is only a small part of the Universe.',
    question: 'How far does the Solar System extend?',
    narrative: 'Beyond Neptune lies the Kuiper Belt, the scattered disc, and the spherical Oort Cloud spanning nearly 100,000 AU (over 1.5 light-years)—just one of hundreds of billions of planetary systems in the Milky Way.',
    camPos: { x: 0, y: 650, z: 1200 },
    lookAt: { x: 0, y: 0, z: 0 }
  }
];
