// Zaza Woods Esstisch-Konfigurator — Main Application
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { TABLE_SHAPES, MATERIAL_TYPES, EDGE_OPTIONS, POWDER_COAT_COLORS, DEFAULT_STATE } from './config.js?v=3cc5e8c';

// ─── Zaza Woods Untergestell whitelist (user-supplied 2026-06-19) ───
// model = { name, isWood }  → green card, clicking loads 3D model
// model = null               → red card, clicking selects the name but renders no 3D leg
const ZW_LEG_LIST = [
  // Metal Tischbeine + Gestelle (top of zaza-woods table)
  { uiName: 'Spider Tischbein (L)',                   model: null },
  { uiName: 'Spider Tischbein (M)',                   model: null },
  { uiName: 'Spider Tischbein (S)',                   model: { name: 'Matrix', isWood: false } },
  { uiName: 'Konisches Spidertischbein',              model: { name: 'Konische Spider', isWood: false } },
  { uiName: 'Drone Tischbeine (Satz)',                model: null },
  { uiName: 'Aeris Tischbein',                        model: { name: 'Lara', isWood: false } },
  { uiName: 'Doppel V-Tischbein',                     model: { name: 'Vedo', isWood: false } },
  { uiName: 'V-Tischbein',                            model: { name: 'V-Form', isWood: false } },
  { uiName: 'Thorn Tischbeine (Satz)',                model: { name: 'Pedro', isWood: false } },
  { uiName: 'Felix Tischbein',                        model: { name: 'Stative', isWood: false } },
  { uiName: 'Vario Tischbein',                        model: { name: 'Thore', isWood: false } },
  { uiName: 'Spider Tischbein – Schmal (Rund)',       model: null },
  { uiName: 'Spider Gestell (rund)',                  model: null },
  { uiName: 'X Tischgestell (Satz)',                  model: { name: 'X-Form', isWood: false } },
  { uiName: 'X Bank- & Couchtischgestell (Satz)',     model: null },
  { uiName: 'Trapezium Tischgestell (Satz)',          model: null },
  { uiName: 'A Tischgestell (Satz)',                  model: { name: 'A-Form', isWood: false } },
  { uiName: 'A Tischgestell (schmal) (Satz)',         model: null },
  { uiName: 'U Tischgestell (Satz)',                  model: null },
  { uiName: 'U Tischgestell (M) (Satz)',              model: null },
  { uiName: 'U Tischgestell (schmal) (Satz)',         model: null },
  { uiName: 'U Bank- & Couchtischgestell (Satz)',     model: null },
  { uiName: 'Stahlwangen Tischgestell (Satz)',        model: null },
  { uiName: 'Stahlwangen Tischgestell (S) (Satz)',    model: null },
  { uiName: 'Bartisch Gestell',                       model: null },
  { uiName: 'Spider Tischgestell Edelstahl',          model: null },
  { uiName: 'Spider Tischgestell Edelstahl (S)',      model: null },
  // Wood Tischbeine (bottom of zaza-woods table)
  { uiName: 'Aeris Tischbein aus Eichenholz',                       model: { name: 'Lara', isWood: true } },
  { uiName: 'Ovale Holzsäule aus Eiche-Stäbchenholz',               model: { name: 'Wellen-Säule', isWood: true } },
  { uiName: 'Runde Holzsäule aus Eiche-Stäbchenholz',               model: { name: 'Wellen-Rund', isWood: true } },
  { uiName: 'Ovale Tischbeine aus Eiche-Stäbchenholz (Satz)',       model: { name: 'Wellen-Duo', isWood: true } },
  { uiName: 'Ovale Tischbeine aus Eichenholz (Satz)',               model: null },
  { uiName: 'Butterfly Tischbeine aus Eichenholz (Satz)',           model: null },
  { uiName: 'Runde Holzsäule aus Eichenholz (Satz)',                model: { name: 'Pilares', isWood: true } },
  { uiName: 'Halbrunde Tischbeine aus Eichenholz (Satz)',           model: { name: 'Hapa',    isWood: true } }
];

// ─── ZW live product data (loaded async from zw-products.json) ───
let ZW_PRODUCTS_DATA = null;
async function loadZWProducts() {
  if (ZW_PRODUCTS_DATA) return ZW_PRODUCTS_DATA;
  try {
    const r = await fetch('/configurator/js/zw-products.json?v=' + Date.now(), { cache: 'no-store' });
    if (r.ok) {
      ZW_PRODUCTS_DATA = await r.json();
      console.log('[ZW] product data loaded', Object.keys(ZW_PRODUCTS_DATA));
    } else {
      console.warn('[ZW] zw-products.json fetch returned', r.status);
    }
  } catch (e) {
    console.warn('[ZW] could not load zw-products.json', e);
  }
  return ZW_PRODUCTS_DATA;
}

const EDGE_TITLE_MAP = {
  standaard: ['Gerade Kanten'],
  facet:     ['Schweizer Kanten'],
  boomstam:  ['Baumstammkanten']
};

// ZW Behandlung name → our local oak color id (for 3D texture lookup)
const BEHANDLUNG_TEXTURE_MAP = {
  'Pure':                    'pure',
  'Unsichtbarer Skylt-Lack': 'natural',
  'Chocolate':               'chocolate',
  'Cocoa':                   'cocoa',
  'Cortado':                 'macchiato',
  'Shell Grey':              'shell-grey',
  'Black':                   'yakisugi',
  'Deep Black':              'deep-black',
  'Super White':             'white5',
  'White':                   'white5',
  'White 5%':                'white5',
  'Macchiato':               'macchiato',
  'Smoke':                   'charcoal',
  'Dulce':                   'vanilla',
  'Walnut':                  'walnut',
  // 5 new ZW Behandlung products (added 2026-06-20)
  'Natural':                 'natural',
  'Mist':                    'mist',
  'Vanilla':                 'vanilla',
  'Charcoal':                'charcoal',
  'Yakisugi':                'yakisugi'
};


// Map ZW Tischgestell title → 3D model in our GLBs (name + isWood).
// Titles not in the map are still rendered as a card, but as a 'no-model' red entry.
const ZW_LEG_MODEL_MAP = {
  'Spider Tischgestell (S)':                            { name: 'Matrix',          isWood: false },
  'Konisches Spidertischgestell':                       { name: 'Konische Spider', isWood: false },
  'Thorn Tischgestelle (Satz)':                         { name: 'Pedro',           isWood: false },
  'V Tischgestell':                                     { name: 'V-Form',          isWood: false },
  'X Tischgestell (Satz)':                              { name: 'X-Form',          isWood: false },
  'A Tischgestell (Satz)':                              { name: 'A-Form',          isWood: false },
  'Aeris Tischgestell aus Eichenholz':                  { name: 'Lara',            isWood: true  },
  'Ovale Holzsäule aus Stäbchenholz, Eiche':            { name: 'Wellen-Säule',    isWood: true  },
  'Runde Holzsäule aus Stäbchenholz, Eiche':            { name: 'Wellen-Rund',     isWood: true  },
  'Ovale Tischgestelle aus Eiche-Stäbchenholz (Satz)':  { name: 'Wellen-Duo',      isWood: true  },
  'Runde Holzsäule aus Eichenholz (Satz) (A)':          { name: 'Pilares',         isWood: true  },
  'Halbrunde Tischbeine aus Eichenholz (Satz) (A)':     { name: 'Hapa',            isWood: true  },
  // External GLB legs — name matches the legObject.displayName loaded from external file
  'Spider Tischgestell (L)':                            { name: 'Spider Tischgestell (L)',                      isWood: false },
  'Spider Tischgestell (M)':                            { name: 'Spider Tischgestell (M)',                      isWood: false },
  'Spider Tischbein (M)':                               { name: 'Spider Tischgestell (M)',                      isWood: false },   // same 3D as 'Spider Tischgestell (M)'
  'Spider Tischgestell Edelstahl':                      { name: 'Spider Tischgestell Edelstahl',                isWood: false },
  'Spider Tischgestell Edelstahl (S)':                  { name: 'Spider Tischgestell Edelstahl (S)',            isWood: false },
  'U Tischgestell (Satz)':                              { name: 'U Tischgestell (Satz)',                        isWood: false },
  'U Tischgestell (M) (Satz)':                          { name: 'U Tischgestell (M) (Satz)',                    isWood: false },
  'Trapezium Tischgestell (Satz)':                      { name: 'Trapezium Tischgestell (Satz)',                isWood: false },
  'Spider Gestell (rund)':                              { name: 'Spider Gestell (rund)',                        isWood: false },
  'Spider Gestell - Schmal (Rund)':                     { name: 'Spider Gestell - Schmal (Rund)',               isWood: false },
  'Butterfly Tischbeine aus Eichenholz (Satz) (A)':     { name: 'Hannah',          isWood: true  },
  'Ovale Tischgestelle aus Eichenholz (Satz)':          { name: 'Wellen-Duo',      isWood: true  },
  'Aeris Tischbein':                                    { name: 'Lara',            isWood: false },
  'Doppel V-Tischbein':                                 { name: 'Vedo',            isWood: false },
  'Felix Tischbein':                                    { name: 'Stative',         isWood: false },
  'Vario Tischbein':                                    { name: 'Thore',           isWood: false },
  'Drone Tischbeine (Satz)':                            { name: 'Drone Tischbeine (Satz)',                    isWood: false },
  'U Tischgestell (schmal) (Satz)':                     { name: 'U Tischgestell (schmal) (Satz)',             isWood: false },
  'Stahlwangen Tischgestell (Satz)':                    { name: 'Stahlwangen Tischgestell (Satz)',            isWood: false },
  'Stahlwangen Tischgestell (S) (Satz)':                { name: 'Stahlwangen Tischgestell (S) (Satz)',        isWood: false }
};

// External standalone leg GLBs (user-supplied 2026-06-27)
const EXTERNAL_LEG_FILES = {
  'A Tischgestell (Satz)':                            'A Tischgestell (Satz).glb',
  'Spider Gestell (rund)':                            'Spider Gestell (rund) 100x100cm.glb',
  'Spider Gestell - Schmal (Rund)':                   'Spider Tischbein - Schmal (Rund).glb',
  'Spider Tischgestell (L)':                          'Spider Tischbein (L).glb',
  'Spider Tischgestell (M)':                          'Spider Tischbein (M).glb',
  'Spider Tischgestell Edelstahl':                    'Spider Tischgestell Edelstahl.glb',
  'Spider Tischgestell Edelstahl (S)':                'Spider Tischgestell Edelstahl (S).glb',
  'Trapezium Tischgestell (Satz)':                    'Trapezium Tischgestell (Satz).glb',
  'U Tischgestell (Satz)':                            'U Tischgestell (Satz).glb',
  'U Tischgestell (M) (Satz)':                        'U Tischgestell (M) (Satz).glb',
  'Drone Tischbeine (Satz)':                          'Drone Tischbeine (Satz).glb',
  'U Tischgestell (schmal) (Satz)':                   'U Tischgestell (schmal) (Satz).glb',
  'Stahlwangen Tischgestell (Satz)':                  'Stahlwangen Tischgestell (Satz).glb',
  'Stahlwangen Tischgestell (S) (Satz)':              'Stahlwangen Tischgestell (S) (Satz).glb',
};

// Persistent cache of loaded external leg gltf.scene clones — reused across shape switches.
const EXTERNAL_LEG_CACHE = new Map();

// Catalog-only legs from /collections/tischgestelle that aren't sold as addons on any Esstisch.
const CATALOG_ONLY_LEGS = [
  // Only legs that have a 3D model AND aren't sold as an addon on any Esstisch page.
  { title: 'Drone Tischbeine (Satz)',             variantId: '51011118039306', price: 34500 },
  { title: 'Stahlwangen Tischgestell (Satz)',     variantId: '44218834026762', price: 56000 },
  { title: 'Stahlwangen Tischgestell (S) (Satz)', variantId: '44218853032202', price: 56000 }
];


// Exclusion patterns: never show items whose ZW title matches these (per user)
const LEG_TITLE_EXCLUDE = /Bank-|Couchtisch|Bartisch|Ovale Tischgestelle aus Eichenholz/i;  // Bartisch + Ovale Eichenholz excluded per user


function buildZWSizeKey(shape, state) {
  if (shape === 'round')    return `${state.length}cm x 4cm`;
  if (shape === 'halfrond') return `${state.length} cm / ${state.width}`;
  return `${state.length}cm x ${state.width}cm x 4cm`;
}

function findBaseVariant(product, shape, state) {
  if (!product) return null;
  const want = buildZWSizeKey(shape, state);
  const direct = product.baseVariants.find(v => v.title === want || v.opt1 === want);
  if (direct) return direct;
  const lenPrefix = `${state.length}cm`;
  return product.baseVariants.find(v => (v.opt1||'').startsWith(lenPrefix)) || product.baseVariants[0];
}

import { fetchAllPrices, calculateTotal, getLineItems, formatPrice, addToCart } from './shopify.js?v=3cc5e8c';

class TableConfigurator {
  constructor() {
    this.state = { ...DEFAULT_STATE, radius: 0, topThickness: 4 };
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.currentModel = null;
    this.groundPlane = null;
    this.loader = new GLTFLoader();
    this.textureLoader = new THREE.TextureLoader();
    this.textureCache = {};
    this.modelCache = {};
    this.baseBBox = null;
    this.isLoading = false;

    // Leg system
    this.tabletopObject = null;
    this.legObjects = [];
    this.activeLegIndex = 0;
    this.hasSeparateTop = false;
    this.originalTopBox = null; // Bounding box of GLB tabletop at load time

    // Variant system: two tabletop objects for shapes with hasVariant
    this.tabletopVariantA = null;
    this.tabletopVariantB = null;
    this.tabletopOriginalScaleA = null;
    this.tabletopOriginalScaleB = null;

    // Morph animation system
    this.morphAnim = null; // current animation frame ID
    this.morphDuration = 400; // ms

    // Apply URL parameters to initial state
    this.applyURLParams();

    this.init();
  }

  // ─── URL State ───────────────────────────────

  applyURLParams() {
    const params = new URLSearchParams(window.location.search);
    if (params.has('shape')) {
      const shape = TABLE_SHAPES.find(s => s.id === params.get('shape') || s.name.toLowerCase() === params.get('shape').toLowerCase());
      if (shape) this.state.shape = shape.id;
    }
    if (params.has('material')) {
      const mat = params.get('material').toLowerCase();
      // Material switcher hidden per design: always keep oak (ceramic data retained internally).
      this.state.materialType = 'oak';
      void mat;
    }
    if (params.has('color')) {
      const colorId = params.get('color');
      const matType = MATERIAL_TYPES[this.state.materialType];
      if (matType.colors.find(c => c.id === colorId || c.name.toLowerCase() === colorId.toLowerCase())) {
        const match = matType.colors.find(c => c.id === colorId || c.name.toLowerCase() === colorId.toLowerCase());
        this.state.color = match.id;
      }
    }
    if (params.has('length')) this.state.length = parseInt(params.get('length')) || this.state.length;
    if (params.has('width')) this.state.width = parseInt(params.get('width')) || this.state.width;
    if (params.has('edge')) {
      const edgeId = params.get('edge');
      if (EDGE_OPTIONS.find(e => e.id === edgeId || e.name.toLowerCase() === edgeId.toLowerCase())) {
        const match = EDGE_OPTIONS.find(e => e.id === edgeId || e.name.toLowerCase() === edgeId.toLowerCase());
        this.state.edge = match.id;
      }
    }
    if (params.has('leg')) this._preferredLegName = params.get('leg');
    if (params.has('powder')) {
      const pwId = params.get('powder');
      if (POWDER_COAT_COLORS.find(p => p.id === pwId || p.name.toLowerCase() === pwId.toLowerCase())) {
        const match = POWDER_COAT_COLORS.find(p => p.id === pwId || p.name.toLowerCase() === pwId.toLowerCase());
        this.state.powderCoat = match.id;
      }
    }
    if (params.has('variant')) {
      const v = params.get('variant').toLowerCase();
      if (v === 'a' || v === 'b') this.state.variant = v;
    }
    if (params.has('thickness')) {
      this.state.topThickness = parseFloat(params.get('thickness')) || this.state.topThickness;
    }
    if (params.has('radius')) {
      this.state.radius = parseInt(params.get('radius')) || 0;
    }
  }

  updateURL() {
    const s = this.state;
    const leg = this.legObjects[this.activeLegIndex];
    const params = new URLSearchParams();
    params.set('shape', s.shape);
    params.set('material', s.materialType);
    params.set('color', s.color);
    params.set('length', s.length);
    params.set('width', s.width);
    params.set('edge', s.edge);
    if (leg) params.set('leg', leg.displayName);
    params.set('powder', s.powderCoat);
    if (s.variant && s.variant !== 'a') params.set('variant', s.variant);
    if (s.topThickness && s.topThickness !== 4) params.set('thickness', s.topThickness);
    if (s.radius) params.set('radius', s.radius);
    const url = `${window.location.pathname}?${params.toString()}`;
    history.replaceState(null, '', url);

    // Notify parent page (Shopify) to update its URL
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'configurator-state', params: params.toString() }, 'https://zazawoods.de');
    }
  }

  // ─── Scene Setup ──────────────────────────────

  init() {
    this.setupScene();
    this.setupLighting();
    this.setupGround();
    this.setupControls();
    this.setupUI();
    // Fetch Shopify prices in background, update price once both prices and model are ready
    this._pricesReady = false;
    fetchAllPrices().then(() => {
      this._pricesReady = true;
      loadZWProducts().then(() => { this.updatePrice(); this.renderLegGrid(); this.updateColorSwatches(); });
      this.updatePrice();
    });
    this.loadModel(this.state.shape);
    this.animate();
    this.fixMobileHeight();
    this.requestParentGapFix();
    window.addEventListener('resize', () => this.onResize());
    // iOS Safari fires visualViewport resize when the address bar shows/hides
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => this.fixMobileHeight());
    }
  }

  setupScene() {
    const canvas = document.getElementById('canvas3d');
    const viewer = document.getElementById('viewer');

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf5f4f2);
    this.scene.fog = new THREE.Fog(0xf5f4f2, 12, 30);

    this.camera = new THREE.PerspectiveCamera(
      35, viewer.clientWidth / viewer.clientHeight, 0.1, 100
    );
    this.camera.position.set(4.0, 0.55, 5.5);

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    this.renderer.setSize(viewer.clientWidth, viewer.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
  }

  setupLighting() {
    // Soft ambient fill
    const ambient = new THREE.AmbientLight(0xffffff, 0.65);
    this.scene.add(ambient);

    // Hemisphere: warm sky, cool ground
    const hemi = new THREE.HemisphereLight(0xfff8f0, 0xe0ddd8, 0.45);
    hemi.position.set(0, 10, 0);
    this.scene.add(hemi);

    // Key light — warm, creates the main highlight on the tabletop
    const keyLight = new THREE.DirectionalLight(0xfffaf0, 1.1);
    keyLight.position.set(3, 8, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 25;
    keyLight.shadow.camera.left = -5;
    keyLight.shadow.camera.right = 5;
    keyLight.shadow.camera.top = 5;
    keyLight.shadow.camera.bottom = -5;
    keyLight.shadow.bias = -0.0003;
    keyLight.shadow.radius = 16; // very blurred, foggy shadow
    this.scene.add(keyLight);

    // Highlight spot — focused warm light on the tabletop for dramatic effect
    const spotLight = new THREE.SpotLight(0xfff5e6, 0.6, 12, Math.PI / 5, 0.7, 1);
    spotLight.position.set(1, 5, 1);
    spotLight.target.position.set(0, 0.4, 0);
    this.scene.add(spotLight);
    this.scene.add(spotLight.target);

    // Fill light — cool, from left-back
    const fillLight = new THREE.DirectionalLight(0xf0f2f8, 0.35);
    fillLight.position.set(-4, 6, -3);
    this.scene.add(fillLight);

    // Rim/back light — illuminates the table edge from behind
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
    rimLight.position.set(-1, 2, -5);
    this.scene.add(rimLight);

    // Edge light — low angle from front to illuminate the edge profile
    const edgeLight = new THREE.DirectionalLight(0xfff8f0, 0.5);
    edgeLight.position.set(2, 0.8, 5);
    this.scene.add(edgeLight);

    // Store max anisotropy for texture quality
    this.maxAnisotropy = this.renderer.capabilities.getMaxAnisotropy();

    // Environment map for premium reflections on tabletop
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    const envScene = new THREE.Scene();

    // Rich studio-like environment with gradient and multiple light sources
    // Warm ceiling
    const ceilingGeo = new THREE.PlaneGeometry(20, 20);
    const ceilingMat = new THREE.MeshBasicMaterial({ color: 0xfff8f0, side: THREE.DoubleSide });
    const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceiling.position.set(0, 8, 0);
    ceiling.rotation.x = Math.PI / 2;
    envScene.add(ceiling);

    // Cool floor reflection
    const envFloorGeo = new THREE.PlaneGeometry(20, 20);
    const envFloorMat = new THREE.MeshBasicMaterial({ color: 0xe8e6e2, side: THREE.DoubleSide });
    const envFloor = new THREE.Mesh(envFloorGeo, envFloorMat);
    envFloor.position.set(0, -2, 0);
    envFloor.rotation.x = -Math.PI / 2;
    envScene.add(envFloor);

    // Back wall — subtle warm tone
    const backWallGeo = new THREE.PlaneGeometry(20, 10);
    const backWallMat = new THREE.MeshBasicMaterial({ color: 0xf0ece6, side: THREE.DoubleSide });
    const backWall = new THREE.Mesh(backWallGeo, backWallMat);
    backWall.position.set(0, 3, -8);
    envScene.add(backWall);

    // Key light area (bright, warm — simulates window)
    const keyLightGeo = new THREE.PlaneGeometry(4, 4);
    const keyLightMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const keyLightPanel = new THREE.Mesh(keyLightGeo, keyLightMat);
    keyLightPanel.position.set(5, 6, 3);
    keyLightPanel.lookAt(0, 0, 0);
    envScene.add(keyLightPanel);

    // Fill light area (softer, cooler)
    const fillLightGeo = new THREE.PlaneGeometry(3, 3);
    const fillLightMat = new THREE.MeshBasicMaterial({ color: 0xe0e4ea, side: THREE.DoubleSide });
    const fillLightPanel = new THREE.Mesh(fillLightGeo, fillLightMat);
    fillLightPanel.position.set(-5, 5, -2);
    fillLightPanel.lookAt(0, 0, 0);
    envScene.add(fillLightPanel);

    // Small bright accent (creates specular highlights on ceramic)
    const accentGeo = new THREE.PlaneGeometry(1, 1);
    const accentMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const accentPanel = new THREE.Mesh(accentGeo, accentMat);
    accentPanel.position.set(2, 7, -1);
    accentPanel.lookAt(0, 0, 0);
    envScene.add(accentPanel);

    this.envMap = pmremGenerator.fromScene(envScene, 0.04).texture;
    this.scene.environment = this.envMap;
    pmremGenerator.dispose();
  }

  setupGround() {
    // Floor — exact same color as background for seamless look
    const floorGeo = new THREE.PlaneGeometry(50, 50);
    const floorMat = new THREE.MeshBasicMaterial({ color: 0xf5f4f2 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.005;
    this.scene.add(floor);

    // Shadow-only plane on top — blurred, soft shadow
    const shadowGeo = new THREE.PlaneGeometry(50, 50);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.05, color: 0x000000 });
    this.groundPlane = new THREE.Mesh(shadowGeo, shadowMat);
    this.groundPlane.rotation.x = -Math.PI / 2;
    this.groundPlane.position.y = -0.001;
    this.groundPlane.receiveShadow = true;
    this.scene.add(this.groundPlane);
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.06;
    this.controls.enablePan = false;
    this.controls.target.set(0, 0.4, 0);
    this.controls.minPolarAngle = Math.PI * 0.15;
    this.controls.maxPolarAngle = Math.PI * 0.49;
    this.controls.minDistance = 1.5;
    this.controls.maxDistance = 8;
    this.controls.update();
  }

  // ─── Model Loading & Part Discovery ───────────

  async loadModel(shapeId) {
    const shape = TABLE_SHAPES.find(s => s.id === shapeId);
    if (!shape) return;

    // Load-token: if a newer loadModel() is called before this one finishes,
    // we abort silently so we never overwrite the newer state with stale data.
    const myToken = (this._loadToken = (this._loadToken || 0) + 1);
    const isStale = () => this._loadToken !== myToken;

    this.isLoading = true;
    this.showLoader();

    // Keep the old model visible until the new one is ready
    const previousModel = this.currentModel;

    try {
      let gltf;
      if (this.modelCache[shapeId]) {
        gltf = this.modelCache[shapeId];
      } else {
        gltf = await this.loadGLTF(shape.glbFile);
        if (isStale()) { return; }  // newer load took over — drop this result
        this.modelCache[shapeId] = gltf;
      }
      if (isStale()) { return; }

      // Now remove the old model (new one is about to be added)
      if (previousModel) {
        this.scene.remove(previousModel);
        this.currentModel = null;
      }

      const model = gltf.scene.clone(true);
      model.updateMatrixWorld(true);

      // Discover tabletop and legs within this model
      this.discoverModelParts(model, shape);

      // Try to restore previously selected leg by name, otherwise use first
      this.activeLegIndex = 0;
      if (this._preferredLegName) {
        const shape = TABLE_SHAPES.find(s => s.id === this.state.shape);
        const excludeLegs = shape?.excludeLegs || [];
        const matchIdx = this.legObjects.findIndex(l =>
          l.displayName === this._preferredLegName && !excludeLegs.includes(l.displayName)
        );
        if (matchIdx >= 0) this.activeLegIndex = matchIdx;
        this._preferredLegName = null;
      }
      this.legObjects.forEach((leg, i) => {
        leg.object.visible = (i === this.activeLegIndex);
      });

      // Create mirrored tabletop for GLB-based variant shapes (not procedural ones like Luna)
      const isProcedural = (shape.id === 'rectangle' || shape.id === 'verbaan');
      if (shape.hasVariant && this.tabletopObject && !isProcedural) {
        this.createMirroredTabletop(model);
      } else {
        this.tabletopVariantA = null;
        this.tabletopVariantB = null;
        this.tabletopOriginalScaleA = null;
        this.tabletopOriginalScaleB = null;
      }

      // Store original tabletop bounding box for thickness scaling
      if (this.tabletopObject) {
        this.tabletopObject.visible = true;
        const topBox = new THREE.Box3().setFromObject(this.tabletopObject);
        this.originalTopBox = {
          minY: topBox.min.y,
          maxY: topBox.max.y,
          height: topBox.max.y - topBox.min.y
        };
      }

      // Center model based on tabletop (the visual anchor), use full model for floor Y
      this.legObjects.forEach(l => l.object.visible = true);
      if (this.tabletopObject) this.tabletopObject.visible = true;
      model.updateMatrixWorld(true);

      if (this.tabletopObject) {
        const topBox = new THREE.Box3().setFromObject(this.tabletopObject);
        const topCenter = topBox.getCenter(new THREE.Vector3());
        // Use lowest point of all legs for the floor
        const fullBox = new THREE.Box3().setFromObject(model);
        model.position.set(-topCenter.x, -fullBox.min.y, -topCenter.z);
        this.baseBBox = { size: topBox.getSize(new THREE.Vector3()).clone(), center: topCenter.clone() };
      } else {
        // No separate top — use first visible leg's bounding box
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        model.position.set(-center.x, -box.min.y, -center.z);
        this.baseBBox = { size: box.getSize(new THREE.Vector3()).clone(), center: center.clone() };
      }

      // Align legs so none protrude above the tabletop bottom
      if (this.hasSeparateTop && this.tabletopObject) {
        model.updateMatrixWorld(true);
        const topBox = new THREE.Box3().setFromObject(this.tabletopObject);
        const tabletopBottomY = topBox.min.y;

        this.legObjects.forEach(leg => {
          const legBox = new THREE.Box3().setFromObject(leg.object);
          const overshoot = legBox.max.y - tabletopBottomY;
          if (overshoot > 0.001) {
            // Shift leg down so its top aligns with tabletop bottom
            // Position is in model-local space (model.scale = 1), overshoot is in world space
            leg.object.position.y -= overshoot;
          }
        });
      }

      // Store FINAL original positions (after overshoot fix) and compute geometry centers
      model.updateMatrixWorld(true);
      this.legObjects.forEach(leg => {
        leg.originalPosition = leg.object.position.clone();
        leg.originalScale = leg.object.scale.clone();

        // Compute world-space bounding box for this leg
        const wasVisible = leg.object.visible;
        leg.object.visible = true;
        const legBox = new THREE.Box3().setFromObject(leg.object);
        leg.geomCenterX = (legBox.min.x + legBox.max.x) / 2;
        leg.geomExtentX = legBox.max.x - legBox.min.x; // total X width
        leg.object.visible = wasVisible;
      });

      // (Centering is handled dynamically in applyDimensions for all central legs)

      // Split set legs into left/right halves for independent repositioning
      this.legObjects.forEach(leg => {
        if (this.isSetLeg(leg.displayName)) {
          this.splitSetLeg(leg);
        }
      });

      // Re-hide legs (only active one stays visible)
      this.legObjects.forEach((leg, i) => {
        leg.object.visible = (i === this.activeLegIndex);
      });

      // For shapes without a separate tabletop (Halfrond, Boogvorm),
      // create a procedural tabletop since the GLB only contains leg structures
      if (!this.hasSeparateTop && this.legObjects.length > 0) {
        this.createProceduralTop(model, shape);
      }

      // Always show tabletop for shapes with separate top
      if (this.tabletopObject) {
        this.tabletopObject.visible = true;
      }

      // Enable shadows
      model.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      this.currentModel = model;
      this.scene.add(model);

      // Remap GLB tabletop UVs for consistent wood grain appearance
      this.remapTabletopUVs();

      // Apply leg material synchronously (no texture fetch needed)
      this.applyActiveLegMaterial();

      // Build leg UI
      this.renderLegGrid();

      this.applyDimensions();

      // Apply top material — don't await so the model shows immediately
      // The texture will pop in once loaded (usually from cache)
      this.applyTopMaterial(this.state.materialType, this.state.color);

      // Final visibility enforcement — ensure only the active leg is visible
      this.legObjects.forEach((leg, i) => {
        leg.object.visible = (i === this.activeLegIndex);
      });
      if (this.tabletopObject) this.tabletopObject.visible = true;

      // Only frame camera on first load, not on shape switches
      if (!this._initialCameraSet) {
        this.frameCameraToModel();
        this._initialCameraSet = true;
      }

    } catch (err) {
      console.error('Error loading model:', err);
      // On error, keep the previous model visible — don't leave an empty scene.
      // If previousModel was already removed during the success path before the error,
      // re-add it so the user still sees something.
      if (previousModel && !this.scene.children.includes(previousModel)) {
        this.scene.add(previousModel);
        this.currentModel = previousModel;
      }
    } finally {
      // Only clear loading state if we're STILL the latest load.
      // If we're stale, the newer load owns isLoading + the loader UI.
      if (this._loadToken === myToken) {
        this.isLoading = false;
        this.hideLoader();
      }
    }
    // Stop here if we got superseded — don't run price/preload for stale load
    if (this._loadToken !== myToken) return;

    // Refresh price now that leg is known (prices may have loaded while model was loading)
    this.updatePrice();

    // Preload all other GLB files in background for instant shape switching
    if (!this._preloadStarted) {
      this._preloadStarted = true;
      this.preloadAllModels();
    }
  }

  async preloadAllModels() {
    // Load one at a time so we never compete with a user-triggered loadModel
    // for bandwidth or the GLTFLoader's DRACO worker.
    const toLoad = TABLE_SHAPES.filter(s => !this.modelCache[s.id]);
    for (const shape of toLoad) {
      try {
        // Yield to any pending user click first
        await new Promise(r => setTimeout(r, 0));
        const gltf = await this.loadGLTF(shape.glbFile, { silent: true });
        this.modelCache[shape.id] = gltf;
      } catch (e) {
        // Silently skip failed preloads
      }
    }
  }

  // Bootsform internal legs: register each leg-type parent as its own
  // legObject. Size-specific parents (e.g. A_Frame_LEG with 8 size children)
  // are stored in this._bootsformInternalLegs so we can swap the visible size
  // child on state.length change.
  _registerBootsformInternalLegs(container) {
    this._bootsformInternalLegs = []; // array of {parent, sizeChildren:Map<len,child>}
    // Bootsform leg-type internal name → external display name (via ZW_LEG_MODEL_MAP)
    // We just use the parent node name as displayName here; user-facing name comes
    // from ZW_LEG_MODEL_MAP mapping via the button click.
    const legTypeMap = {
      // GLB parent name → displayName used by ZW_LEG_MODEL_MAP
      '_4_Legs_on_Pole_LEG_ALL_SIZE':          { name: 'Vera',            isWood: false },
      'A_Frame_LEG':                            { name: 'A-Form',          isWood: false },
      'A_Shape_Wood_LEG':                       { name: 'A-Form',          isWood: true  },
      'Butterfly_LEG':                          { name: 'Butterfly',       isWood: false },
      'Butterfly_Wood_LEG':                     { name: 'Hannah',          isWood: true  },
      'DIAGONAL_POLE_LEG_REC_TABLE':            { name: 'Diago',           isWood: false },
      'Hairpin_LEG_REC_TABLE':                  { name: 'Hairpin',         isWood: false },
      'HALF_ROUNDED_SLAB_LEG_REC_TABLE':        { name: 'Hapa',            isWood: true  },
      'Half_Spider_LEG_ALL_SIZE':               { name: 'Konische Spider', isWood: false },
      'Japandi_Wood_Slab_LEG':                  { name: 'Wellen-Duo',      isWood: true  },
      'Klos_LEG':                               { name: 'Klos',            isWood: true  },
      'Konische_Spider_Metal_LEG_ALL_SIZE':     { name: 'Konische Spider', isWood: false },
      'Konische_Spider_Wood_LEG_ALL_SIZE':      { name: 'Konische Spider', isWood: true  },
      'MATRIX_LEG_ALL_SIZE':                    { name: 'Matrix',          isWood: false },
      'Miakdo_Leg_ALL_SIZE':                    { name: 'Mikado',          isWood: false },
      'Open_Spider_LEG_ALL_SIZE':               { name: 'Spider Open',     isWood: false },
      'Oval_Column_in_middle_wood_LEG_ALL_SIZE':{ name: 'Wellen-Säule',    isWood: true  },
      'Pillars_Metal_LEG_REC_TABLE':            { name: 'Pillars',         isWood: false },
      'Pillars_Wood_LEG_REC_TABLE':             { name: 'Pilares',         isWood: true  },
      'Triple_LEG':                             { name: 'Triple',          isWood: false },
      'U_Shape_LEG':                            { name: 'U-Shape-internal',isWood: false }, // external U preferred
      'V_Shape_LEG_ALL_SIZE':                   { name: 'V-Form',          isWood: false },
      'Walrus_LEG':                             { name: 'Walrus',          isWood: false },
      'X_Modern_LEG':                           { name: 'Ekso',            isWood: false },
      'X_Shape_LEG':                            { name: 'X-Form',          isWood: false }
    };
    const availableLengths = [180, 200, 220, 240, 260, 280, 300, 350];
    const targetLength = this.state.length || 240;
    let bestLen = availableLengths[0], bestDiff = Infinity;
    for (const L of availableLengths) {
      const d = Math.abs(L - targetLength);
      if (d < bestDiff) { bestDiff = d; bestLen = L; }
    }

    for (const parent of container.children) {
      if (!parent || !parent.name) continue;
      const info = legTypeMap[parent.name];
      if (!info) { parent.visible = false; continue; }
      // Parent starts HIDDEN — loadModel's forEach will set the active one
      // to visible=true, all others stay false. Only the size-matching child
      // is left visible on the parent, so activating it renders one mesh.
      parent.visible = false;

      // Case 1: single-mesh ALL_SIZE leg (parent is a Mesh directly, or has 1 child)
      if (parent.name.endsWith('_ALL_SIZE')) {
        this.legObjects.push({
          object: parent,
          rawName: parent.name,
          displayName: info.name,
          isWood: info.isWood,
          originalScale: parent.scale.clone(),
          originalPosition: parent.position.clone(),
          childOrigScales: parent.children.map(ch => ch.scale.clone()),
          geomCenterX: null,
          bootsformInternal: true
        });
        continue;
      }

      // Case 2: parent contains 8 size children — pick the matching one
      const sizeChildren = new Map();
      for (const c of parent.children) {
        const m = c.name && c.name.match(/_(\d+)_(\d+)$/);
        if (!m) continue;
        const len = parseInt(m[2], 10);
        sizeChildren.set(len, c);
        c.visible = false;
      }
      let picked = sizeChildren.get(bestLen);
      if (!picked) {
        // fallback: nearest
        let ndiff = Infinity;
        for (const [L, c] of sizeChildren) {
          const d = Math.abs(L - bestLen);
          if (d < ndiff) { ndiff = d; picked = c; }
        }
      }
      if (picked) picked.visible = true;

      this._bootsformInternalLegs.push({ parent, sizeChildren });
      this.legObjects.push({
        object: parent,
        rawName: parent.name,
        displayName: info.name,
        isWood: info.isWood,
        originalScale: parent.scale.clone(),
        originalPosition: parent.position.clone(),
        childOrigScales: parent.children.map(ch => ch.scale.clone()),
        geomCenterX: null,
        bootsformInternal: true
      });
    }
  }

  // Swap the visible size child on all Bootsform internal legs (called when
  // state.length changes).
  _swapBootsformInternalLegSizes() {
    if (!this._bootsformInternalLegs || this._bootsformInternalLegs.length === 0) return;
    const availableLengths = [180, 200, 220, 240, 260, 280, 300, 350];
    const targetLength = this.state.length || 240;
    let bestLen = availableLengths[0], bestDiff = Infinity;
    for (const L of availableLengths) {
      const d = Math.abs(L - targetLength);
      if (d < bestDiff) { bestDiff = d; bestLen = L; }
    }
    for (const entry of this._bootsformInternalLegs) {
      entry.sizeChildren.forEach(c => { c.visible = false; });
      let picked = entry.sizeChildren.get(bestLen);
      if (!picked) {
        let ndiff = Infinity;
        for (const [L, c] of entry.sizeChildren) {
          const d = Math.abs(L - bestLen);
          if (d < ndiff) { ndiff = d; picked = c; }
        }
      }
      if (picked) picked.visible = true;
    }
  }

  // Pick which of the 32 Bootsform tabletops should be visible based on the
  // current state.length and state.edge. Returns the node (or null if none).
  _pickBootsformTabletop(shape) {
    if (!this._bootsformTabletops) return null;
    // Bootsform sizes available in GLB: 180,200,220,240,260,280,300,350
    const availableLengths = [180, 200, 220, 240, 260, 280, 300, 350];
    const targetLength = this.state.length || (shape && shape.defaultLength) || 240;
    // Snap to nearest available length (400 → 350 since GLB has no 400 mesh)
    let bestLen = availableLengths[0], bestDiff = Infinity;
    for (const L of availableLengths) {
      const d = Math.abs(L - targetLength);
      if (d < bestDiff) { bestDiff = d; bestLen = L; }
    }
    // Map state.edge → GLB edge suffix. Only Straight is universally safe.
    // Bootsform GLB has 4 edge variants; use "Straight" for now to avoid
    // rendering upward-tilted tabletops.
    const edgeMap = {
      'standaard': 'Straight',
      'facet':     'Schweizer_Kante',
      'boomstam':  '20_Degrees_Inversed'
    };
    const edgeKey = edgeMap[this.state.edge] || 'Straight';
    // Try preferred key, fall back to Straight if not present in GLB
    let node = this._bootsformTabletops.get(`${edgeKey}|${bestLen}`);
    if (!node) node = this._bootsformTabletops.get(`Straight|${bestLen}`);
    return node || null;
  }

  // Swap which Bootsform tabletop is visible (called from applyDimensions).
  _swapBootsformTabletop(shape) {
    if (!this._bootsformTabletops) return false;
    const newActive = this._pickBootsformTabletop(shape);
    if (!newActive) return false;
    // If already active, nothing to do
    if (newActive === this.tabletopObject && newActive.visible) return false;
    // Hide all 32
    this._bootsformTabletops.forEach(n => { n.visible = false; });
    // Show new active
    newActive.visible = true;
    this.tabletopObject = newActive;
    this.tabletopOriginalScale = newActive.scale.clone();
    // Reset variant references so applyDimensions treats this as the single top
    this.tabletopVariantA = null;
    this.tabletopVariantB = null;
    this.tabletopOriginalScaleA = null;
    this.tabletopOriginalScaleB = null;
    return true;
  }

  discoverModelParts(model, shape) {
    this.tabletopObject = null;
    this.legObjects = [];
    this.hasSeparateTop = false;
    this._bootsformTabletops = null; // reset per-shape

    const tabletopPatterns = [/table.?top/i, /standaard/i];
    const allowedPrefixes = shape.meshPrefix || [];

    // ─── Bootsform: 32 tabletop meshes (4 edges × 8 sizes) — pick only the one
    //     matching current length+edge, hide the rest. Otherwise all 32 would
    //     render on top of each other → texture jumping + tilted-up edges.
    if (shape.id === 'bootsform') {
      const boatTops = model.getObjectByName('Boat_Table_Tops');
      if (boatTops) {
        this._bootsformTabletops = new Map(); // key: `${edge}|${length}` → node
        boatTops.traverse(node => {
          if (!node.name || !/^Boat_Table_Top_/.test(node.name)) return;
          // Skip container node itself
          if (node === boatTops) return;
          // Parse: Boat_Table_Top_<Edge>_<Width>_<Length>
          //   e.g. Boat_Table_Top_Straight_120_260
          //        Boat_Table_Top_Schweizer_Kante_120_260
          //        Boat_Table_Top_20_Degrees_120_260
          //        Boat_Table_Top_20_Degrees_Inversed_120_260
          const parts = node.name.replace(/^Boat_Table_Top_/, '').split('_');
          const lenStr = parts.pop();
          const widthStr = parts.pop();
          const edgeKey = parts.join('_') || 'Straight';
          const length = parseInt(lenStr, 10);
          if (!isFinite(length)) return;
          const key = `${edgeKey}|${length}`;
          this._bootsformTabletops.set(key, node);
          // Hide by default; we'll pick the active one below
          node.visible = false;
        });
        // Pick the active tabletop
        const activeNode = this._pickBootsformTabletop(shape);
        if (activeNode) {
          activeNode.visible = true;
          this.tabletopObject = activeNode;
          this.tabletopOriginalScale = activeNode.scale.clone();
          this.hasSeparateTop = true;
        }
        // Keep Boat_Table_Tops container visible (it's a group; individual
        // sub-mesh visibility is what we toggle)
        boatTops.visible = true;
      }
    }

    model.children.forEach((child) => {
      const meshNames = [];
      child.traverse(c => { if (c.name) meshNames.push(c.name); });
      const allNames = meshNames.join(' ');

      if (meshNames.length === 0 && !child.name) return;

      // Skip Bootsform tabletop container — handled specially above
      if (shape.id === 'bootsform' && child.name === 'Boat_Table_Tops') return;

      // Bootsform's built-in legs group: 25 leg-type parents. Each is either
      // a single _ALL_SIZE mesh OR a group with 8 size-specific children.
      // Register each parent as a legObject; parent starts hidden and only
      // the size-matching child of size-groups is left visible so that once
      // switchLeg activates the parent, only 1 mesh renders (not 8 sizes).
      if (shape.id === 'bootsform' && child.name === 'Boat_Shape_Table_Legs_All_Size') {
        child.visible = true;
        this._registerBootsformInternalLegs(child);
        return;
      }

      // Check if this is the tabletop
      const isTop = tabletopPatterns.some(p => p.test(allNames));

      if (isTop) {
        this.tabletopObject = child;
        this.tabletopOriginalScale = child.scale.clone();
        this.hasSeparateTop = true;
      } else {
        const primaryName = meshNames.find(n => n && !n.endsWith('_1') && !n.endsWith('_2')) || meshNames[0] || child.name || '';
        if (!primaryName) return;
        if (/^Rectangle\d*$/.test(primaryName)) { child.visible = false; return; }

        // Filter: only keep legs matching this shape's prefix
        const belongsToShape = allowedPrefixes.some(p => primaryName.startsWith(p));
        if (!belongsToShape) {
          child.visible = false;
          return;
        }

        // Skip collapsed meshes
        const childBox = new THREE.Box3().setFromObject(child);
        const childSize = childBox.getSize(new THREE.Vector3());
        if (childSize.x < 0.01 && childSize.y < 0.01 && childSize.z < 0.01) {
          child.visible = false;
          return;
        }

        const displayName = this.extractLegName(primaryName);
        const isWood = this.isWoodLeg(allNames);

        // Store original scales of direct children for counter-scale restoration
        const childOrigScales = child.children.map(ch => ch.scale.clone());

        this.legObjects.push({
          object: child,
          rawName: primaryName,
          displayName,
          isWood,
          originalScale: child.scale.clone(),
          originalPosition: child.position.clone(),
          childOrigScales,
          geomCenterX: null // computed after model is positioned
        });
      }
    });

    // Create metal clones of specified wood legs
    const woodToMetalClones = ['Lara'];
    for (const cloneName of woodToMetalClones) {
      const woodLeg = this.legObjects.find(l => l.displayName === cloneName && l.isWood);
      if (woodLeg) {
        const clonedObj = woodLeg.object.clone(true);
        clonedObj.name = woodLeg.rawName.replace(/WOOD/gi, 'METAL') + '_clone';
        clonedObj.visible = false;
        model.add(clonedObj);
        this.legObjects.push({
          object: clonedObj,
          rawName: clonedObj.name,
          displayName: cloneName,
          isWood: false,
          originalScale: clonedObj.scale.clone(),
          originalPosition: clonedObj.position.clone(),
          childOrigScales: clonedObj.children.map(ch => ch.scale.clone()),
          geomCenterX: null
        });
      }
    }

    // Load external standalone leg GLBs and register as additional legObjects.
    // Fire-and-forget (no await) — re-render leg grid as each completes.
    const enclosingThis = this;
    // Capture the load token this discoverModelParts run belongs to.
    // If the user switches shape mid-load, any async external-leg callback that fires
    // AFTER the new shape took over will see a mismatch and skip — preventing stale
    // dead-reference legs from polluting the new shape's legObjects array.
    const ownerToken = enclosingThis._loadToken;
    Object.entries(EXTERNAL_LEG_FILES).forEach(([title, file]) => {
      const registerLoaded = (sceneObj) => {
        // Stale-load guard
        if (enclosingThis._loadToken !== ownerToken) return;
        // Wrap each external leg in a Group — for U/Trapezium we add TWO instances
        // (one at each end of the table), for everyone else just one centered.
        const group = new THREE.Group();
        group.name = '__ext_group__' + title;
        const isPair = /^U Tischgestell|^Trapezium Tischgestell|^Stahlwangen Tischgestell|^Drone Tischbeine/i.test(title);
        const isDrone = /^Drone Tischbeine/i.test(title);
        const placements = isPair
          ? [{ x: -0.75, mirror: false }, { x: 0.75, mirror: true }]   // pair: second instance faces opposite
          : [{ x: 0, mirror: false }];                                    // single centered
        for (const pl of placements) {
          const inst = sceneObj.clone(true);
          // Most external GLBs were modelled with Z-axis as length, but our tables
          // use X-axis as length. Rotate them 90° so the long side aligns.
          // For paired legs, second instance gets +180° so it mirrors (like Thorn).
          // Drone: each leg faces outward (opposite directions), so we swap which one gets the flip.
          if (isDrone) {
            inst.rotation.y = pl.x < 0 ? -Math.PI / 2 : Math.PI / 2;
          } else {
            inst.rotation.y = Math.PI / 2 + (pl.mirror ? Math.PI : 0);
          }
          inst.position.x = pl.x;
          // Edelstahl variants: brushed-steel look instead of black
          if (/Edelstahl/i.test(title)) {
            inst.traverse(ch => {
              if (ch.isMesh && ch.material) {
                const mats = Array.isArray(ch.material) ? ch.material : [ch.material];
                for (const m of mats) {
                  m.color = new THREE.Color(0xb8babd);   // brushed-steel grey
                  m.metalness = 0.9;
                  m.roughness = 0.35;
                  if ('emissive' in m) m.emissive = new THREE.Color(0x000000);
                  m.needsUpdate = true;
                }
              }
            });
          }
          group.add(inst);
        }
        group.visible = false;
        model.add(group);
        const isWood = /Eichenholz|Stäbchenholz|Holzsäule/i.test(title);
        enclosingThis.legObjects.push({
          object: group,
          rawName: '__external__' + title,
          displayName: title,
          isWood,
          external: true,
          originalScale: group.scale.clone(),
          originalPosition: group.position.clone(),
          childOrigScales: group.children.map(ch => ch.scale.clone()),
          geomCenterX: null
        });
        // Re-render leg grid — debounced so we run at most once per 50ms,
        // not once per external leg (12 in a row was killing the UI thread).
        if (typeof enclosingThis.renderLegGrid === 'function') {
          clearTimeout(enclosingThis._legGridTimer);
          enclosingThis._legGridTimer = setTimeout(() => enclosingThis.renderLegGrid(), 50);
        }
        // If user clicked this leg while it was still loading (activeLegIndex
        // stayed at whatever it was, no 3D swap happened) — auto-switch to
        // this newly-loaded leg so the click "takes effect" without another
        // click from the user.
        if (enclosingThis.state.zwLegName === title && enclosingThis.state.userPickedLeg) {
          const idx = enclosingThis.legObjects.length - 1;
          try { enclosingThis.switchLeg(idx); } catch(e) { /* swallow */ }
        }
      };
      const cached = EXTERNAL_LEG_CACHE.get(title);
      if (cached) { registerLoaded(cached); return; }
      const url = '../glb files tables and legs/external-legs/' + encodeURIComponent(file);
      enclosingThis.loader.load(url,
        (gltf) => { EXTERNAL_LEG_CACHE.set(title, gltf.scene); registerLoaded(gltf.scene); },
        undefined,
        (err) => { console.warn('[ZW] external leg load failed:', title, err?.message || err); }
      );
    });

    // Sort legs: wood first, then metal; within each group sort by position distance
    // from origin (legs closer to tabletop center look better as default)
    this.legObjects.sort((a, b) => {
      // Wood before metal
      if (a.isWood !== b.isWood) return a.isWood ? -1 : 1;
      // Then by distance from origin
      const distA = Math.sqrt(a.object.position.x ** 2 + a.object.position.z ** 2);
      const distB = Math.sqrt(b.object.position.x ** 2 + b.object.position.z ** 2);
      return distA - distB;
    });

    // Per-leg length scale overrides (X axis = table length direction)
    // Reduces leg length while keeping width unchanged
    const legLengthOverrides = {
      'Stative': 0.75,
      'Lara': 0.85,
      'Konische Spider': 0.90,
      'Vera': 0.85,
      'Criss Cross': 0.80,
      'Cona': 0.75
    };
    // Per-leg depth (Y axis) overrides — local Y → world Z due to -90° X rotation
    const legDepthOverrides = {
      'Cona': 0.75
    };
    for (const leg of this.legObjects) {
      const factor = legLengthOverrides[leg.displayName];
      if (factor) {
        leg.originalScale.x *= factor;
        leg.object.scale.x = leg.originalScale.x;
      }
      const yFactor = legDepthOverrides[leg.displayName];
      if (yFactor) {
        leg.originalScale.y *= yFactor;
        leg.object.scale.y = leg.originalScale.y;
      }
    }

    if (this.legObjects.length > 0) {
      const activeLeg = this.legObjects[this.activeLegIndex] || this.legObjects[0];
      document.getElementById('val-legs').textContent =
        this.state.zwLegName || `${activeLeg.displayName}${activeLeg.isWood ? ' (Holz)' : ''}`;
      this.state.legId = activeLeg.rawName;
    }
  }

  // ─── Variant Mirroring ────────────────────────

  createMirroredTabletop(model) {
    if (!this.tabletopObject) return;

    const clone = this.tabletopObject.clone(true);
    clone.name = 'tabletop_variant_b';

    // Determine which LOCAL axis to mirror based on wrapper rotation.
    // If wrapper has Y/Z swap (rotateX ±90°), local Y maps to world Z,
    // so we mirror local Y to get a world-Z mirror.
    // Otherwise, local Z maps to world Z, so we mirror local Z.
    const mirrorY = this.hasYZSwap(this.tabletopObject);

    clone.traverse((child) => {
      if (!child.isMesh || !child.geometry) return;

      // Clone geometry so we don't affect the original
      child.geometry = child.geometry.clone();
      const pos = child.geometry.attributes.position;

      // Negate the correct axis for world-Z mirroring
      for (let i = 0; i < pos.count; i++) {
        if (mirrorY) {
          pos.setY(i, -pos.getY(i));
        } else {
          pos.setZ(i, -pos.getZ(i));
        }
      }
      pos.needsUpdate = true;

      // Fix winding order (mirroring one axis reverses face winding)
      const index = child.geometry.index;
      if (index) {
        const arr = index.array;
        for (let i = 0; i < arr.length; i += 3) {
          const tmp = arr[i + 1];
          arr[i + 1] = arr[i + 2];
          arr[i + 2] = tmp;
        }
        index.needsUpdate = true;
      }

      // Recompute normals for correct lighting
      child.geometry.computeVertexNormals();
    });

    clone.visible = false;
    model.add(clone);

    this.tabletopVariantA = this.tabletopObject;
    this.tabletopVariantB = clone;
    this.tabletopOriginalScaleA = this.tabletopObject.scale.clone();
    this.tabletopOriginalScaleB = clone.scale.clone();
  }

  // ─── UV Remapping ──────────────────────────────

  // Replace UV mapping of GLB tabletop meshes with top-down planar projection
  // This ensures all tabletops show wood grain consistently (matching procedural tabletops)
  remapTabletopUVs() {
    if (!this.tabletopObject) return;

    // Remap UVs on all variant tabletops
    const variants = [this.tabletopVariantA, this.tabletopVariantB, this.tabletopObject].filter(Boolean);
    const seen = new Set();
    for (const variant of variants) {
      if (seen.has(variant)) continue;
      seen.add(variant);
      this._remapVariantUVs(variant);
    }
  }

  _remapVariantUVs(variant) {
    // For Bootsform: skip side/top split, use pure planar XZ (fixes wood grain jumps on boat curves)
    const forcePlanar = this.state.shape === 'bootsform';
    variant.traverse((child) => {
      if (!child.isMesh || !child.geometry) return;

      const geo = child.geometry;
      const pos = geo.attributes.position;
      const norm = geo.attributes.normal;
      if (!pos) return;

      child.updateWorldMatrix(true, false);
      const worldMatrix = child.matrixWorld;
      const normalMatrix = new THREE.Matrix3().getNormalMatrix(worldMatrix);

      // First pass: compute bounding box and center in world space
      let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
      let minY = Infinity, maxY = -Infinity;
      const tempVec = new THREE.Vector3();
      const tempNorm = new THREE.Vector3();

      for (let i = 0; i < pos.count; i++) {
        tempVec.set(pos.getX(i), pos.getY(i), pos.getZ(i));
        tempVec.applyMatrix4(worldMatrix);
        minX = Math.min(minX, tempVec.x);
        maxX = Math.max(maxX, tempVec.x);
        minZ = Math.min(minZ, tempVec.z);
        maxZ = Math.max(maxZ, tempVec.z);
        minY = Math.min(minY, tempVec.y);
        maxY = Math.max(maxY, tempVec.y);
      }

      const rangeX = maxX - minX || 1;
      const rangeZ = maxZ - minZ || 1;
      const rangeY = maxY - minY || 1;
      const centerX = (minX + maxX) / 2;
      const centerZ = (minZ + maxZ) / 2;

      // Second pass: assign UVs based on face orientation
      const uvArray = new Float32Array(pos.count * 2);

      for (let i = 0; i < pos.count; i++) {
        tempVec.set(pos.getX(i), pos.getY(i), pos.getZ(i));
        tempVec.applyMatrix4(worldMatrix);

        // Check normal direction to determine if this is a top/bottom or side vertex
        let isSide = false;
        if (norm && !forcePlanar) {
          tempNorm.set(norm.getX(i), norm.getY(i), norm.getZ(i));
          tempNorm.applyMatrix3(normalMatrix).normalize();
          // Side face: normal is mostly horizontal (small Y component)
          isSide = Math.abs(tempNorm.y) < 0.5;
        }

        if (isSide) {
          // Edge/side: use angle around center for U, height for V
          // This wraps the texture around the perimeter like real endgrain
          const angle = Math.atan2(tempVec.z - centerZ, tempVec.x - centerX);
          const perimeter = (angle + Math.PI) / (2 * Math.PI); // 0..1 around the shape
          const height = (tempVec.y - minY) / rangeY; // 0..1 bottom to top
          uvArray[i * 2] = perimeter * 4; // repeat 4x around perimeter
          uvArray[i * 2 + 1] = height * 2; // repeat 2x over height
        } else {
          // Top/bottom face: planar projection
          // Reference: 300cm x 120cm = full texture visible
          // Smaller tables crop (zoom into center), larger stay at full
          const refX = 3.0;  // 300cm in meters
          const refZ = 1.2;  // 120cm in meters

          // How much of UV 0-1 range this table covers
          const uScale = Math.min(rangeX / refX, 1.0);
          const vScale = Math.min(rangeZ / refZ, 1.0);

          // Center the crop
          const uOff = (1 - uScale) / 2;
          const vOff = (1 - vScale) / 2;

          // Normalized position within tabletop (0-1)
          const normX = (tempVec.x - minX) / rangeX;
          const normZ = (tempVec.z - minZ) / rangeZ;

          uvArray[i * 2] = uOff + normX * uScale;
          uvArray[i * 2 + 1] = vOff + normZ * vScale;
        }
      }

      geo.setAttribute('uv', new THREE.BufferAttribute(uvArray, 2));
    });
  }

  // Remap UVs on a leg mesh for wood grain display.
  // U = height (vertical), V = angle around Y axis.
  // Combined with the texture rotation, this gives consistent grain direction.
  remapLegUVs(mesh) {
    const geo = mesh.geometry;
    const pos = geo.attributes.position;
    if (!pos) return;

    mesh.updateWorldMatrix(true, false);
    const worldMatrix = mesh.matrixWorld;

    let minY = Infinity, maxY = -Infinity;
    const tempVec = new THREE.Vector3();

    for (let i = 0; i < pos.count; i++) {
      tempVec.set(pos.getX(i), pos.getY(i), pos.getZ(i));
      tempVec.applyMatrix4(worldMatrix);
      minY = Math.min(minY, tempVec.y);
      maxY = Math.max(maxY, tempVec.y);
    }

    const rangeY = maxY - minY || 1;
    const uvArray = new Float32Array(pos.count * 2);

    for (let i = 0; i < pos.count; i++) {
      tempVec.set(pos.getX(i), pos.getY(i), pos.getZ(i));
      tempVec.applyMatrix4(worldMatrix);

      // U = angle around Y axis (wraps texture around the leg)
      // V = height (grain runs vertically top to bottom)
      uvArray[i * 2] = (Math.atan2(tempVec.z, tempVec.x) + Math.PI) / (2 * Math.PI);
      uvArray[i * 2 + 1] = (tempVec.y - minY) / rangeY;
    }

    geo.setAttribute('uv', new THREE.BufferAttribute(uvArray, 2));
  }

  // Box projection UV mapping: uses vertex normals to choose the best projection
  // plane per-vertex, ensuring grain runs vertically on all surfaces
  remapLegUVsBoxProjection(mesh) {
    const geo = mesh.geometry;
    const pos = geo.attributes.position;
    if (!pos) return;

    // Ensure normals exist
    if (!geo.attributes.normal) geo.computeVertexNormals();
    const nor = geo.attributes.normal;

    mesh.updateWorldMatrix(true, false);
    const wm = mesh.matrixWorld;
    // Normal matrix (inverse transpose of upper-left 3x3)
    const nm = new THREE.Matrix3().getNormalMatrix(wm);

    const wp = new THREE.Vector3();
    const wn = new THREE.Vector3();

    // First pass: compute world-space bounds
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    for (let i = 0; i < pos.count; i++) {
      wp.set(pos.getX(i), pos.getY(i), pos.getZ(i)).applyMatrix4(wm);
      minX = Math.min(minX, wp.x); maxX = Math.max(maxX, wp.x);
      minY = Math.min(minY, wp.y); maxY = Math.max(maxY, wp.y);
      minZ = Math.min(minZ, wp.z); maxZ = Math.max(maxZ, wp.z);
    }

    const rX = maxX - minX || 1;
    const rY = maxY - minY || 1;
    const rZ = maxZ - minZ || 1;
    const scale = 1.2; // Lower = less tiling, more natural
    const uvArray = new Float32Array(pos.count * 2);

    // Random offset per mesh to break repetition between legs
    const offsetU = Math.random() * 13.7;
    const offsetV = Math.random() * 11.3;
    // Scale variation (±12%) for less predictable tiling
    const scaleJitter = 0.88 + Math.random() * 0.24;
    const s = scale * scaleJitter;

    for (let i = 0; i < pos.count; i++) {
      wp.set(pos.getX(i), pos.getY(i), pos.getZ(i)).applyMatrix4(wm);
      wn.set(nor.getX(i), nor.getY(i), nor.getZ(i)).applyMatrix3(nm).normalize();

      const absNX = Math.abs(wn.x);
      const absNY = Math.abs(wn.y);
      const absNZ = Math.abs(wn.z);

      let u, v;

      if (absNY >= absNX && absNY >= absNZ) {
        // Top/bottom face (normal along Y): project onto XZ plane
        u = (wp.x - minX) / rX * s + offsetU;
        v = (wp.z - minZ) / rZ * s + offsetV;
      } else if (absNX >= absNZ) {
        // Left/right face (normal along X): project onto YZ plane
        u = (wp.y - minY) / rY * s + offsetU;
        v = (wp.z - minZ) / rZ * s + offsetV;
      } else {
        // Front/back face (normal along Z): project onto XY plane
        u = (wp.y - minY) / rY * s + offsetU;
        v = (wp.x - minX) / rX * s + offsetV;
      }

      uvArray[i * 2] = u;
      uvArray[i * 2 + 1] = v;
    }

    geo.setAttribute('uv', new THREE.BufferAttribute(uvArray, 2));
  }

  // ─── GLB Edge Profile ──────────────────────────

  // Apply edge profile to GLB tabletop meshes by modifying vertices in world-space Y
  // Subdivide GLB tabletop geometry along Y axis to add vertices at key heights
  // This enables sharp transitions (e.g., straight→angled in facetrand)
  subdivideTabletopY(child, cutHeights) {
    const geo = child.geometry;
    if (!geo || !geo.attributes.position || !geo.index) return;

    child.updateWorldMatrix(true, false);
    const wm = child.matrixWorld;
    const inv = wm.clone().invert();

    const pos = geo.attributes.position;
    const idx = geo.index.array;
    const uv = geo.attributes.uv;
    const nor = geo.attributes.normal;

    // Compute world Y for each vertex (use regular array so it can grow)
    const worldY = [];
    const tv = new THREE.Vector3();
    let minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < pos.count; i++) {
      tv.set(pos.getX(i), pos.getY(i), pos.getZ(i)).applyMatrix4(wm);
      worldY[i] = tv.y;
      minY = Math.min(minY, tv.y);
      maxY = Math.max(maxY, tv.y);
    }
    const totalH = maxY - minY;
    if (totalH < 0.001) return;

    // Convert cut heights (as t values 0-1) to world Y
    const cutWorldY = cutHeights.map(t => minY + t * totalH);

    // Collect all new vertices/triangles
    const newPos = []; const newUv = []; const newNor = []; const newIdx = [];
    // Copy existing vertices
    for (let i = 0; i < pos.count; i++) {
      newPos.push(pos.getX(i), pos.getY(i), pos.getZ(i));
      if (uv) newUv.push(uv.getX(i), uv.getY(i));
      if (nor) newNor.push(nor.getX(i), nor.getY(i), nor.getZ(i));
    }
    let vertCount = pos.count;

    // Helper: add interpolated vertex between a and b at fraction f
    const addLerpVertex = (a, b, f) => {
      const vi = vertCount++;
      newPos.push(
        pos.getX(a) + (pos.getX(b) - pos.getX(a)) * f,
        pos.getY(a) + (pos.getY(b) - pos.getY(a)) * f,
        pos.getZ(a) + (pos.getZ(b) - pos.getZ(a)) * f
      );
      if (uv) newUv.push(
        uv.getX(a) + (uv.getX(b) - uv.getX(a)) * f,
        uv.getY(a) + (uv.getY(b) - uv.getY(a)) * f
      );
      if (nor) newNor.push(
        nor.getX(a) + (nor.getX(b) - nor.getX(a)) * f,
        nor.getY(a) + (nor.getY(b) - nor.getY(a)) * f,
        nor.getZ(a) + (nor.getZ(b) - nor.getZ(a)) * f
      );
      return vi;
    };

    // Process each triangle
    for (let t = 0; t < idx.length; t += 3) {
      let triVerts = [idx[t], idx[t+1], idx[t+2]];
      let tris = [triVerts]; // start with original triangle

      // For each cut height, split any triangles that straddle it
      for (const cutY of cutWorldY) {
        const nextTris = [];
        for (const tri of tris) {
          const yA = worldY[tri[0]] !== undefined ? worldY[tri[0]] : this._getWorldY(tri[0], newPos, wm);
          const yB = worldY[tri[1]] !== undefined ? worldY[tri[1]] : this._getWorldY(tri[1], newPos, wm);
          const yC = worldY[tri[2]] !== undefined ? worldY[tri[2]] : this._getWorldY(tri[2], newPos, wm);

          const above = [yA > cutY, yB > cutY, yC > cutY];
          const nAbove = above.filter(v=>v).length;

          if (nAbove === 0 || nAbove === 3) {
            nextTris.push(tri); // entirely one side
          } else {
            // Split: find the lone vertex and the pair
            let lone, pairA, pairB;
            if (nAbove === 1) {
              if (above[0]) { lone=0; pairA=1; pairB=2; }
              else if (above[1]) { lone=1; pairA=0; pairB=2; }
              else { lone=2; pairA=0; pairB=1; }
            } else { // nAbove === 2
              if (!above[0]) { lone=0; pairA=1; pairB=2; }
              else if (!above[1]) { lone=1; pairA=0; pairB=2; }
              else { lone=2; pairA=0; pairB=1; }
            }

            const yL = [yA,yB,yC][lone];
            const yPA = [yA,yB,yC][pairA];
            const yPB = [yA,yB,yC][pairB];
            const vL = tri[lone], vPA = tri[pairA], vPB = tri[pairB];

            const fA = Math.abs(yL - yPA) > 0.0001 ? (cutY - yL) / (yPA - yL) : 0.5;
            const fB = Math.abs(yL - yPB) > 0.0001 ? (cutY - yL) / (yPB - yL) : 0.5;

            const vMA = addLerpVertex(vL, vPA, Math.max(0, Math.min(1, fA)));
            const vMB = addLerpVertex(vL, vPB, Math.max(0, Math.min(1, fB)));

            // Store world Y for new vertices
            worldY[vMA] = cutY;
            worldY[vMB] = cutY;

            // 3 new triangles — preserve winding order
            // The original triangle winding is [tri[0], tri[1], tri[2]]
            // lone is one of {0,1,2}, pairA and pairB are the other two
            // We need to check if the permutation (lone, pairA, pairB) is even or odd
            // to decide if we need to flip the sub-triangles
            const perm = lone * 4 + pairA * 2 + pairB; // quick parity check
            // Even perms (0,1,2)=012, (1,2,0)=120, (2,0,1)=201 → same winding
            // Odd perms (0,2,1)=021, (1,0,2)=102, (2,1,0)=210 → flip
            const isEven = (lone === 0 && pairA === 1) || (lone === 1 && pairA === 2) || (lone === 2 && pairA === 0);
            if (isEven) {
              nextTris.push([vL, vMA, vMB]);
              nextTris.push([vMA, vPA, vPB]);
              nextTris.push([vMA, vPB, vMB]);
            } else {
              nextTris.push([vL, vMB, vMA]);
              nextTris.push([vMA, vPB, vPA]);
              nextTris.push([vMB, vPB, vMA]);
            }
          }
        }
        tris = nextTris;
      }

      for (const tri of tris) {
        newIdx.push(tri[0], tri[1], tri[2]);
      }
    }

    // Build new geometry
    const newGeo = new THREE.BufferGeometry();
    newGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(newPos), 3));
    if (newUv.length) newGeo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(newUv), 2));
    newGeo.setIndex(newIdx);
    // Recompute normals from scratch for clean shading after subdivision
    newGeo.computeVertexNormals();

    // Transfer original positions for later restoration
    newGeo.userData.originalPositions = newGeo.attributes.position.array.slice();

    child.geometry.dispose();
    child.geometry = newGeo;
  }

  // Extract the 2D outline of a GLB tabletop by projecting top-face vertices onto XZ
  extractTabletopOutline(mesh) {
    mesh.updateWorldMatrix(true, false);
    const geo = mesh.geometry;
    const pos = geo.attributes.position;
    const wm = mesh.matrixWorld;
    const v = new THREE.Vector3();

    // Find Y bounds
    let minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < pos.count; i++) {
      v.set(pos.getX(i), pos.getY(i), pos.getZ(i)).applyMatrix4(wm);
      minY = Math.min(minY, v.y);
      maxY = Math.max(maxY, v.y);
    }

    // Collect top-face vertices (within 20% of top)
    const topThreshold = maxY - (maxY - minY) * 0.2;
    const topPoints = [];
    for (let i = 0; i < pos.count; i++) {
      v.set(pos.getX(i), pos.getY(i), pos.getZ(i)).applyMatrix4(wm);
      if (v.y >= topThreshold) {
        topPoints.push({ x: v.x, z: v.z });
      }
    }

    if (topPoints.length < 3) return null;

    // Compute smooth radial outline instead of angular convex hull
    // Find centroid
    let cx = 0, cz = 0;
    for (const p of topPoints) { cx += p.x; cz += p.z; }
    cx /= topPoints.length;
    cz /= topPoints.length;

    // For each angle (every 2°), find the farthest point from center
    const numSamples = 180; // 360° / 2° = 180 samples
    const outline = [];
    for (let s = 0; s < numSamples; s++) {
      const angle = (s / numSamples) * Math.PI * 2;
      const dirX = Math.cos(angle);
      const dirZ = Math.sin(angle);

      // Find the point with maximum projection along this direction
      let maxProj = -Infinity;
      let bestPoint = null;
      for (const p of topPoints) {
        const dx = p.x - cx;
        const dz = p.z - cz;
        const proj = dx * dirX + dz * dirZ;
        if (proj > maxProj) {
          maxProj = proj;
          bestPoint = p;
        }
      }
      if (bestPoint) {
        outline.push({ x: bestPoint.x, z: bestPoint.z });
      }
    }

    // Remove duplicate consecutive points
    const cleaned = [outline[0]];
    for (let i = 1; i < outline.length; i++) {
      const prev = cleaned[cleaned.length - 1];
      if (Math.abs(outline[i].x - prev.x) > 0.0001 || Math.abs(outline[i].z - prev.z) > 0.0001) {
        cleaned.push(outline[i]);
      }
    }

    if (cleaned.length < 3) return null;

    return { points: cleaned, minY, maxY };
  }

  convexHull2D(points) {
    // Find leftmost point
    let start = 0;
    for (let i = 1; i < points.length; i++) {
      if (points[i].x < points[start].x || (points[i].x === points[start].x && points[i].z < points[start].z)) {
        start = i;
      }
    }

    const hull = [];
    let current = start;
    do {
      hull.push(points[current]);
      let next = 0;
      for (let i = 1; i < points.length; i++) {
        if (i === current) continue;
        if (next === current) { next = i; continue; }
        const cross = (points[i].x - points[current].x) * (points[next].z - points[current].z) -
                      (points[i].z - points[current].z) * (points[next].x - points[current].x);
        if (cross > 0) next = i;
        else if (cross === 0) {
          // Collinear: pick the farther point
          const dI = (points[i].x - points[current].x) ** 2 + (points[i].z - points[current].z) ** 2;
          const dN = (points[next].x - points[current].x) ** 2 + (points[next].z - points[current].z) ** 2;
          if (dI > dN) next = i;
        }
      }
      current = next;
      if (hull.length > points.length) break; // safety
    } while (current !== start);

    // Ensure counter-clockwise winding (positive signed area)
    let area = 0;
    for (let i = 0; i < hull.length; i++) {
      const j = (i + 1) % hull.length;
      area += hull[i].x * hull[j].z;
      area -= hull[j].x * hull[i].z;
    }
    if (area < 0) hull.reverse(); // was clockwise, flip to CCW

    return hull;
  }

  // Apply consistent top-down UV mapping to a tabletop geometry
  applyTabletopUVs(geometry) {
    const pos = geometry.attributes.position;
    const norm = geometry.attributes.normal;
    if (!pos) return;

    // First pass: compute world-space bounds (geometry is already in world space)
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < pos.count; i++) {
      minX = Math.min(minX, pos.getX(i)); maxX = Math.max(maxX, pos.getX(i));
      minZ = Math.min(minZ, pos.getZ(i)); maxZ = Math.max(maxZ, pos.getZ(i));
      minY = Math.min(minY, pos.getY(i)); maxY = Math.max(maxY, pos.getY(i));
    }

    const rangeX = maxX - minX || 1;
    const rangeZ = maxZ - minZ || 1;
    const rangeY = maxY - minY || 1;
    const centerX = (minX + maxX) / 2;
    const centerZ = (minZ + maxZ) / 2;
    const refX = 3.0, refZ = 1.2; // 300cm x 120cm reference

    const uv = new Float32Array(pos.count * 2);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);

      // Check if side face
      let isSide = false;
      if (norm) {
        const ny = norm.getY(i);
        isSide = Math.abs(ny) < 0.5;
      }

      if (isSide) {
        const angle = Math.atan2(z - centerZ, x - centerX);
        const perimeter = (angle + Math.PI) / (2 * Math.PI);
        const height = (y - minY) / rangeY;
        uv[i * 2] = perimeter * 4;
        uv[i * 2 + 1] = height * 2;
      } else {
        // Top/bottom: crop-based UV (same logic as remapTabletopUVs)
        const aspectRatio = rangeX / rangeZ;
        if (aspectRatio > 0.85 && aspectRatio < 1.15) {
          const maxRange = Math.max(rangeX, rangeZ);
          const offsetX = (maxRange - rangeX) / 2;
          const offsetZ = (maxRange - rangeZ) / 2;
          uv[i * 2] = (x - minX + offsetX) / maxRange;
          uv[i * 2 + 1] = (z - minZ + offsetZ) / maxRange;
        } else {
          const uScale = Math.min(rangeX / refX, 1.0);
          const vScale = Math.min(rangeZ / refZ, 1.0);
          const uOff = (1 - uScale) / 2;
          const vOff = (1 - vScale) / 2;
          const normX = (x - minX) / rangeX;
          const normZ = (z - minZ) / rangeZ;
          uv[i * 2] = uOff + normX * uScale;
          uv[i * 2 + 1] = vOff + normZ * vScale;
        }
      }
    }
    geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  }

  applyEdgeProfileToGLBTabletop() {
    if (this.state.edge === 'standaard') return;

    this.currentModel.updateMatrixWorld(true);

    if (this.tabletopVariantA && this.tabletopVariantB) {
      // Apply edge profile to both variants with unique names
      this._applyEdgeToVariant(this.tabletopVariantA, 'custom_tabletop_a');
      this._applyEdgeToVariant(this.tabletopVariantB, 'custom_tabletop_b');
      // Show only the active variant's custom tabletop
      const isB = this.state.variant === 'b';
      const ctA = this.currentModel.getObjectByName('custom_tabletop_a');
      const ctB = this.currentModel.getObjectByName('custom_tabletop_b');
      if (ctA) ctA.visible = !isB;
      if (ctB) ctB.visible = isB;
    } else {
      this._applyEdgeToVariant(this.tabletopObject, 'custom_tabletop');
    }
  }

  _applyEdgeToVariant(tabletopWrapper, meshName) {
    if (!tabletopWrapper) return;

    // Temporarily make wrapper visible for world matrix computation
    const wasVisible = tabletopWrapper.visible;
    tabletopWrapper.visible = true;
    this.currentModel.updateMatrixWorld(true);

    tabletopWrapper.traverse((child) => {
      if (!child.isMesh || child.name === meshName || child.name === 'custom_tabletop' ||
          child.name === 'custom_tabletop_a' || child.name === 'custom_tabletop_b' ||
          child.name === 'procedural_tabletop') return;

      // Extract outline from the GLB mesh (in world space)
      const outline = this.extractTabletopOutline(child);
      if (!outline || outline.points.length < 3) return;

      const thickness = this.getThicknessCm() / 100; // in meters
      const topY = this.originalTopBox ? this.originalTopBox.maxY : outline.maxY;
      const bottomY = topY - thickness;

      // Create smooth THREE.Shape from radial outline using CatmullRom spline
      // Negate Z to compensate for rotateX(-π/2) which maps shapeY → -worldZ.
      // Reverse point order to maintain CCW winding after Z negation.
      const pts = outline.points;
      const splinePoints = pts.map(p => new THREE.Vector2(p.x, -p.z)).reverse();
      splinePoints.push(splinePoints[0], splinePoints[1], splinePoints[2]);
      const curve = new THREE.SplineCurve(splinePoints);
      const smoothPts = curve.getPoints(200);
      smoothPts.length = smoothPts.length - 3;

      const s = new THREE.Shape();
      s.moveTo(smoothPts[0].x, smoothPts[0].y);
      for (let i = 1; i < smoothPts.length; i++) {
        s.lineTo(smoothPts[i].x, smoothPts[i].y);
      }
      s.closePath();

      // Create ExtrudeGeometry in world space, then convert to model-local space
      const modelPos = this.currentModel.position;
      const geometry = new THREE.ExtrudeGeometry(s, { depth: thickness, bevelEnabled: false });
      this.applyEdgeProfile(geometry, thickness, 0.001);
      geometry.rotateX(-Math.PI / 2);
      geometry.translate(-modelPos.x, bottomY - modelPos.y, -modelPos.z);

      // Apply top-down UV mapping for consistent texture
      this.applyTabletopUVs(geometry);

      // Hide original mesh
      child.visible = false;

      // Remove previous custom tabletop with this name from model root
      const existing = this.currentModel.getObjectByName(meshName);
      if (existing) { existing.geometry.dispose(); this.currentModel.remove(existing); }

      // Create replacement mesh with edge grain material
      let finalMat;
      if (this.edgeMaterial && geometry.groups && geometry.groups.length >= 3) {
        finalMat = [
          this.topMaterial ? this.topMaterial.clone() : new THREE.MeshStandardMaterial(),
          this.topMaterial ? this.topMaterial.clone() : new THREE.MeshStandardMaterial(),
          this.edgeMaterial.clone()
        ];
      } else {
        finalMat = this.topMaterial ? this.topMaterial.clone() : new THREE.MeshStandardMaterial();
      }

      const newMesh = new THREE.Mesh(geometry, finalMat);
      newMesh.castShadow = true;
      newMesh.receiveShadow = true;
      newMesh.name = meshName;
      this.currentModel.add(newMesh);
    });

    // Restore original visibility
    tabletopWrapper.visible = wasVisible;
  }

  // Restore GLB tabletop geometry to original (undo edge profile)
  restoreGLBTabletopGeometry() {
    // Remove all custom tabletops (any naming variant) from model root and wrappers
    if (this.currentModel) {
      const toRemove = [];
      this.currentModel.traverse((child) => {
        if (child.name === 'custom_tabletop' || child.name === 'custom_tabletop_a' || child.name === 'custom_tabletop_b') {
          toRemove.push(child);
        }
      });
      toRemove.forEach(c => { if (c.geometry) c.geometry.dispose(); c.parent.remove(c); });
    }

    // Restore visibility of original GLB meshes in all variants
    const variants = new Set([this.tabletopVariantA, this.tabletopVariantB, this.tabletopObject].filter(Boolean));
    for (const variant of variants) {
      variant.traverse((child) => {
        if (child.isMesh && child.name !== 'procedural_tabletop') {
          child.visible = true;
        }
      });
    }
  }

  // ─── Procedural Tabletop for Rechthoek (radius) ───

  rebuildGLBTabletop() {
    if (!this.tabletopObject || !this.currentModel) return;

    const shape = TABLE_SHAPES.find(s => s.id === this.state.shape);
    if (!shape) return;

    const needsProcedural = (shape.id === 'rectangle' || shape.id === 'verbaan');

    if (needsProcedural) {
      // Work in the wrapper's local coordinate system
      // Wrapper has scale (e.g. 10) and the GLB mesh has scale 0.001
      // We need to create geometry in wrapper-local space
      const ws = this.tabletopOriginalScale || new THREE.Vector3(1, 1, 1);
      const thickness = (this.getThicknessCm() / 100) / ws.y;
      const bottomY = this.originalTopBox ? this.originalTopBox.minY / ws.y : 0.072;

      // Use the GLB tabletop center for correct positioning
      const cx = this.baseBBox ? this.baseBBox.center.x / ws.x : 0;
      const cz = this.baseBBox ? this.baseBBox.center.z / ws.z : 0;

      // Dimensions in wrapper-local space
      const halfL = ((this.state.length / 100) / 2) / ws.x;
      const halfW = ((this.state.width / 100) / 2) / ws.z;

      // Hide original GLB meshes
      this.tabletopObject.traverse(ch => {
        if (ch.isMesh && ch.name !== 'custom_tabletop') ch.visible = false;
      });

      // Remove old custom mesh if exists
      const existing = this.tabletopObject.getObjectByName('custom_tabletop');
      if (existing) {
        if (existing.geometry) existing.geometry.dispose();
        if (existing.material) existing.material.dispose();
        this.tabletopObject.remove(existing);
      }

      let geometry;

      if (shape.id === 'rectangle') {
        let r = (this.state.radius / 1000) / ws.x; // mm to wrapper-local

        // Boomstamrand: add wavy offset to long edges
        const isLiveEdge = this.state.edge === 'boomstam';
        const s = new THREE.Shape();

        if (isLiveEdge) {
          // Organic live edge with multiple overlapping sine waves + noise
          const segments = 40;
          const amp = halfW * 0.035;

          // Pseudo-random function for organic variation
          const noise = (seed) => Math.sin(seed * 127.1 + 311.7) * 0.5 + 0.5;

          // Bottom edge (organic wavy) — use bezier curves for smooth flow
          s.moveTo(-halfL, -halfW);
          for (let i = 1; i <= segments; i++) {
            const t = i / segments;
            const x = -halfL + t * 2 * halfL;
            // Multiple frequencies for organic feel
            const w1 = Math.sin(t * Math.PI * 2.7 + 0.8) * amp;
            const w2 = Math.sin(t * Math.PI * 5.3 + 2.1) * amp * 0.4;
            const w3 = Math.sin(t * Math.PI * 9.1 + 0.3) * amp * 0.15;
            const n = (noise(t * 17.3) - 0.5) * amp * 0.3;
            // Fade at ends so short sides stay straight
            const fade = Math.sin(t * Math.PI);
            const wave = (w1 + w2 + w3 + n) * fade;
            s.lineTo(x, -halfW + wave);
          }
          // Short side (right, straight)
          s.lineTo(halfL, halfW);
          // Top edge (organic wavy, different pattern) — reversed
          for (let i = segments; i >= 0; i--) {
            const t = i / segments;
            const x = -halfL + t * 2 * halfL;
            const w1 = Math.sin(t * Math.PI * 3.1 + 1.9) * amp;
            const w2 = Math.sin(t * Math.PI * 6.7 + 3.4) * amp * 0.35;
            const w3 = Math.sin(t * Math.PI * 11.3 + 1.1) * amp * 0.12;
            const n = (noise(t * 23.7 + 5.0) - 0.5) * amp * 0.25;
            const fade = Math.sin(t * Math.PI);
            const wave = (w1 + w2 + w3 + n) * fade;
            s.lineTo(x, halfW + wave);
          }
          // Close: short side (left, straight)
        } else {
          // Standard rectangle with optional radius
          s.moveTo(-halfL + r, -halfW);
          s.lineTo(halfL - r, -halfW);
          if (r > 0) s.quadraticCurveTo(halfL, -halfW, halfL, -halfW + r);
          else s.lineTo(halfL, -halfW);
          s.lineTo(halfL, halfW - r);
          if (r > 0) s.quadraticCurveTo(halfL, halfW, halfL - r, halfW);
          else s.lineTo(halfL, halfW);
          s.lineTo(-halfL + r, halfW);
          if (r > 0) s.quadraticCurveTo(-halfL, halfW, -halfL, halfW - r);
          else s.lineTo(-halfL, halfW);
          s.lineTo(-halfL, -halfW + r);
          if (r > 0) s.quadraticCurveTo(-halfL, -halfW, -halfL + r, -halfW);
          else s.lineTo(-halfL, -halfW);
        }

        const steps = this.getExtrudeSteps();
        geometry = new THREE.ExtrudeGeometry(s, { depth: thickness, bevelEnabled: false, steps });
        const mmToLocal = 0.001 / ws.x;
        this.applyEdgeProfile(geometry, thickness, mmToLocal);
        geometry.rotateX(-Math.PI / 2);
        geometry.translate(cx, bottomY + thickness, cz);
      }

      if (shape.id === 'verbaan') {
        // Verbaan: 2 diagonally opposite rounded corners (top-left & bottom-right)
        const radiusMm = this.state.verbaanRadius || 500;
        const fixedR = (radiusMm / 1000) / ws.x;
        const r = Math.min(fixedR, halfL * 0.45, halfW); // clamp to half-width max
        const s = new THREE.Shape();
        // Start bottom-left (sharp corner)
        s.moveTo(-halfL, -halfW);
        // Bottom edge → bottom-right (ROUNDED)
        s.lineTo(halfL - r, -halfW);
        s.quadraticCurveTo(halfL, -halfW, halfL, -halfW + r);
        // Right edge → top-right (sharp corner)
        s.lineTo(halfL, halfW);
        // Top edge → top-left (ROUNDED)
        s.lineTo(-halfL + r, halfW);
        s.quadraticCurveTo(-halfL, halfW, -halfL, halfW - r);
        // Left edge → back to bottom-left (sharp)
        s.lineTo(-halfL, -halfW);

        const steps = this.getExtrudeSteps();
        geometry = new THREE.ExtrudeGeometry(s, { depth: thickness, bevelEnabled: false, steps });
        const mmToLocal = 0.001 / ws.x;
        this.applyEdgeProfile(geometry, thickness, mmToLocal);
        geometry.rotateX(-Math.PI / 2);
        geometry.translate(cx, bottomY + thickness, cz);
      }

      if (geometry) {
        const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
          color: 0xcccccc, roughness: 0.72, metalness: 0
        }));
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.name = 'custom_tabletop';
        this.tabletopObject.add(mesh);
        // Remap UVs immediately after adding (before material apply)
        this.remapTabletopUVs();
        // Re-apply the current material/texture to the new mesh
        this.reapplyCurrentMaterial();
      }
    } else {
      // Show original GLB meshes, remove custom
      this.tabletopObject.traverse(ch => {
        if (ch.isMesh && ch.name !== 'custom_tabletop') ch.visible = true;
      });
      const existing = this.tabletopObject.getObjectByName('custom_tabletop');
      if (existing) {
        if (existing.geometry) existing.geometry.dispose();
        if (existing.material) existing.material.dispose();
        this.tabletopObject.remove(existing);
      }
      // Re-apply current material to restored GLB meshes
      this.reapplyCurrentMaterial();
    }
  }

  createProceduralTop(model, shape) {
    // Find the leg tops to determine tabletop Y position
    model.updateMatrixWorld(true);
    let legTopY = 0;
    if (this.legObjects.length > 0) {
      // Use first leg's bounding box maxY
      const firstLeg = this.legObjects[0];
      firstLeg.object.visible = true;
      model.updateMatrixWorld(true);
      const legBox = new THREE.Box3().setFromObject(firstLeg.object);
      legTopY = legBox.max.y;
    }

    const thickness = 0.04; // 4cm in meters
    const halfL = (shape.defaultLength / 100) / 2;
    const halfW = (shape.defaultWidth / 100) / 2;
    // Arc radius = halfW so curve connects seamlessly to straight edges
    const r = Math.min(halfW, halfL);

    let topShape;

    if (shape.id === 'halfrond') {
      // Stadium/capsule shape: both short ends rounded
      topShape = new THREE.Shape();
      topShape.moveTo(-halfL + r, -halfW);
      topShape.lineTo(halfL - r, -halfW);
      topShape.absarc(halfL - r, 0, halfW, -Math.PI / 2, Math.PI / 2, false);
      topShape.lineTo(-halfL + r, halfW);
      topShape.absarc(-halfL + r, 0, halfW, Math.PI / 2, Math.PI * 1.5, false);
    } else if (shape.id === 'boogvorm') {
      // Rectangle with one short end (at +X) rounded
      topShape = new THREE.Shape();
      topShape.moveTo(-halfL, -halfW);
      topShape.lineTo(halfL - halfW, -halfW);
      topShape.absarc(halfL - halfW, 0, halfW, -Math.PI / 2, Math.PI / 2, false);
      topShape.lineTo(-halfL, halfW);
      topShape.lineTo(-halfL, -halfW);
    }

    if (!topShape) return;

    const steps = this.getExtrudeSteps();
    const geometry = new THREE.ExtrudeGeometry(topShape, { depth: thickness, bevelEnabled: false, steps });
    this.applyEdgeProfile(geometry, thickness, 0.001);
    geometry.rotateX(-Math.PI / 2);
    geometry.translate(0, legTopY + thickness, 0);

    const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
      color: 0xcccccc, roughness: 0.72, metalness: 0
    }));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.name = 'procedural_tabletop';

    // Create a wrapper Object3D for the tabletop
    const topWrapper = new THREE.Object3D();
    topWrapper.add(mesh);
    model.add(topWrapper);

    this.tabletopObject = topWrapper;
    this.tabletopOriginalScale = topWrapper.scale.clone();
    this.hasSeparateTop = true;
    this.originalTopBox = {
      minY: legTopY,
      maxY: legTopY + thickness,
      height: thickness
    };

    // Apply current material/texture
    this.reapplyCurrentMaterial();
  }

  rebuildProceduralTop(shape) {
    if (!this.tabletopObject || !this.currentModel) return;

    // Remove old procedural mesh
    const existing = this.tabletopObject.getObjectByName('procedural_tabletop');
    if (existing) {
      if (existing.geometry) existing.geometry.dispose();
      if (existing.material) existing.material.dispose();
      this.tabletopObject.remove(existing);
    }

    const thickness = this.getThicknessCm() / 100;
    const halfL = (this.state.length / 100) / 2;
    const halfW = (this.state.width / 100) / 2;
    // Arc radius must equal halfW so the curve connects seamlessly to straight edges
    const r = Math.min(halfW, halfL);

    let topShape;
    if (shape.id === 'halfrond') {
      // Stadium/capsule: both short ends rounded
      topShape = new THREE.Shape();
      topShape.moveTo(-halfL + r, -halfW);
      topShape.lineTo(halfL - r, -halfW);
      topShape.absarc(halfL - r, 0, halfW, -Math.PI / 2, Math.PI / 2, false);
      topShape.lineTo(-halfL + r, halfW);
      topShape.absarc(-halfL + r, 0, halfW, Math.PI / 2, Math.PI * 1.5, false);
    } else if (shape.id === 'boogvorm') {
      // Rectangle with one short end rounded
      topShape = new THREE.Shape();
      topShape.moveTo(-halfL, -halfW);
      topShape.lineTo(halfL - halfW, -halfW);
      topShape.absarc(halfL - halfW, 0, halfW, -Math.PI / 2, Math.PI / 2, false);
      topShape.lineTo(-halfL, halfW);
      topShape.lineTo(-halfL, -halfW);
    }

    if (!topShape) return;

    const legTopY = this.originalTopBox ? this.originalTopBox.minY : 0;
    const steps = this.getExtrudeSteps();
    const geometry = new THREE.ExtrudeGeometry(topShape, { depth: thickness, bevelEnabled: false, steps });
    this.applyEdgeProfile(geometry, thickness, 0.001);
    geometry.rotateX(-Math.PI / 2);
    geometry.translate(0, legTopY + thickness, 0);

    const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({
      color: 0xcccccc, roughness: 0.72, metalness: 0
    }));
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.name = 'procedural_tabletop';
    this.tabletopObject.add(mesh);
    // Re-apply current material/texture
    this.reapplyCurrentMaterial();
  }

  extractLegName(rawName) {
    let name = rawName;

    const prefixes = [
      'rectangle_', 'Rectangle_',
      'Oval_', 'Round_',
      'Danish_Oval__', 'Danish_Oval_',
      'Kiezel_', 'Organic_',
      'Halfrond_', 'Boogvorm_',
      'Verbaan_'
    ];
    for (const prefix of prefixes) {
      if (name.startsWith(prefix)) {
        name = name.substring(prefix.length);
        break;
      }
    }

    name = name.replace(/_?-_?WOOD/gi, '');
    name = name.replace(/_?LEG_REC_TABLE[\d_]*/gi, '');
    name = name.replace(/_?\d{2,}$/g, '');
    name = name.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
    name = name.replace(/\s*-\s*$/, '').trim();
    name = name.split(' ').map(w =>
      w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()
    ).join(' ');

    // Display name mapping
    const nameMap = {
      '4 Legs On Pole': 'Vera',
      'A Shape': 'A-Form',
      'Diagonal Pole': 'Diago',
      'V Shape': 'V-Form',
      'X Modern': 'Ekso',
      'X Shape': 'X-Form',
      'Flat Dining V': 'Vedo',
      'Half Spider': 'Lara',
      'Kolom Plus': 'Pluto',
      'Kolom Oval': 'Oval-Säule',
      'Flach Stahl': 'Pedro',
      'Vn Tafelpoot': 'VN',
      'Conisch': 'Cona',
      'Halve Plus': 'Positivo',
      'Kolom Rod': 'Rund-Säule',
      'Pillars': 'Pilares',
      'Butterfly Wood': 'Hannah',
      'Fluted': 'Wellen-Säule',
      'Column In Middle': 'Diablo',
      'Pilaar': 'Ferdo',
      'Gerond': 'Rondo',
      'Schuin 25': 'Bernard',
      'Double Fluted': 'Wellen-Duo',
      'Klassiek Midden': 'Moda',
      'Twist Tafelpoot Rond': 'Twist',
      'Round Fluted': 'Wellen-Rund'
    };
    if (nameMap[name]) name = nameMap[name];

    return name || 'Standard';
  }

  isWoodLeg(namesString) {
    return /WOOD|Wood|Butterfly_Wood|_wood/i.test(namesString);
  }

  isCentralLeg(displayName) {
    // Central legs: single pedestal/column in the middle
    const centralLegs = [
      'Oval-Säule', 'Pluto', 'Kolom Kiezel', 'Kolom Organic', 'Rund-Säule',
      'Diablo', 'Wellen-Säule', 'Positivo',
      'Konische Spider', 'Hannah', 'Lara',
      'Vera', 'V-Form', 'Matrix', 'Stative',
      'Vedo', 'Thore', 'Criss Cross', 'Tapse Spin'
    ];
    return centralLegs.some(n => displayName.toLowerCase() === n.toLowerCase());
  }

  isSetLeg(displayName) {
    // Set legs (2 or 4 pieces): positioned near the short ends
    const setLegs = [
      // Hout
      'Pilares', 'Ferdo', 'Blok', 'Schuin', 'Rondo', 'Bernard',
      'Demi Lune', 'Hapa', 'Base', 'Wellen-Duo', 'Moda',
      // Metaal
      'A-Form', 'Butterfly', 'Diago', 'Walrus', 'Ekso',
      'X-Form', 'Hairpin', 'Pedro', 'VN', 'Cona',
      // Hout — Hannah (Butterfly Eichenholz / bogade Butterfly wood)
      'Hannah'
    ];
    return setLegs.some(n => displayName.toLowerCase() === n.toLowerCase());
  }

  // Get required distance from short end (kopse kant) in cm based on table length
  getLegEdgeDistance(lengthCm, shapeId) {
    let dist;
    if (lengthCm <= 200) dist = 30;
    else if (lengthCm <= 260) dist = 40;
    else if (lengthCm <= 280) dist = 50;
    else if (lengthCm <= 300) dist = 60;
    else if (lengthCm <= 350) dist = 70;
    else dist = 75; // 400+

    // Per-shape extra inward offset for specific lengths
    if (shapeId === 'oval') {
      if (lengthCm <= 160) dist += 25;
      else if (lengthCm <= 180) dist += 15;
      else if (lengthCm <= 200) dist += 10;
    } else if (shapeId === 'danish-oval') {
      if (lengthCm <= 180) dist += 15;
      else if (lengthCm <= 200) dist += 10;
    } else if (shapeId === 'round') {
      if (lengthCm <= 100) dist += 13;
      else if (lengthCm <= 110) dist += 10;
      else if (lengthCm <= 120) dist += 9;
      else if (lengthCm <= 130) dist += 7;
      else if (lengthCm <= 140) dist += 6;
    } else if (shapeId === 'organic') {
      if (lengthCm < 300) dist += 13;
    } else if (shapeId === 'organic') {
      if (lengthCm <= 200) dist += 10;
    } else if (shapeId === 'halfrond') {
      if (lengthCm <= 180) dist += 15;
      else if (lengthCm <= 200) dist += 10;
    } else if (shapeId === 'boogvorm') {
      if (lengthCm <= 180) dist += 10;
    } else if (shapeId === 'verbaan') {
      // Verbaan uses the base distances without extra offset
    }

    return dist;
  }

  // Split a set leg mesh into left/right/center groups for independent repositioning.
  // Faces are classified based on their X position relative to the geometry extent.
  // Left third → left group, right third → right group, center third → stays in place.
  splitSetLeg(leg) {
    const wrapper = leg.object;
    const meshesToSplit = [];
    // Only collect DIRECT child meshes (or meshes inside direct child groups)
    wrapper.children.forEach(ch => {
      if (ch.isMesh) meshesToSplit.push({ mesh: ch, parent: wrapper });
      else if (ch.isGroup || ch.isObject3D) {
        ch.traverse(m => { if (m.isMesh) meshesToSplit.push({ mesh: m, parent: m.parent }); });
      }
    });

    leg.splitHalves = [];

    meshesToSplit.forEach(({ mesh, parent }) => {
      const geo = mesh.geometry;
      const pos = geo.attributes.position;
      const idx = geo.index;
      if (!idx) return;

      const normal = geo.attributes.normal;
      const uv = geo.attributes.uv;

      // Find X extent in local space
      let minX = Infinity, maxX = -Infinity;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
      }
      const midX = (minX + maxX) / 2;
      const extent = maxX - minX;
      if (extent < 0.0001) return;

      // Define zones: left < -30%, center -30% to +30%, right > +30%
      const zoneThreshold = extent * 0.15;
      const leftBound = midX - zoneThreshold;
      const rightBound = midX + zoneThreshold;

      // Classify each face
      const leftFaces = [], centerFaces = [], rightFaces = [];
      const triCount = idx.count / 3;

      for (let t = 0; t < triCount; t++) {
        const i0 = idx.getX(t * 3);
        const i1 = idx.getX(t * 3 + 1);
        const i2 = idx.getX(t * 3 + 2);
        const cx = (pos.getX(i0) + pos.getX(i1) + pos.getX(i2)) / 3;
        if (cx < leftBound) leftFaces.push(t);
        else if (cx > rightBound) rightFaces.push(t);
        else centerFaces.push(t);
      }

      // If most faces are in the center zone, this is a single central element — skip split
      if (centerFaces.length > triCount * 0.4) {
        // Don't split this mesh — it's a single central column/pedestal
        return;
      }

      // If very few center faces, merge them into nearest side (simple 2-way split)
      if (centerFaces.length < triCount * 0.05) {
        centerFaces.forEach(t => {
          const i0 = idx.getX(t * 3);
          const i1 = idx.getX(t * 3 + 1);
          const i2 = idx.getX(t * 3 + 2);
          const cx = (pos.getX(i0) + pos.getX(i1) + pos.getX(i2)) / 3;
          if (cx < midX) leftFaces.push(t);
          else rightFaces.push(t);
        });
        centerFaces.length = 0;
      }

      // Build geometry from face list
      const buildGeo = (faces) => {
        if (faces.length === 0) return null;
        const vertCount = faces.length * 3;
        const newPos = new Float32Array(vertCount * 3);
        const newNorm = normal ? new Float32Array(vertCount * 3) : null;
        const newUv = uv ? new Float32Array(vertCount * 2) : null;

        for (let f = 0; f < faces.length; f++) {
          const t = faces[f];
          for (let v = 0; v < 3; v++) {
            const srcIdx = idx.getX(t * 3 + v);
            const dstIdx = f * 3 + v;
            newPos[dstIdx * 3] = pos.getX(srcIdx);
            newPos[dstIdx * 3 + 1] = pos.getY(srcIdx);
            newPos[dstIdx * 3 + 2] = pos.getZ(srcIdx);
            if (newNorm) {
              newNorm[dstIdx * 3] = normal.getX(srcIdx);
              newNorm[dstIdx * 3 + 1] = normal.getY(srcIdx);
              newNorm[dstIdx * 3 + 2] = normal.getZ(srcIdx);
            }
            if (newUv) {
              newUv[dstIdx * 2] = uv.getX(srcIdx);
              newUv[dstIdx * 2 + 1] = uv.getY(srcIdx);
            }
          }
        }

        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(newPos, 3));
        if (newNorm) g.setAttribute('normal', new THREE.BufferAttribute(newNorm, 3));
        if (newUv) g.setAttribute('uv', new THREE.BufferAttribute(newUv, 2));
        g.computeBoundingBox();
        return g;
      };

      const makeMesh = (g) => {
        if (!g) return null;
        const m = new THREE.Mesh(g, mesh.material);
        m.scale.copy(mesh.scale);
        m.castShadow = true;
        m.receiveShadow = true;
        return m;
      };

      const leftMesh = makeMesh(buildGeo(leftFaces));
      const centerMesh = makeMesh(buildGeo(centerFaces));
      const rightMesh = makeMesh(buildGeo(rightFaces));

      // Replace original mesh
      parent.remove(mesh);
      if (leftMesh) parent.add(leftMesh);
      if (centerMesh) parent.add(centerMesh);
      if (rightMesh) parent.add(rightMesh);

      leg.splitHalves.push({
        left: leftMesh,
        center: centerMesh, // stays in place, never moves
        right: rightMesh,
        origLeftPos: leftMesh ? leftMesh.position.clone() : null,
        origRightPos: rightMesh ? rightMesh.position.clone() : null
      });
    });
  }

  // ─── Leg Switching ────────────────────────────

  switchLeg(index) {
    if (index === this.activeLegIndex || index >= this.legObjects.length) return;

    // Guard: when coming from a no-model state, activeLegIndex is -1
    if (this.activeLegIndex >= 0 && this.legObjects[this.activeLegIndex]?.object) {
      this.legObjects[this.activeLegIndex].object.visible = false;
    }

    this.activeLegIndex = index;
    this.legObjects[index].object.visible = true;

    // Always keep tabletop visible for shapes with separate top
    if (this.hasSeparateTop && this.tabletopObject) {
      this.tabletopObject.visible = true;
    }

    const leg = this.legObjects[index];
    this.applyActiveLegMaterial();
    // Skip tabletop-alignment for external legs (they're standalone GLBs)
    if (!leg.external) this.alignTabletopToLeg();

    this.state.legId = leg.rawName;
    document.getElementById('val-legs').textContent =
      this.state.zwLegName || `${leg.displayName}${leg.isWood ? ' (Holz)' : ''}`;

    this.updatePowderSectionVisibility();
    this.updateLegSectionIcon();
    this.updateSummary();
  }

  updateLegSectionIcon() {
    const icon = document.getElementById('leg-section-icon');
    if (!icon) return;
    const activeBtn = document.querySelector('.leg-option.active .leg-swatch-img') || document.querySelector('.leg-option.active .leg-swatch-svg');
    if (activeBtn) icon.innerHTML = activeBtn.innerHTML;
  }

  updatePowderSectionVisibility() {
    const section = document.getElementById('leg-powder-section');
    const activeLeg = this.legObjects[this.activeLegIndex];
    if (activeLeg && activeLeg.isWood) {
      section.classList.add('hidden');
    } else {
      section.classList.remove('hidden');
    }
  }

  // ─── Materials ────────────────────────────────

  // Apply current topMaterial + endgrain to all tabletop meshes (no reload)
  reapplyCurrentMaterial() {
    if (!this.topMaterial) return;
    // Apply to all variant tabletops
    const variants = [this.tabletopVariantA, this.tabletopVariantB, this.tabletopObject].filter(Boolean);
    const seen = new Set();
    for (const variant of variants) {
      if (seen.has(variant)) continue;
      seen.add(variant);
      variant.traverse((child) => {
        if (child.isMesh) {
          if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
          else if (child.material) child.material.dispose();

          if (child.geometry.groups && child.geometry.groups.length >= 3 && this.edgeMaterial) {
            child.material = [
              this.topMaterial.clone(),
              this.topMaterial.clone(),
              this.edgeMaterial.clone()
            ];
          } else {
            child.material = this.topMaterial.clone();
          }
        }
      });
    }
  }

  async applyTopMaterial(materialTypeId, colorId) {
    const matType = MATERIAL_TYPES[materialTypeId];
    if (!matType) return;
    const colorDef = matType.colors.find(c => c.id === colorId);
    if (!colorDef) return;

    // Guard against race conditions: if a newer call starts before this one finishes,
    // this call's results are stale and should be discarded
    const requestId = (this._materialRequestId = (this._materialRequestId || 0) + 1);

    const texture = await this.loadTexture(colorDef.file);

    // Stale check: if another applyTopMaterial was called while we were loading, abort
    if (requestId !== this._materialRequestId) return;
    texture.colorSpace = THREE.SRGBColorSpace;

    if (materialTypeId === 'ceramic') {
      // Ceramic: stretch texture across entire tabletop, no tiling
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      // Portrait textures (960x1920): rotate 90° so veins run along table length
      // Landscape textures (Silver Root, Travertino, Pulpis): no rotation needed
      const isLandscape = colorDef.landscape === true;
      texture.rotation = isLandscape ? 0 : Math.PI / 2;
      texture.center.set(0.5, 0.5);
      texture.repeat.set(1, 1);

      // Apply finish-specific roughness/metalness
      const isLux = colorDef.finish === 'lux';
      const roughness = isLux ? 0.15 : 0.40;
      const metalness = isLux ? 0.08 : 0.02;
      const envIntensity = isLux ? 0.8 : 0.3;

      this.topMaterial = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: roughness,
        metalness: metalness,
        envMapIntensity: envIntensity
      });

      // Ceramic edge: same texture, slightly darker
      const edgeTexture = texture.clone();
      edgeTexture.needsUpdate = true;
      this.edgeMaterial = new THREE.MeshStandardMaterial({
        map: edgeTexture,
        roughness: roughness + 0.1,
        metalness: metalness,
        envMapIntensity: envIntensity * 0.7
      });
    } else {
      // Oak: tile texture with wrapping
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.rotation = Math.PI / 2;
      texture.center.set(0.5, 0.5);
      const rep = 2;
      texture.repeat.set(rep, rep);

      // Per-color roughness override (e.g. Yakisugi burned wood)
      const colorRoughness = colorDef.roughness ?? matType.roughness;
      const colorMetalness = matType.metalness;

      // Bump map from texture itself: subtle grain depth for all oak, stronger for Yakisugi
      const bumpTex = texture.clone();
      bumpTex.needsUpdate = true;
      const bumpScale = colorDef.bumpScale || 0.012; // subtle default for regular oak

      const topMatProps = {
        map: texture,
        roughness: colorRoughness,
        metalness: colorMetalness,
        envMapIntensity: 0.4,
        bumpMap: bumpTex,
        bumpScale: bumpScale
      };

      this.topMaterial = new THREE.MeshStandardMaterial(topMatProps);

      // Oak endgrain edge material
      const edgeTexture = texture.clone();
      edgeTexture.needsUpdate = true;
      edgeTexture.rotation = 0;
      edgeTexture.center.set(0.5, 0.5);
      edgeTexture.repeat.set(rep * 2, rep * 4);

      const edgeBump = edgeTexture.clone();
      edgeBump.needsUpdate = true;

      const edgeMatProps = {
        map: edgeTexture,
        color: colorDef.id === 'yakisugi' || colorDef.id === 'deep-black' ? 0x2a2a2a : 0xc4a67a,
        roughness: Math.min(colorRoughness + 0.08, 1.0),
        metalness: colorMetalness,
        envMapIntensity: 0.3,
        bumpMap: edgeBump,
        bumpScale: bumpScale * 1.2
      };

      this.edgeMaterial = new THREE.MeshStandardMaterial(edgeMatProps);
    }

    if (this.hasSeparateTop) {
      // Apply materials to all variant tabletops
      const variants = [this.tabletopVariantA, this.tabletopVariantB, this.tabletopObject].filter(Boolean);
      const seen = new Set();
      for (const variant of variants) {
        if (seen.has(variant)) continue;
        seen.add(variant);
        variant.traverse((child) => {
          if (child.isMesh) {
            if (Array.isArray(child.material)) child.material.forEach(m => m.dispose());
            else if (child.material) child.material.dispose();

            if (child.geometry.groups && child.geometry.groups.length >= 3) {
              child.material = [
                this.topMaterial.clone(),
                this.topMaterial.clone(),
                this.edgeMaterial.clone()
              ];
            } else {
              child.material = this.topMaterial.clone();
            }
          }
        });
      }
    }

    this.applyActiveLegMaterial();
  }

  applyActiveLegMaterial() {
    if (this.legObjects.length === 0) return;
    const leg = this.legObjects[this.activeLegIndex];
    if (!leg) return;

    if (leg.isWood && this.topMaterial) {
      leg.object.traverse((child) => {
        if (child.isMesh) {
          const mat = this.topMaterial.clone();
          mat.side = 2; // THREE.DoubleSide — fixes gaps/see-through on Schuin etc.
          if (mat.map) {
            mat.map = mat.map.clone();
            mat.map.rotation = Math.PI / 2;
            mat.map.center.set(0.5, 0.5);
            mat.map.repeat.set(1, 1); // Less tiling, let UV scale handle coverage
            mat.map.needsUpdate = true;
          }

          // Use box projection UV for vertical grain on all surfaces
          this.remapLegUVsBoxProjection(child);

          child.material = mat;
        }
      });
    } else if (!this.hasSeparateTop) {
      if (this.topMaterial) {
        leg.object.traverse((child) => {
          if (child.isMesh) {
            child.material = this.topMaterial.clone();
          }
        });
      }
    } else {
      this.applyPowderCoatToActiveLeg();
    }
  }

  applyPowderCoatToActiveLeg() {
    if (this.legObjects.length === 0) return;
    const leg = this.legObjects[this.activeLegIndex];
    if (!leg || leg.isWood) return;

    // External Edelstahl legs get brushed steel, not black powder coat
    const isEdelstahl = leg.external && /Edelstahl/i.test(leg.displayName);
    const metalMaterial = isEdelstahl
      ? new THREE.MeshStandardMaterial({
          color: new THREE.Color(0xb8babd),
          roughness: 0.32,
          metalness: 0.9,
          envMapIntensity: 0.9
        })
      : new THREE.MeshStandardMaterial({
          color: new THREE.Color((POWDER_COAT_COLORS.find(c => c.id === this.state.powderCoat) || {swatch:'#1a1a1a'}).swatch),
          roughness: 0.35,
          metalness: 0.6,
          envMapIntensity: 0.5
        });

    leg.object.traverse((child) => {
      if (child.isMesh) {
        child.material = metalMaterial.clone();
      }
    });
  }

  loadTexture(url) {
    if (this.textureCache[url]) {
      return Promise.resolve(this.textureCache[url]);
    }
    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        (tex) => {
          // Anisotropic filtering: sharper textures at grazing angles
          tex.anisotropy = this.maxAnisotropy || 1;
          // Better filtering for smooth texture sampling
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.generateMipmaps = true;
          this.textureCache[url] = tex;
          resolve(tex);
        },
        undefined, reject
      );
    });
  }

  loadGLTF(url, opts = {}) {
    const silent = !!opts.silent;
    return new Promise((resolve, reject) => {
      // Simulate smooth progress since servers often don't send Content-Length
      let simPct = 0;
      let simInterval = null;
      if (!silent) {
        simInterval = setInterval(() => {
          if (simPct < 70) simPct += 3;
          else if (simPct < 90) simPct += 1;
          this.updateLoaderProgress(simPct);
        }, 100);
      }
      // Hard timeout — 25s — so a stuck network never freezes the UI
      const timeout = setTimeout(() => {
        if (simInterval) clearInterval(simInterval);
        reject(new Error('GLB load timed out: ' + url));
      }, 25000);

      this.loader.load(url, (result) => {
        clearTimeout(timeout);
        if (simInterval) clearInterval(simInterval);
        if (!silent) this.updateLoaderProgress(100);
        resolve(result);
      }, (progress) => {
        if (!silent && progress.total > 0) {
          if (simInterval) clearInterval(simInterval);
          const pct = Math.round((progress.loaded / progress.total) * 100);
          this.updateLoaderProgress(pct);
        }
      }, (err) => {
        clearTimeout(timeout);
        if (simInterval) clearInterval(simInterval);
        reject(err);
      });
    });
  }

  updateLoaderProgress(pct) {
    const el = document.getElementById('loader-text');
    if (el) el.textContent = `Wir bauen Ihren Tisch auf… ${pct}%`;
  }

  // ─── Morph Animation ─────────────────────────

  // Capture current procedural tabletop vertices for morphing
  captureTabletopVertices() {
    if (!this.tabletopObject) return null;
    let mesh = null;
    this.tabletopObject.traverse(ch => {
      if (ch.isMesh && ch.visible && (ch.name === 'custom_tabletop' || ch.name === 'procedural_tabletop')) {
        mesh = ch;
      }
    });
    if (!mesh || !mesh.geometry?.attributes?.position) return null;
    return {
      mesh,
      positions: mesh.geometry.attributes.position.array.slice(),
      count: mesh.geometry.attributes.position.count
    };
  }

  // Capture current GLB tabletop scale for smooth scale transitions
  captureTabletopState() {
    if (!this.tabletopObject) return null;
    return {
      scaleX: this.tabletopObject.scale.x,
      scaleY: this.tabletopObject.scale.y,
      scaleZ: this.tabletopObject.scale.z,
      posY: this.tabletopObject.position.y,
      posZ: this.tabletopObject.position.z
    };
  }

  // Animate morph from old vertices to new vertices
  morphTabletop(oldCapture) {
    if (!oldCapture) return;

    // Cancel any running morph
    if (this.morphAnim) cancelAnimationFrame(this.morphAnim);

    // Get the new mesh (same reference as old if rebuilt in-place)
    let newMesh = null;
    this.tabletopObject.traverse(ch => {
      if (ch.isMesh && ch.visible && (ch.name === 'custom_tabletop' || ch.name === 'procedural_tabletop')) {
        newMesh = ch;
      }
    });

    if (!newMesh || !newMesh.geometry?.attributes?.position) return;

    const newPositions = newMesh.geometry.attributes.position.array.slice();
    const posAttr = newMesh.geometry.attributes.position;

    // If vertex counts don't match, skip morphing
    if (oldCapture.count !== posAttr.count) return;

    const oldPos = oldCapture.positions;
    const startTime = performance.now();
    const duration = this.morphDuration;

    const animateStep = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      // Smooth easing (ease-out cubic)
      const ease = 1 - Math.pow(1 - t, 3);

      for (let i = 0; i < posAttr.array.length; i++) {
        posAttr.array[i] = oldPos[i] + (newPositions[i] - oldPos[i]) * ease;
      }
      posAttr.needsUpdate = true;
      newMesh.geometry.computeVertexNormals();

      if (t < 1) {
        this.morphAnim = requestAnimationFrame(animateStep);
      } else {
        this.morphAnim = null;
      }
    };

    this.morphAnim = requestAnimationFrame(animateStep);
  }

  // Animate scale/position transition for GLB tabletops
  morphTabletopScale(oldState) {
    if (!oldState || !this.tabletopObject) return;

    if (this.morphAnim) cancelAnimationFrame(this.morphAnim);

    const newState = {
      scaleX: this.tabletopObject.scale.x,
      scaleY: this.tabletopObject.scale.y,
      scaleZ: this.tabletopObject.scale.z,
      posY: this.tabletopObject.position.y,
      posZ: this.tabletopObject.position.z
    };

    const startTime = performance.now();
    const duration = this.morphDuration;
    const obj = this.tabletopObject;

    const animateStep = (now) => {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);

      obj.scale.x = oldState.scaleX + (newState.scaleX - oldState.scaleX) * ease;
      obj.scale.y = oldState.scaleY + (newState.scaleY - oldState.scaleY) * ease;
      obj.scale.z = oldState.scaleZ + (newState.scaleZ - oldState.scaleZ) * ease;
      obj.position.y = oldState.posY + (newState.posY - oldState.posY) * ease;
      obj.position.z = oldState.posZ + (newState.posZ - oldState.posZ) * ease;

      if (t < 1) {
        this.morphAnim = requestAnimationFrame(animateStep);
      } else {
        this.morphAnim = null;
      }
    };

    this.morphAnim = requestAnimationFrame(animateStep);
  }

  // ─── Dimensions ───────────────────────────────

  getThicknessCm() {
    if (this.state.materialType === 'oak') return 4;
    return this.state.topThickness; // ceramic: 1.2 or 2
  }

  applyDimensions() {
    if (!this.currentModel || !this.baseBBox) return;
    const shape = TABLE_SHAPES.find(s => s.id === this.state.shape);
    if (!shape) return;

    // ─── Bootsform: swap which tabletop mesh is visible based on length+edge
    //     (GLB contains 32 pre-modeled tabletops; only one should be visible)
    if (shape.id === 'bootsform' && this._bootsformTabletops) {
      this._swapBootsformTabletop(shape);
    }
    // Bootsform: also swap the visible size-child on each internal leg group
    if (shape.id === 'bootsform' && this._bootsformInternalLegs) {
      this._swapBootsformInternalLegSizes();
    }

    // For Bootsform: don't scale the tabletop mesh — it's already sized correctly.
    // Use scale 1:1, only leg positioning uses length.
    let scaleX = this.state.length / shape.defaultLength;
    let scaleZ = this.state.width / shape.defaultWidth;
    if (shape.id === 'bootsform') {
      // Snap to closest available exact-size mesh — no scaling
      scaleX = 1;
      scaleZ = 1;
    }

    // Capture state BEFORE changes for smooth morphing
    const isProcedural = ['halfrond', 'boogvorm', 'rectangle', 'verbaan'].includes(shape.id);
    const oldVertices = isProcedural ? this.captureTabletopVertices() : null;
    const oldScaleState = !isProcedural ? this.captureTabletopState() : null;

    // Restore original scales
    this.currentModel.scale.set(1, 1, 1);
    // Reset both variant tabletops to original scale
    if (this.tabletopVariantA && this.tabletopOriginalScaleA) {
      this.tabletopVariantA.scale.copy(this.tabletopOriginalScaleA);
    }
    if (this.tabletopVariantB && this.tabletopOriginalScaleB) {
      this.tabletopVariantB.scale.copy(this.tabletopOriginalScaleB);
    }
    if (!this.tabletopVariantA && this.tabletopObject && this.tabletopOriginalScale) {
      this.tabletopObject.scale.copy(this.tabletopOriginalScale);
    }
    this.legObjects.forEach(leg => {
      if (leg.originalScale) leg.object.scale.copy(leg.originalScale);
    });

    if (shape.id === 'halfrond' || shape.id === 'boogvorm') {
      // Procedural tabletop shapes: rebuild with exact dimensions
      this.rebuildProceduralTop(shape);
    } else if (shape.id === 'rectangle' || shape.id === 'verbaan') {
      // Procedural tabletop: keep wrapper at original scale (dimensions are baked into geometry)
      this.rebuildGLBTabletop();
    }
    // Standard GLB tabletops: multiply original scale by dimension factor
    else if (this.tabletopObject && this.tabletopOriginalScale) {
      // Only scale thickness for ceramic (GLB already has correct ~4cm for oak)
      let scaleY = 1;
      if (this.state.materialType === 'ceramic') {
        const thicknessCm = this.getThicknessCm();
        const origThicknessCm = this.originalTopBox ? this.originalTopBox.height * 100 : 4;
        scaleY = thicknessCm / origThicknessCm;
      }
      // Scale both variant tabletops identically
      if (this.tabletopVariantA && this.tabletopOriginalScaleA) {
        this.applyScaleWithRotationAndThickness(this.tabletopVariantA, this.tabletopOriginalScaleA, scaleX, scaleZ, scaleY);
      }
      if (this.tabletopVariantB && this.tabletopOriginalScaleB) {
        this.applyScaleWithRotationAndThickness(this.tabletopVariantB, this.tabletopOriginalScaleB, scaleX, scaleZ, scaleY);
      }
      if (!this.tabletopVariantA) {
        this.applyScaleWithRotationAndThickness(this.tabletopObject, this.tabletopOriginalScale, scaleX, scaleZ, scaleY);
      }
      // Apply edge profile to GLB mesh if non-standard edge selected
      if (this.state.edge !== 'standaard') {
        this.applyEdgeProfileToGLBTabletop();
      } else {
        this.restoreGLBTabletopGeometry();
      }
    }

    // Re-map UVs after any tabletop rebuild (ensures ceramic textures cover full surface)
    this.remapTabletopUVs();

    // Leg positioning rules:
    // - Central legs: stretch when table >= 260cm
    // - Set legs (2, 3 or 4): symmetric spread based on edge distance rules
    const currentLength = this.state.length;
    const defaultLength = shape.defaultLength;

    // Central leg stretch: 17% for 260-300cm, 25% for >300cm
    const centralStretch = currentLength > 300 ? 1.25 : (currentLength >= 260 ? 1.17 : 1);

    // Set leg positioning: translate split halves independently. No scaling needed.
    const defaultEdgeDist = this.getLegEdgeDistance(defaultLength, shape.id);
    const currentEdgeDist = this.getLegEdgeDistance(currentLength, shape.id);
    const defaultTargetOuter = defaultLength / 2 - defaultEdgeDist; // cm from center
    const currentTargetOuter = currentLength / 2 - currentEdgeDist; // cm from center
    // How much to shift each half outward (+) or inward (-) in cm, then meters
    const spreadShiftCm = currentTargetOuter - defaultTargetOuter;
    const spreadShiftM = spreadShiftCm / 100;

    this.legObjects.forEach(leg => {
      if (!leg.originalScale) return;

      // Reset wrapper to original GLB transform
      leg.object.scale.copy(leg.originalScale);
      leg.object.position.copy(leg.originalPosition);
      // Reset split halves to original positions
      if (leg.splitHalves) {
        leg.splitHalves.forEach(half => {
          if (half.left && half.origLeftPos) half.left.position.copy(half.origLeftPos);
          if (half.right && half.origRightPos) half.right.position.copy(half.origRightPos);
        });
      }

      const isCentral = this.isCentralLeg(leg.displayName);
      const isSet = this.isSetLeg(leg.displayName);

      if (isCentral) {
        // Some central legs should not be stretched (pedestal/column types)
        const noStretchLegs = ['Positivo', 'Rund-Säule', 'Oval-Säule', 'Pluto', 'Kolom Kiezel', 'Kolom Organic', 'Diablo', 'Wellen-Säule'];
        const allowStretch = !noStretchLegs.includes(leg.displayName);

        // Extra stretch at 350+ for specific legs
        const longTableLegs = ['Stative', 'Konische Spider', 'Thore', 'Matrix', 'V-Form', 'Vera', 'Diablo'];
        let longTableScale = 1;
        if (currentLength >= 350 && longTableLegs.includes(leg.displayName)) {
          longTableScale = 1.30;
        }

        let centralScale = (allowStretch && centralStretch > 1) ? centralStretch : 1;
        centralScale = Math.max(centralScale, longTableScale);

        // Halve Plus: scale proportionally with table length (baseline 240cm)
        if (leg.displayName === 'Positivo' && currentLength > 240) {
          centralScale = currentLength / 240;
        }

        // Butterfly Wood: pull tips inward at shorter lengths on specific shapes
        if (leg.displayName === 'Hannah' && ['rectangle', 'verbaan', 'boogvorm', 'halfrond'].includes(shape.id)) {
          let inwardCm = 0;
          if (currentLength <= 180) inwardCm = 20;
          else if (currentLength <= 200) inwardCm = 20 - (currentLength - 180) / 20 * 10;
          else if (currentLength < 240) inwardCm = 10 - (currentLength - 200) / 40 * 10;
          if (inwardCm > 0) {
            // Compute mesh half-width in cm from bounding box (cached)
            if (!leg._halfWidthCm) {
              let minX = Infinity, maxX = -Infinity;
              leg.object.traverse(ch => {
                if (ch.isMesh && ch.geometry) {
                  const pos = ch.geometry.attributes.position;
                  for (let i = 0; i < pos.count; i++) {
                    const v = new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i));
                    ch.localToWorld(v);
                    if (v.x < minX) minX = v.x;
                    if (v.x > maxX) maxX = v.x;
                  }
                }
              });
              leg._halfWidthCm = ((maxX - minX) / 2) * 100;
            }
            const hw = leg._halfWidthCm;
            if (hw > 0) centralScale *= (hw - inwardCm) / hw;
          }
        }

        if (centralScale !== 1) {
          leg.object.scale.x = leg.originalScale.x * centralScale;
        }
        // Re-center: measure actual world bounding box and shift to model center
        this.currentModel.updateMatrixWorld(true);
        const cBox = new THREE.Box3().setFromObject(leg.object);
        const legMidX = (cBox.min.x + cBox.max.x) / 2;
        const modelMidX = this.currentModel.position.x;
        const drift = legMidX - modelMidX;
        if (Math.abs(drift) > 0.002) {
          leg.object.position.x -= drift;
        }
      } else if (isSet && shape.id === 'round' && leg.splitHalves && leg.splitHalves.length > 0) {
        // Round tables: radial spread — ~20cm from center at Ø100, ~50cm at Ø180
        const diam = this.state.length;
        const targetDistCm = 20 + (diam - 100) / 80 * 30; // linear: 20cm@Ø100 → 50cm@Ø180
        const defaultDistCm = 20 + (shape.defaultLength - 100) / 80 * 30;
        const diamRatio = targetDistCm / defaultDistCm;
        if (Math.abs(diamRatio - 1) > 0.001) {
          leg.splitHalves.forEach(half => {
            // Compute geometry bounding box centers and overall center once
            if (!half._roundInfo) {
              const parts = [];
              [half.left, half.right].forEach(mesh => {
                if (!mesh) return;
                mesh.geometry.computeBoundingBox();
                const bb = mesh.geometry.boundingBox;
                parts.push({
                  mesh,
                  geoCX: (bb.min.x + bb.max.x) / 2,
                  geoCZ: (bb.min.z + bb.max.z) / 2
                });
              });
              let allCX = 0, allCZ = 0;
              parts.forEach(p => { allCX += p.geoCX; allCZ += p.geoCZ; });
              if (parts.length > 0) { allCX /= parts.length; allCZ /= parts.length; }
              half._roundInfo = { parts, center: { x: allCX, z: allCZ } };
            }

            const { parts, center } = half._roundInfo;
            // Move each split mesh so its geometry center scales radially from overall center
            // Multiply by mesh.scale to convert geometry-space offsets to parent-local space
            parts.forEach(({ mesh, geoCX, geoCZ }) => {
              const offsetX = (geoCX - center.x) * mesh.scale.x;
              const offsetZ = (geoCZ - center.z) * mesh.scale.z;
              mesh.position.x = offsetX * (diamRatio - 1);
              mesh.position.z = offsetZ * (diamRatio - 1);
            });
          });
        } else if (leg.splitHalves) {
          // Reset positions
          leg.splitHalves.forEach(half => {
            if (half.left) { half.left.position.x = 0; half.left.position.z = 0; }
            if (half.right) { half.right.position.x = 0; half.right.position.z = 0; }
          });
        }
      } else if (isSet && leg.splitHalves && leg.splitHalves.length > 0) {
        // Per-leg inward offset (cm) for specific legs on specific shapes/lengths
        let legInwardCm = 0;
        if (leg.displayName === 'Hannah' && ['rectangle', 'verbaan', 'boogvorm', 'halfrond'].includes(shape.id)) {
          // 20cm inward @180, 10cm @200, 0cm @240+
          if (currentLength <= 180) legInwardCm = 20;
          else if (currentLength <= 200) legInwardCm = 20 - (currentLength - 180) / 20 * 10;
          else if (currentLength < 240) legInwardCm = 10 - (currentLength - 200) / 40 * 10;
        }
        // Walrus: 15% more inward on all shapes
        if (leg.displayName === 'Walrus') {
          legInwardCm += currentTargetOuter * 0.15;
        }
        // Hairpin: 10cm more inward at 180-200cm, taper to 0 at 240
        if (leg.displayName === 'Hairpin') {
          if (currentLength <= 200) legInwardCm += 10;
          else if (currentLength < 240) legInwardCm += 10 - (currentLength - 200) / 40 * 10;
        }
        const totalShiftM = (spreadShiftCm - legInwardCm) / 100;

        if (Math.abs(totalShiftM) > 0.001) {
        // Move split halves: left half shifts left, right half shifts right.
        // The shift must be converted to the LOCAL space of each split mesh's parent.
        // Walk up from the mesh to the model root, accumulating X scale.
        leg.splitHalves.forEach(half => {
          const refMesh = half.left || half.right;
          if (!refMesh) return;

          // Compute cumulative X scale from mesh parent up to (but not including) model root
          let cumulativeScaleX = 1;
          let node = refMesh.parent;
          while (node && node !== this.currentModel) {
            cumulativeScaleX *= node.scale.x;
            node = node.parent;
          }

          const localShift = totalShiftM / cumulativeScaleX;

          // Correct for off-center geometry so both halves are equidistant
          const centerCorrection = (leg.geomCenterX || 0) / cumulativeScaleX;

          if (half.left && half.origLeftPos) {
            half.left.position.x = half.origLeftPos.x - localShift - centerCorrection;
          }
          if (half.right && half.origRightPos) {
            half.right.position.x = half.origRightPos.x + localShift - centerCorrection;
          }
          // center mesh stays in place — no repositioning
        });
        }
      }

      // External pair legs (any external leg with 2 child instances):
      // Position at same edge-distance as internal set legs — unified rule
      if (leg.external && leg.object.children.length === 2) {
        const edgeDistCm = this.getLegEdgeDistance(currentLength, shape.id);
        const legPosM = (currentLength/2 - edgeDistCm) / 100;
        leg.object.children[0].position.x = -legPosM;
        leg.object.children[1].position.x =  legPosM;
      }
    });

    // Ensure tabletop sits flush on top of the active leg (prevent floating)
    this.alignTabletopToLeg();

    // Start smooth morph animation
    if (isProcedural && oldVertices) {
      this.morphTabletop(oldVertices);
    } else if (!isProcedural && oldScaleState) {
      this.morphTabletopScale(oldScaleState);
    }

    this.updateShadowCamera();
    this.applyVariant();
    this.renderLegGrid();
  }

  applyVariant() {
    if (!this.currentModel) return;
    const shape = TABLE_SHAPES.find(s => s.id === this.state.shape);
    if (!shape || !shape.hasVariant) return;

    const isB = this.state.variant === 'b';

    if (this.tabletopVariantA && this.tabletopVariantB) {
      // GLB-based shapes (Kiezel, Organisch): show/hide mirrored clone
      this.tabletopVariantA.visible = !isB;
      this.tabletopVariantB.visible = isB;

      // Show/hide the correct custom tabletop (edge profile replacement)
      const ctA = this.currentModel.getObjectByName('custom_tabletop_a');
      const ctB = this.currentModel.getObjectByName('custom_tabletop_b');
      if (ctA) ctA.visible = !isB;
      if (ctB) ctB.visible = isB;

      // Update active reference
      this.tabletopObject = isB ? this.tabletopVariantB : this.tabletopVariantA;
      this.tabletopOriginalScale = isB ? this.tabletopOriginalScaleB : this.tabletopOriginalScaleA;
    } else {
      // Procedural shapes (Luna): mirror via model scale.z
      const mirror = isB ? -1 : 1;
      this.currentModel.scale.z = Math.abs(this.currentModel.scale.z) * mirror;
    }
  }

  // Align tabletop bottom to the top of the active leg
  alignTabletopToLeg() {
    if (!this.hasSeparateTop || !this.tabletopObject) return;

    // Reset Y and Z position before measuring
    this.tabletopObject.position.y = 0;
    this.tabletopObject.position.z = 0;
    this.currentModel.updateMatrixWorld(true);

    // Compute current tabletop bounds in world space
    const topBox = new THREE.Box3();
    this.tabletopObject.traverse(ch => {
      if (ch.isMesh && ch.visible) {
        topBox.union(new THREE.Box3().setFromObject(ch));
      }
    });
    if (topBox.isEmpty()) return;

    // Get leg top Y
    const activeLeg = this.legObjects[this.activeLegIndex];
    let legTopY = -Infinity;
    if (activeLeg) {
      const legBox = new THREE.Box3();
      activeLeg.object.traverse(ch => {
        if (ch.isMesh) legBox.union(new THREE.Box3().setFromObject(ch));
      });
      if (!legBox.isEmpty()) legTopY = legBox.max.y;
    }

    const targetBottomY = legTopY > -Infinity ? legTopY : (this.originalTopBox ? this.originalTopBox.minY : topBox.min.y);
    const gap = topBox.min.y - targetBottomY;

    if (Math.abs(gap) > 0.0005) {
      const parentScale = new THREE.Vector3(1, 1, 1);
      if (this.tabletopObject.parent) {
        this.tabletopObject.parent.getWorldScale(parentScale);
      }
      const yOffset = -gap / (parentScale.y || 1);
      this.tabletopObject.position.y = yOffset;

      // Apply same Y offset to the inactive variant so both are at the same height
      const inactive = (this.tabletopObject === this.tabletopVariantA) ? this.tabletopVariantB : this.tabletopVariantA;
      if (inactive) {
        inactive.position.y = yOffset;
        inactive.position.z = 0;
      }

      this.currentModel.updateMatrixWorld(true);
    }
  }

  // Get extrude steps for edge profiles (more subdivisions = smoother curves)
  getExtrudeSteps() {
    const edge = this.state.edge;
    if (edge === 'standaard') return 1;
    if (edge === 'facet-bol') return 12;
    if (edge === 'boomstam') return 6; // for taper effect
    return 8;
  }

  // Apply edge profile by modifying vertices BEFORE rotation
  // Geometry is in XY plane (shape outline), extruded along Z (depth = thickness)
  // z=0 = front face (becomes BOTTOM after rotateX), z=depth = back face (becomes TOP)
  // mmToLocal: conversion factor from mm to geometry-local units
  applyEdgeProfile(geometry, thickness, mmToLocal) {
    const edge = this.state.edge;
    if (edge === 'standaard') return;
    if (!mmToLocal) mmToLocal = 0.001; // default: mm to meters

    const pos = geometry.attributes.position;
    const totalMm = thickness / mmToLocal; // total thickness in mm

    // For boomstam: precompute XY centroid to blend effect (full on long sides, zero on kopse kanten)
    let boomCx = 0, boomCy = 0;
    if (edge === 'boomstam') {
      let count = 0;
      for (let i = 0; i < pos.count; i++) {
        boomCx += pos.getX(i); boomCy += pos.getY(i); count++;
      }
      boomCx /= count; boomCy /= count;
    }

    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);

      // t: 0 at z=0 (bottom), 1 at z=depth (top)
      const t = Math.max(0, Math.min(1, z / thickness));

      let offsetMm = 0; // inward offset in mm

      switch (edge) {
        case 'facet': {
          // 15mm straight edge at top, rest at 25° angle downward
          const straightMm = 15;
          const straightT = 1 - straightMm / totalMm;
          if (t < straightT) {
            const chamferMm = totalMm - straightMm;
            const maxOffset = chamferMm / Math.tan(25 * Math.PI / 180);
            offsetMm = maxOffset * (1 - t / straightT);
          }
          break;
        }
        case '20graden': {
          // Starts at top, goes 20° inward all the way down
          // tan(20°) = offset / height → offset = height * tan(20°)
          const maxOffset = totalMm * Math.tan(20 * Math.PI / 180);
          offsetMm = maxOffset * (1 - t);
          break;
        }
        case '20graden-inv': {
          // Starts at bottom, goes 20° outward (top is narrower)
          const maxOffset = totalMm * Math.tan(20 * Math.PI / 180);
          offsetMm = maxOffset * t;
          break;
        }
        case 'facet-bol': {
          // Full-thickness convex rounding, 2x radius for maximum roundness
          const R = totalMm * 2.0;
          // Apply rounding across entire thickness (t=0 to t=1)
          const angle = (1 - t) * Math.PI / 2;
          offsetMm = R * (1 - Math.cos(angle));
          break;
        }
        case 'boomstam': {
          // Natural tree trunk edge: convex barrel profile
          // Top (t=1) is 10mm inward, bulges outward in middle, bottom tapers back in
          const topInset = 10;    // mm — top surface 1cm narrower
          const bottomInset = 5;  // mm — bottom slightly narrower
          // Widest point at ~30% from bottom
          const peakT = 0.30;

          // Smoothstep for ultra-smooth transitions
          const smoothstep = (v) => v * v * (3 - 2 * v);

          if (t >= peakT) {
            // Top portion: smoothstep from peak (0mm) to top (topInset)
            const localT = (t - peakT) / (1 - peakT); // 0 at peak, 1 at top
            offsetMm = topInset * smoothstep(localT);
          } else {
            // Bottom portion: smoothstep from bottom (bottomInset) to peak (0mm)
            const localT = t / peakT; // 0 at bottom, 1 at peak
            offsetMm = bottomInset * (1 - smoothstep(localT));
          }

          // Blend: full effect on long sides, zero on kopse kanten (short ends)
          // sin²(angle) = 0 at 0°/180° (kopse kant), 1 at 90°/270° (long side)
          const dx = x - boomCx;
          const dy = y - boomCy;
          const ang = Math.atan2(dy, dx);
          const sinA = Math.sin(ang);
          const blend = sinA * sinA; // 0 at kopse, 1 at long side
          offsetMm *= blend;
          break;
        }
        case 'sharknose': {
          // Small rounded nose at top (~15%), then steep 60° taper to a thin bottom edge
          const noseFrac = 0.15; // nose is top 15% of thickness
          const noseT = 1 - noseFrac; // t value where nose starts
          const noseMm = totalMm * noseFrac;
          const R = noseMm; // quarter-circle radius

          if (t >= noseT) {
            // Rounded nose: quarter circle
            const localT = (t - noseT) / noseFrac; // 0→1
            const angle = localT * Math.PI / 2;
            offsetMm = R * (1 - Math.cos(angle));
          } else {
            // Below nose: 60° chamfer from nose endpoint down to bottom
            const noseEndOffset = R; // offset at bottom of nose
            const chamferHeight = totalMm * (1 - noseFrac);
            const chamferMaxOffset = chamferHeight / Math.tan(55 * Math.PI / 180);
            const localT = t / noseT; // 0 at bottom, 1 at noseT
            offsetMm = noseEndOffset + chamferMaxOffset * (1 - localT);
          }
          break;
        }
      }

      if (offsetMm > 0) {
        // Move vertex inward by absolute offset (not proportional)
        // Direction: toward center of shape
        const dist = Math.sqrt(x * x + y * y);
        if (dist > 0.0001) {
          const offset = offsetMm * mmToLocal;
          // Absolute offset: subtract fixed distance, don't scale proportionally
          const newDist = Math.max(0, dist - offset);
          const ratio = newDist / dist;
          pos.setX(i, x * ratio);
          pos.setY(i, y * ratio);
        }
      }
    }

    pos.needsUpdate = true;
    geometry.computeVertexNormals();
  }

  // Detect if an object has a ~90° X rotation that swaps Y↔Z axes
  hasYZSwap(obj) {
    const absRotX = Math.abs(obj.rotation.x);
    // Only ±π/2 (±90°) swaps Y and Z. π (180°) does NOT swap them.
    return absRotX > Math.PI * 0.2 && absRotX < Math.PI * 0.8;
  }

  // Scale legs: spread horizontally but NEVER change height
  applyLegScale(obj, origScale, scaleX, scaleZ) {
    if (this.hasYZSwap(obj)) {
      // ±90° X rotation: local Y → world Z (width), local Z → world Y (height)
      obj.scale.set(
        origScale.x * scaleX,   // length
        origScale.y * scaleZ,   // width (swapped to Y)
        origScale.z             // height unchanged (swapped to Z)
      );
    } else {
      // No swap (0° or 180°): Y = height, Z = width
      obj.scale.set(
        origScale.x * scaleX,   // length
        origScale.y,             // height unchanged
        origScale.z * scaleZ     // width
      );
    }
  }

  applyScaleWithRotation(obj, origScale, scaleX, scaleZ) {
    if (this.hasYZSwap(obj)) {
      obj.scale.set(
        origScale.x * scaleX,
        origScale.y * scaleZ,
        origScale.z
      );
    } else {
      obj.scale.set(
        origScale.x * scaleX,
        origScale.y,
        origScale.z * scaleZ
      );
    }
  }

  applyScaleWithRotationAndThickness(obj, origScale, scaleX, scaleZ, scaleY) {
    if (this.hasYZSwap(obj)) {
      // Y↔Z swapped: Y=width(Z), Z=height(Y)
      obj.scale.set(
        origScale.x * scaleX,
        origScale.y * scaleZ,
        origScale.z * scaleY
      );
    } else {
      obj.scale.set(
        origScale.x * scaleX,
        origScale.y * scaleY,
        origScale.z * scaleZ
      );
    }
  }

  updateShadowCamera() {
    const light = this.scene.children.find(c => c.isDirectionalLight && c.castShadow);
    if (light && this.currentModel) {
      const box = new THREE.Box3().setFromObject(this.currentModel);
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.z) * 0.8;
      light.shadow.camera.left = -maxDim;
      light.shadow.camera.right = maxDim;
      light.shadow.camera.top = maxDim;
      light.shadow.camera.bottom = -maxDim;
      light.shadow.camera.updateProjectionMatrix();
    }
  }

  // ─── Camera ───────────────────────────────────

  getVisibleBounds() {
    // Compute bounding box from visible meshes only
    const box = new THREE.Box3();
    this.currentModel.updateMatrixWorld(true);
    this.currentModel.traverse(ch => {
      if (!ch.isMesh || !ch.visible) return;
      // Check parent chain visibility
      let p = ch.parent;
      let allVisible = true;
      while (p) { if (!p.visible) { allVisible = false; break; } p = p.parent; }
      if (!allVisible) return;
      const meshBox = new THREE.Box3().setFromObject(ch);
      box.union(meshBox);
    });
    return box;
  }

  frameCameraToModel() {
    if (!this.currentModel) return;
    // Frame based on tabletop if available (stable reference), otherwise visible bounds
    let box;
    if (this.hasSeparateTop && this.tabletopObject) {
      box = new THREE.Box3().setFromObject(this.tabletopObject);
    } else {
      box = this.getVisibleBounds();
    }
    if (box.isEmpty()) return;
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    const fov = this.camera.fov * (Math.PI / 180);
    const maxDim = Math.max(size.x, size.z);
    const idealDist = (maxDim / 2) / Math.tan(fov / 2) * 1.2;

    this.controls.minDistance = idealDist * 0.5;
    this.controls.maxDistance = idealDist * 2.5;

    this.controls.target.set(center.x, center.y, center.z);
    // Low 3/4 angle — camera near table-top height, offset diagonally
    this.camera.position.set(
      center.x + idealDist * 0.45,
      center.y + idealDist * 0.06,
      center.z + idealDist * 0.62
    );
    this.controls.update();
  }

  resetCamera() {
    this.frameCameraToModel();
  }

  // ─── UI Setup ─────────────────────────────────

  setupUI() {
    this.renderShapeGrid();
    this.renderColorSwatches();
    this.renderDimensionButtons();
    this.renderThicknessOptions();
    this.renderEdgeOptions();
    this.renderPowderSwatches();
    this.bindAccordions();
    this.bindResetCamera();
    this.bindAddToCart();
    this.updateShapeOptions();
    this.updateSummary();
  }

  bindAddToCart() {
    const cartHandler = () => {
      // Block redirect if user has not actively picked all 3 required components
      const missing = [];
      if (!this.state.userPickedBehandlung) missing.push('Behandlung');
      if (!this.state.userPickedEdge)       missing.push('Kantenbearbeitung');
      if (!this.state.userPickedLeg)        missing.push('Tischgestell');
      if (missing.length > 0) {
        this.showToast('Bitte wähle: ' + missing.join(', '));
        // Visually expand the first missing section so the user sees it
        const map = { Behandlung: 'material', Kantenbearbeitung: 'edge', Tischgestell: 'legs' };
        const sectionId = map[missing[0]];
        const sec = document.querySelector(`[data-section='${sectionId}']`);
        if (sec && !sec.classList.contains('active')) sec.querySelector('.section-header')?.click();
        sec?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      // Build cart permalink with ALL 4 line items: base table + Behandlung + edge + leg
      const v = this._selectedVariants || {};
      const items = [];
      if (v.base)       items.push(v.base       + ':1');
      if (v.behandlung) items.push(v.behandlung + ':1');
      if (v.edge)       items.push(v.edge       + ':1');
      if (v.leg)        items.push(v.leg        + ':1');
      if (items.length === 0) {
        this.showToast('Konfiguration unvollständig — bitte erneut auswählen');
        return;
      }
      const cartUrl = 'https://zazawoods.de/cart/' + items.join(',');
      window.location.href = cartUrl;
    };
    const btn = document.getElementById('btn-add-to-cart');
    if (btn) btn.addEventListener('click', cartHandler);
    const btnMobile = document.getElementById('btn-add-to-cart-mobile');
    if (btnMobile) btnMobile.addEventListener('click', cartHandler);
  }

  renderShapeGrid() {
    const grid = document.getElementById('shape-grid');
    grid.innerHTML = TABLE_SHAPES.map(shape => `
      <button class="shape-option ${shape.id === this.state.shape ? 'active' : ''}"
              data-shape="${shape.id}">
        ${shape.icon}
        <span>${shape.name}</span>
      </button>
    `).join('');

    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('.shape-option');
      if (!btn) return;

      const shapeId = btn.dataset.shape;
      if (shapeId === this.state.shape) return;

      // If another load is in flight, queue the latest shape as the next one
      // (load-token in loadModel makes the older one bail out cleanly).
      // Do NOT silently ignore — that's what made the UI feel broken.
      if (this.isLoading) {
        // visual feedback: pulse the loader text
        const lt = document.getElementById('loader-text');
        if (lt) lt.classList.add('loader-pulse');
        setTimeout(() => { if (lt) lt.classList.remove('loader-pulse'); }, 200);
      }

      this.state.shape = shapeId;
      this.state.variant = 'a'; // reset variant on shape change
      const shape = TABLE_SHAPES.find(s => s.id === shapeId);

      this.state.length = shape.defaultLength;
      this.state.width = shape.defaultWidth;
      this.state.radius = 0;
      this.renderDimensionButtons();

      grid.querySelectorAll('.shape-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      document.getElementById('val-shape').textContent = shape.name;
      const sectionIcon = btn.closest('.section').querySelector('.section-icon');
      sectionIcon.innerHTML = shape.icon;

      // Remember current leg name so we can restore it if available in new shape
      this._preferredLegName = this.legObjects[this.activeLegIndex]?.displayName || null;

      this.updateShapeOptions();
      this.renderEdgeOptions(); // update available edges per shape
      this.loadModel(shapeId);
      this.updateDimensionDisplay();
      this.updateSummary();
    });
  }

  // ─── Shape-specific options (Radius, Kopmaat) ───

  updateShapeOptions() {
    const container = document.getElementById('shape-options');
    if (!container) return;

    if (false && this.state.shape === 'rectangle') {
      // ── Rectangle radius UI hidden per design request (internal state.radius=0 default kept) ──
      container.innerHTML = `
        <div class="shape-sub-option">
          <div class="dim-section-label">Radius</div>
          <div class="dim-btn-row" id="radius-row">
            <button class="dim-btn ${this.state.radius === 0 ? 'active' : ''}" data-radius="0">Keine</button>
            <button class="dim-btn ${this.state.radius === 15 ? 'active' : ''}" data-radius="15">15mm</button>
            <button class="dim-btn ${this.state.radius === 35 ? 'active' : ''}" data-radius="35">35mm</button>
            <button class="dim-btn ${this.state.radius === 100 ? 'active' : ''}" data-radius="100">100mm</button>
          </div>
        </div>
      `;
      container.querySelector('#radius-row').addEventListener('click', (e) => {
        const btn = e.target.closest('.dim-btn');
        if (!btn) return;
        this.state.radius = parseInt(btn.dataset.radius);
        container.querySelectorAll('.dim-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.rebuildGLBTabletop();
        this.updateSummary();
      });
    } else if (this.state.shape === 'verbaan') {
      // Default Verbaan radius from GLB: 210mm
      if (!this.state.verbaanRadius && this.state.verbaanRadius !== 0) this.state.verbaanRadius = 500;
      container.innerHTML = `
        <div class="shape-sub-option">
          <div class="dim-section-label">Hoekradius</div>
          <div class="dim-btn-row" id="verbaan-radius-row">
            <button class="dim-btn ${this.state.verbaanRadius === 210 ? 'active' : ''}" data-radius="210">210mm</button>
            <button class="dim-btn ${this.state.verbaanRadius === 300 ? 'active' : ''}" data-radius="300">300mm</button>
            <button class="dim-btn ${this.state.verbaanRadius === 400 ? 'active' : ''}" data-radius="400">400mm</button>
            <button class="dim-btn ${this.state.verbaanRadius === 500 ? 'active' : ''}" data-radius="500">500mm</button>
          </div>
        </div>
      `;
      container.querySelector('#verbaan-radius-row').addEventListener('click', (e) => {
        const btn = e.target.closest('.dim-btn');
        if (!btn) return;
        this.state.verbaanRadius = parseInt(btn.dataset.radius);
        container.querySelectorAll('.dim-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.applyDimensions();
        this.updateSummary();
      });
    } else {
      container.innerHTML = '';
    }

    // Add Variant option for shapes that support it
    const shape = TABLE_SHAPES.find(s => s.id === this.state.shape);
    if (false && shape && shape.hasVariant) {
      // ── Variant A/B UI hidden per design request (defaults to 'a', internal logic kept) ──
      if (!this.state.variant) this.state.variant = 'a';
      const variantHTML = `
        <div class="shape-sub-option">
          <div class="dim-section-label">Variant</div>
          <div class="dim-btn-row" id="variant-row">
            <button class="dim-btn ${this.state.variant === 'a' ? 'active' : ''}" data-variant="a">Variant A</button>
            <button class="dim-btn ${this.state.variant === 'b' ? 'active' : ''}" data-variant="b">Variant B</button>
          </div>
        </div>
      `;
      container.insertAdjacentHTML('beforeend', variantHTML);
      container.querySelector('#variant-row').addEventListener('click', (e) => {
        const btn = e.target.closest('.dim-btn');
        if (!btn) return;
        this.state.variant = btn.dataset.variant;
        container.querySelectorAll('#variant-row .dim-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.applyVariant();
        this.updateSummary();
      });
    }
  }

  renderLegGrid() {
    const grid = document.getElementById('leg-grid');

    // Image swatches for each leg type, mapped by display name
    const legSwatchFiles = {
      // ─── HOUT ───
      'Konische Spider': 'Konisches Spidertischgestell_bw.png',
      'Pilares': 'Runde Holzsäule aus Eichenholz (Satz) (A)_bw.png',
      'Hannah': 'Butterfly Tischbeine aus Eichenholz (Satz) (A)_bw.png',
      'Wellen-Säule': 'Ovale Holzsäule aus Stäbchenholz, Eiche_bw.png',
      'Lara': null, // handled specially for wood/metal
      'Diablo': 'Column in Middle.png',
      'Ferdo': 'Pilaar.png',
      'Schuin': 'Schuin.png',
      'Rondo': 'Gerond Midden.png',
      'Bernard': 'Schuin 2.5.png',
      'Demi Lune': 'Demi Lune.png',
      'Blok': 'Blok.png',
      'Hapa': 'Halbrunde Tischbeine aus Eichenholz (Satz) (A)_bw.png',
      'Base': 'Base.png',
      'Wellen-Duo': 'Ovale Tischgestelle aus Eiche-Stäbchenholz (Satz)_bw.png',
      'Wellen-Rund': 'Runde Holzsäule aus Stäbchenholz, Eiche_bw.png',
      'Moda': 'Klassiek Midden.png',
      // ─── METAAL ───
      'Vera': '4 Legs on pole.png',
      'A-Form': 'A Tischgestell (Satz)_bw.png',
      'Butterfly': 'Butterfly.png',
      'Diago': 'Diagonal Pole.png',
      'V-Form': 'V Tischgestell_bw.png',
      'Walrus': 'Walrus.png',
      'Ekso': 'X modern.png',
      'X-Form': 'X Tischgestell (Satz)_bw.png',
      'Hairpin': 'Hairpin.png',
      'Matrix': 'Spider Tischgestell (S)_bw.png',
      'Stative': 'Stative.png',
      'Vedo': 'Flat Dining V.png',
      'Thore': 'Thore.png',
      'Criss Cross': 'Cris Cross.png',
      'Pluto': 'Kolom Plus.png',
      'Oval-Säule': 'Kolom Oval.png',
      'Tapse Spin': 'Tapse Spin.png',
      'Pedro': 'Thorn Tischgestelle (Satz)_bw.png',
      'VN': 'VN Tafelpoot.png',
      'Cona': 'Conisch.png',
      'Positivo': 'Halve Plus.png',
      'Rund-Säule': 'Kolom Rod.png',
      'Twist': 'Twist Tafelpoot Rond.png',
      'Vierpoot': 'Vierpoot.png',
      'Spider Tischgestell (L)': 'Spider Tischgestell (L)_bw.png',
      'Spider Tischgestell (M)': 'Spider Tischgestell (M)_bw.png',
      'Spider Tischgestell Edelstahl': 'Spider Tischgestell Edelstahl_bw.png',
      'Spider Tischgestell Edelstahl (S)': 'Spider Tischgestell Edelstahl (S)_bw.png',
      'U Tischgestell (Satz)': 'U Tischgestell (Satz)_bw.png',
      'U Tischgestell (M) (Satz)': 'U Tischgestell (M) (Satz)_bw.png',
      'U Tischgestell (schmal) (Satz)': 'U Tischgestell (schmal) (Satz)_bw.png',
      'Trapezium Tischgestell (Satz)': 'Trapezium Tischgestell (Satz)_bw.png',
      'Drone Tischbeine (Satz)': 'Drone Tischbeine (Satz)_bw.png',
      'Stahlwangen Tischgestell (Satz)': 'Stahlwangen Tischgestell (Satz)_bw.png',
      'Stahlwangen Tischgestell (S) (Satz)': 'Stahlwangen Tischgestell (S) (Satz)_bw.png',
      'Spider Gestell (rund)': 'Spider Gestell (rund)_bw.png',
      'Spider Gestell - Schmal (Rund)': 'Spider Gestell - Schmal (Rund)_bw.png',
    };

    const getLegSwatch = (name, isWood) => {
      // Special handling for Lara (different images for wood/metal)
      if (name === 'Lara') {
        const file = 'Aeris Tischgestell aus Eichenholz_bw.png';
        void isWood;
        return `<img src="Swatches/Onderstel/${file}?v=873d792-bw11" alt="${name}"/>`;
      }
      const file = legSwatchFiles[name];
      if (file) return `<img src="Swatches/Onderstel/${file}?v=873d792-bw11" alt="${name}"/>`;
      // Fallback SVG for unmapped legs
      return `<svg viewBox="0 0 60 50" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="5" y1="6" x2="55" y2="6"/><line x1="14" y1="6" x2="14" y2="46"/><line x1="46" y1="6" x2="46" y2="46"/></svg>`;
    };

    // Build a UNION of all Tischgestell addons across every product (so every leg
    // is available on every shape), then apply per-shape compatibility filtering.
    if (!ZW_PRODUCTS_DATA) {
      grid.innerHTML = '<p style="font-size:12px;color:#999;padding:8px 0;">Lade Untergestelle…</p>';
      return;
    }
    const unionByTitle = new Map();
    for (const prod of Object.values(ZW_PRODUCTS_DATA)) {
      for (const a of (prod.addons.Tischgestell || [])) {
        if (!unionByTitle.has(a.title)) unionByTitle.set(a.title, a);
      }
    }
    let unionLegs = Array.from(unionByTitle.values());
    // Add catalog-only legs that aren't addons on any product
    for (const cat of CATALOG_ONLY_LEGS) {
      if (!unionByTitle.has(cat.title)) unionLegs.push(cat);
    }
    // Always drop user-excluded patterns (Bank / Couchtisch / Bartisch)
    unionLegs = unionLegs.filter(a => !LEG_TITLE_EXCLUDE.test(a.title));

    // Shape compatibility filter
    const isRoundOnly    = t => /Schmal \(Rund\)|Spider Gestell \(rund\)|Runde Holzsäule/i.test(t);
    const isHalfrondOnly = t => /Halbrunde Tischbeine/i.test(t);
    const isUniversalRoundOK = t => /Konisches Spidertischgestell|Aeris Tischgestell aus Eichenholz|Ovale Holzsäule aus Stäbchenholz/i.test(t);
    let tischgestellList;
    if (this.state.shape === 'round') {
      // Only the 4 round-specific legs (Spider rund Schmal/normal, Runde Holzsäule Stäbchen/Eichenholz)
      tischgestellList = unionLegs.filter(a => isRoundOnly(a.title));
    } else if (this.state.shape === 'halfrond') {
      tischgestellList = unionLegs.filter(a => !isRoundOnly(a.title));
    } else {
      tischgestellList = unionLegs.filter(a => !isRoundOnly(a.title) && !isHalfrondOnly(a.title));
    }

    // Sort: FREE (€0) first, then paid ascending by price
    tischgestellList = tischgestellList.slice().sort((a, b) => {
      const aFree = (a.price === 0) ? 0 : 1;
      const bFree = (b.price === 0) ? 0 : 1;
      if (aFree !== bFree) return aFree - bFree;
      return (a.price || 0) - (b.price || 0);
    });

    // Sync zwLegName from current GLB leg, OR default to first ZW addon that ALSO has a 3D model match
    if (!tischgestellList.find(a => a.title === this.state.zwLegName)) {
      const firstWithModel = tischgestellList.find(item => {
        const model = ZW_LEG_MODEL_MAP[item.title];
        if (!model) return false;
        return this.legObjects.some(l => l.displayName === model.name && l.isWood === model.isWood);
      });
      this.state.zwLegName = (firstWithModel || tischgestellList[0])?.title || null;
    }
    // Sync the 3D scene to whatever zwLegName is currently chosen
    if (this.state.zwLegName) {
      const model = ZW_LEG_MODEL_MAP[this.state.zwLegName];
      if (model) {
        const idx = this.legObjects.findIndex(l => l.displayName === model.name && l.isWood === model.isWood);
        if (idx >= 0 && idx !== this.activeLegIndex) {
          this.switchLeg(idx);
        }
      } else {
        // Selected ZW leg has no 3D model — hide all leg meshes (tabletop stays)
        this.legObjects.forEach(l => { if (l.object) l.object.visible = false; });
        this.activeLegIndex = -1;
      }
      const vl = document.getElementById('val-legs');
      if (vl) vl.textContent = this.state.zwLegName;
    }

    const renderBtn = (item, idx) => {
      const model = ZW_LEG_MODEL_MAP[item.title];  // {name, isWood} | undefined
      let hasModel = false, legIdx = -1;
      if (model) {
        legIdx = this.legObjects.findIndex(l => l.displayName === model.name && l.isWood === model.isWood);
        if (legIdx >= 0) hasModel = true;
      }
      // Fallback: try to find by ZW title directly (external legs use title as
      // displayName). Fixes shapes where the internal bogade mesh isn't present
      // but the external GLB is loaded, e.g. "A Tischgestell (Satz)" on Bootsform.
      if (legIdx < 0) {
        legIdx = this.legObjects.findIndex(l => l.displayName === item.title);
        if (legIdx >= 0) hasModel = true;
      }
      const active = this.state.zwLegName === item.title;
      // Icon = ZW-titled grayscale photo (same file on every shape). Independent of
      // whether a 3D model exists for the current shape — placeholder was leaking
      // on shapes whose GLB doesn't include that leg's mesh.
      const swatchFile = encodeURIComponent(`${item.title}_bw.png`);
      const swatch = `<img src="Swatches/Onderstel/${swatchFile}?v=873d792-bw11" alt="${item.title}" onerror="this.style.display='none';this.parentNode.insertAdjacentHTML('beforeend','&lt;svg viewBox=&quot;0 0 60 50&quot; fill=&quot;none&quot; stroke=&quot;currentColor&quot; stroke-width=&quot;1.5&quot; stroke-linecap=&quot;round&quot;&gt;&lt;line x1=&quot;5&quot; y1=&quot;6&quot; x2=&quot;55&quot; y2=&quot;6&quot;/&gt;&lt;line x1=&quot;15&quot; y1=&quot;6&quot; x2=&quot;15&quot; y2=&quot;46&quot;/&gt;&lt;line x1=&quot;45&quot; y1=&quot;6&quot; x2=&quot;45&quot; y2=&quot;46&quot;/&gt;&lt;/svg&gt;')"/>`;
      const priceTag = item.price > 0 ? `<div class="leg-price">+€${(item.price/100).toFixed(0)}</div>` : '';
      return `
        <button class="leg-option ${hasModel ? 'has-model' : 'no-model'} ${active ? 'active' : ''}" data-zw-index="${idx}" data-leg-index="${legIdx}">
          <div class="leg-swatch-img">${swatch}</div>
          <div class="leg-name">${item.title}</div>
          ${priceTag}
        </button>
      `;
    };

    // Split into two categories: Metall (top) and Holz (bottom) — same UX as Bogade
    const isWoodTitle = t => /Eichenholz|Stäbchenholz|Holzsäule|aus\s+Eiche/i.test(t);
    const metalLegs = [];
    const woodLegs  = [];
    tischgestellList.forEach((item, idx) => (isWoodTitle(item.title) ? woodLegs : metalLegs).push({ item, idx }));
    let html = '';
    if (metalLegs.length) {
      html += '<div class="leg-category-label">Metall</div>';
      html += `<div class="leg-category-grid">${metalLegs.map(o => renderBtn(o.item, o.idx)).join('')}</div>`;
    }
    if (woodLegs.length) {
      html += '<div class="leg-category-label">Holz</div>';
      html += `<div class="leg-category-grid">${woodLegs.map(o => renderBtn(o.item, o.idx)).join('')}</div>`;
    }
    grid.innerHTML = html || '<p style="font-size:12px;color:#999;padding:8px 0;">Keine Untergestelle verfügbar</p>';

    grid.onclick = (e) => {
      const btn = e.target.closest('.leg-option');
      if (!btn) return;
      const zwIdx = parseInt(btn.dataset.zwIndex);
      let legIdx = parseInt(btn.dataset.legIndex);
      const item = tischgestellList[zwIdx];
      this.state.zwLegName = item.title;
      this.state.userPickedLeg = true;

      // Re-scan legObjects at click time: async external-leg loading may have
      // completed after render, but data-leg-index is a stale -1. Try to find
      // the leg NOW before deciding it doesn't have a model.
      if (legIdx < 0) {
        const mapped = ZW_LEG_MODEL_MAP[item.title];
        if (mapped) {
          legIdx = this.legObjects.findIndex(
            l => l.displayName === mapped.name && l.isWood === mapped.isWood
          );
        }
        // Fallback: direct-title match on external legs
        if (legIdx < 0) {
          legIdx = this.legObjects.findIndex(l => l.displayName === item.title);
        }
      }

      if (legIdx >= 0) {
        this.switchLeg(legIdx);
      } else {
        // Leg's 3D model isn't loaded yet (external GLB pending) or truly missing.
        // Do NOT hide all legs — keep the current visible one until the async
        // load finishes. renderLegGrid will run again after each external leg
        // load; state.zwLegName + userPickedLeg cause the discovery step to
        // auto-select the desired leg once available.
        // Only update state + cart bookkeeping.
        this.updatePrice();
      }
      grid.querySelectorAll('.leg-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('val-legs').textContent = item.title;
      this.updateSummary();
      this.updateLegSectionIcon();
    };

    this.updatePowderSectionVisibility();
    this.updateLegSectionIcon();
  }

  renderColorSwatches() {
    // Set material swatch images
    const oakSwatch = MATERIAL_TYPES.oak.colors.find(c => c.id === 'macchiato');
    const ceramicSwatch = MATERIAL_TYPES.ceramic.colors.find(c => c.id === 'silver-root');
    const oakImg = document.getElementById('oak-swatch-img');
    const ceramicImg = document.getElementById('ceramic-swatch-img');
    if (oakImg && oakSwatch) oakImg.style.backgroundImage = `url('${oakSwatch.file}')`;
    if (ceramicImg && ceramicSwatch) ceramicImg.style.backgroundImage = `url('${ceramicSwatch.file}')`;

    this.updateColorSwatches();

    const toggle = document.getElementById('material-type-toggle');
    toggle.addEventListener('click', (e) => {
      const btn = e.target.closest('.mat-type-swatch') || e.target.closest('.mat-type-btn');
      if (!btn) return;

      const type = btn.dataset.type;
      if (type === this.state.materialType) return;

      this.state.materialType = type;
      const matType = MATERIAL_TYPES[type];
      this.state.color = matType.colors[0].id;

      // Set thickness: oak always 4cm, ceramic defaults to first available
      if (type === 'oak') {
        this.state.topThickness = 4;
      } else {
        const colorDef = matType.colors[0];
        const available = colorDef.thicknesses || [1.2];
        this.state.topThickness = available.includes(2) ? 2 : available[0];
      }

      toggle.querySelectorAll('.mat-type-swatch, .mat-type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      this.updateColorSwatches();
      this.renderThicknessOptions();

      this.renderEdgeOptions();
      this.applyTopMaterial(type, this.state.color);
      this.renderDimensionButtons();
      this.applyDimensions();
      this.renderLegGrid();
      this.updateMaterialLabel();
      this.updateDimensionDisplay();
      this.updateSummary();
    });
  }

  updateColorSwatches() {
    const container = document.getElementById('color-swatches');
    if (!container) return;
    const product = ZW_PRODUCTS_DATA && ZW_PRODUCTS_DATA[this.state.shape];
    const behandlungs = product?.addons?.Behandlung || [];
    if (behandlungs.length === 0) {
      container.innerHTML = '<p style="font-size:12px;color:#999;padding:8px 0;">Lade Farben…</p>';
      return;
    }
    const matType = MATERIAL_TYPES.oak;
    container.innerHTML = behandlungs.map(b => {
      const oakId = BEHANDLUNG_TEXTURE_MAP[b.title] || 'natural';
      const oakColor = matType.colors.find(c => c.id === oakId) || matType.colors[0];
      const fileUrl = oakColor.file;
      const isActive = this.state.behandlungTitle === b.title;
      return `
        <button class="color-swatch ${isActive ? 'active' : ''}"
                data-behandlung-title="${b.title.replace(/"/g,'&quot;')}"
                data-variant-id="${b.variantId}"
                data-oak-id="${oakColor.id}"
                title="${b.title}">
          <div class="color-swatch-img" style="width:36px;height:36px;border-radius:50%;background:#e6dcc7 url('${fileUrl}') center/cover no-repeat;box-shadow:inset 0 0 0 1px rgba(0,0,0,0.06);flex-shrink:0;"></div>
          <span class="color-swatch-name">${b.title}</span>
        </button>
      `;
    }).join('');

    container.onclick = (e) => {
      const btn = e.target.closest('.color-swatch');
      if (!btn) return;
      const title = btn.dataset.behandlungTitle;
      const variantId = btn.dataset.variantId;
      const oakId = btn.dataset.oakId;
      this.state.behandlungTitle = title;
      this.state.color = oakId;
      this.state.userPickedBehandlung = true;
      this._selectedVariants = this._selectedVariants || {};
      this._selectedVariants.behandlung = variantId;
      container.querySelectorAll('.color-swatch').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      this.applyTopMaterial('oak', oakId);
      this.updateMaterialLabel();
      this.updateMaterialSectionIcon();
      this.updateSummary();
    };
  }


  updateMaterialSectionIcon() {
    const icon = document.getElementById('material-section-icon');
    if (!icon) return;
    const matType = MATERIAL_TYPES[this.state.materialType];
    const color = matType?.colors?.find(c => c.id === this.state.color);
    if (!color) return;
    const bg = color.file
      ? `background-image:url('${color.file}');background-size:cover;background-position:center;`
      : `background-color:${color.swatch};`;
    icon.innerHTML = `<div style="width:100%;height:100%;border-radius:50%;${bg}"></div>`;
  }

  updateMaterialLabel() {
    const matType = MATERIAL_TYPES[this.state.materialType];
    const color = matType.colors.find(c => c.id === this.state.color);
    // Prefer the actual Shopify Behandlung title if user has picked one (so e.g.
    // 'Unsichtbarer Skylt-Lack' is shown, not just the 'Natural' fallback texture name).
    const colorDisplay = this.state.behandlungTitle || (color ? color.name : '');
    document.getElementById('val-material').textContent =
      `${matType.name} \u00b7 ${colorDisplay}`;
  }

  renderEdgeOptions() {
    const container = document.getElementById('edge-options');
    const shape = TABLE_SHAPES.find(s => s.id === this.state.shape);
    const allowed = shape?.allowedEdges;

    // Cross-reference with ZW Kantenbearbeitung addons for this shape (single source of truth)
    const zwProduct = ZW_PRODUCTS_DATA && ZW_PRODUCTS_DATA[this.state.shape];
    const zwEdgeTitles = (zwProduct?.addons?.Kantenbearbeitung || []).map(a => a.title);
    const filteredEdges = EDGE_OPTIONS.filter(edge => {
      if (edge.onlyShapes && !edge.onlyShapes.includes(this.state.shape)) return false;
      if (edge.onlyMaterial && !edge.onlyMaterial.includes(this.state.materialType)) return false;
      if (allowed && !allowed.includes(edge.id)) return false;
      // If ZW data is loaded and this product has Kantenbearbeitung addons, only show edges that exist there
      if (zwEdgeTitles.length > 0) {
        const titles = EDGE_TITLE_MAP[edge.id] || [];
        if (!titles.some(t => zwEdgeTitles.includes(t))) return false;
      } else if (zwProduct) {
        // Product loaded but has NO edge addons → only the default 'standaard' makes sense
        if (edge.id !== 'standaard') return false;
      }
      return true;
    });

    // Reset to standaard if current edge is not available
    if (!filteredEdges.find(e => e.id === this.state.edge)) {
      this.state.edge = 'standaard';
      const valEdge = document.getElementById('val-edge');
      if (valEdge) valEdge.textContent = 'Gerade Kante';
    }

    const edgeSwatches = {
      'standaard': `<img src="Swatches/Randafwerking/Standaard.png" alt="Gerade"/>`,
      'facet': `<img src="Swatches/Randafwerking/Facetrand.png" alt="Facette"/>`,
      '20graden': `<img src="Swatches/Randafwerking/20 graden.png" alt="20 Grad"/>`,
      '20graden-inv': `<img src="Swatches/Randafwerking/20 graden inversed.png" alt="20 Grad invertiert"/>`,
      'facet-bol': `<img src="Swatches/Randafwerking/Facet bol.png" alt="Facette konvex"/>`,
      'boomstam': `<img src="Swatches/Randafwerking/Boomstamrand.png" alt="Baumstamm"/>`,
      'sharknose': `<img src="Swatches/Randafwerking/Facetrand.png" alt="Sharknose"/>`
    };

    container.innerHTML = filteredEdges.map(edge => `
      <button class="edge-option ${edge.id === this.state.edge ? 'active' : ''}"
              data-edge="${edge.id}">
        <div class="edge-swatch">${edgeSwatches[edge.id] || ''}</div>
        <span class="edge-option-name">${edge.name}</span>
      </button>
    `).join('');

    container.onclick = (e) => {
      const btn = e.target.closest('.edge-option');
      if (!btn) return;

      const edgeId = btn.dataset.edge;
      this.state.edge = edgeId;
      this.state.userPickedEdge = true;

      container.querySelectorAll('.edge-option').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const edge = EDGE_OPTIONS.find(e => e.id === edgeId);
      document.getElementById('val-edge').textContent = edge.name;
      // Update section icon to match selected edge
      const edgeIcon = document.getElementById('edge-section-icon');
      if (edgeIcon && edgeSwatches[edgeId]) edgeIcon.innerHTML = edgeSwatches[edgeId];
      this.applyDimensions(); // rebuild tabletop with new edge profile
      this.updateSummary();
    };

    // Set initial section icon to current edge
    const edgeIcon = document.getElementById('edge-section-icon');
    if (edgeIcon && edgeSwatches[this.state.edge]) edgeIcon.innerHTML = edgeSwatches[this.state.edge];
  }

  renderPowderSwatches() {
    const container = document.getElementById('powder-swatches');
    container.innerHTML = POWDER_COAT_COLORS.map(color => `
      <button class="swatch ${color.id === this.state.powderCoat ? 'active' : ''}"
              data-powder="${color.id}">
        <div class="swatch-circle" style="background-color: ${color.swatch}"></div>
        <span class="swatch-name">${color.name}</span>
      </button>
    `).join('');

    container.addEventListener('click', (e) => {
      const btn = e.target.closest('.swatch');
      if (!btn) return;

      const powderId = btn.dataset.powder;
      this.state.powderCoat = powderId;

      container.querySelectorAll('.swatch').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      this.applyPowderCoatToActiveLeg();
      this.updateSummary();
    });
  }

  bindAccordions() {
    document.querySelectorAll('.section-header').forEach(header => {
      header.addEventListener('click', () => {
        const section = header.closest('.section');
        const isActive = section.classList.contains('active');
        document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
        if (!isActive) section.classList.add('active');
      });
    });
  }

  renderDimensionButtons() {
    const container = document.getElementById('dimensions-container');
    const shape = TABLE_SHAPES.find(s => s.id === this.state.shape);
    if (!shape) return;

    // Ceramic limits: max 300cm length, 100cm width (round: 150cm diameter)
    const isCeramic = this.state.materialType === 'ceramic';
    const ceramicMaxDiameter = shape.ceramicMaxLength || (shape.lockAspect ? 150 : 300);
    const maxL = isCeramic ? ceramicMaxDiameter : 9999;
    const maxW = isCeramic ? (shape.lockAspect ? ceramicMaxDiameter : 100) : 9999;

    if (shape.fixedDimensions) {
      const filteredDims = shape.fixedDimensions.filter(([l, w]) => l <= maxL && w <= maxW);
      // If current selection exceeds ceramic limits, reset to largest valid
      if (isCeramic && !filteredDims.some(([l, w]) => l === this.state.length && w === this.state.width)) {
        const last = filteredDims[filteredDims.length - 1];
        if (last) { this.state.length = last[0]; this.state.width = last[1]; }
      }
      // De-duplicate by length so user sees one button per length (width is auto-paired internally)
      const uniqueByLength = [];
      const seen = new Set();
      for (const [l, w] of filteredDims) {
        if (!seen.has(l)) { uniqueByLength.push([l, w]); seen.add(l); }
      }
      container.innerHTML = `
        <div class="dim-section">
          <div class="dim-section-label">Länge (cm)</div>
          <div class="dim-btn-row" id="dim-fixed-grid">
            ${uniqueByLength.map(([l, w]) => `
              <button class="dim-btn ${l === this.state.length ? 'active' : ''}"
                      data-length="${l}" data-width="${w}">
                ${l}
              </button>
            `).join('')}
          </div>
        </div>
      `;

      container.querySelector('#dim-fixed-grid').addEventListener('click', (e) => {
        const btn = e.target.closest('.dim-btn');
        if (!btn) return;
        this.state.length = parseInt(btn.dataset.length);
        this.state.width = parseInt(btn.dataset.width);
        container.querySelector('#dim-fixed-grid').querySelectorAll('.dim-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.applyDimensions();
        this.updateDimensionDisplay();
        this.updateSummary();
      });

    } else if (shape.lockAspect) {
      const filteredLengths = shape.lengths.filter(v => v <= Math.min(maxL, maxW));
      if (isCeramic && !filteredLengths.includes(this.state.length)) {
        this.state.length = filteredLengths[filteredLengths.length - 1] || filteredLengths[0];
        this.state.width = this.state.length;
      }
      container.innerHTML = `
        <div class="dim-section">
          <div class="dim-section-label">Diameter</div>
          <div class="dim-btn-row" id="dim-diameter-row">
            ${filteredLengths.map(v => `
              <button class="dim-btn ${v === this.state.length ? 'active' : ''}"
                      data-value="${v}">${v}</button>
            `).join('')}
          </div>
        </div>
      `;

      container.querySelector('#dim-diameter-row').addEventListener('click', (e) => {
        const btn = e.target.closest('.dim-btn');
        if (!btn) return;
        const val = parseInt(btn.dataset.value);
        this.state.length = val;
        this.state.width = val;
        container.querySelectorAll('.dim-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.applyDimensions();
        this.renderLegGrid();
        this.updateDimensionDisplay();
        this.updateSummary();
      });

    } else {
      const filteredLengths = shape.lengths.filter(v => v <= maxL);
      const filteredWidths = shape.widths.filter(v => v <= maxW);
      if (isCeramic && !filteredLengths.includes(this.state.length)) {
        this.state.length = filteredLengths[filteredLengths.length - 1] || filteredLengths[0];
      }
      if (isCeramic && !filteredWidths.includes(this.state.width)) {
        this.state.width = filteredWidths[filteredWidths.length - 1] || filteredWidths[0];
      }
      // Breite section hidden per design request; width stays at shape.defaultWidth internally.
      container.innerHTML = `
        <div class="dim-section">
          <div class="dim-section-label">Länge (cm)</div>
          <div class="dim-btn-row" id="dim-length-row">
            ${filteredLengths.map(v => `
              <button class="dim-btn ${v === this.state.length ? 'active' : ''}"
                      data-value="${v}">${v}</button>
            `).join('')}
          </div>
        </div>
      `;

      container.querySelector('#dim-length-row').addEventListener('click', (e) => {
        const btn = e.target.closest('.dim-btn');
        if (!btn) return;
        this.state.length = parseInt(btn.dataset.value);
        container.querySelector('#dim-length-row').querySelectorAll('.dim-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.applyDimensions();
        this.updateDimensionDisplay();
        this.updateSummary();
      });

      // (Breite click handler removed — width is no longer user-selectable)
    }

    this.renderThicknessOptions();
    this.updateDimensionDisplay();
  }

  renderThicknessOptions() {
    const container = document.getElementById('thickness-options');
    if (!container) return;

    const matType = MATERIAL_TYPES[this.state.materialType];

    if (matType.thicknessOptions) {
      // Ceramic: show thickness buttons with per-color availability
      const colorDef = matType.colors.find(c => c.id === this.state.color);
      const availableThicknesses = colorDef && colorDef.thicknesses ? colorDef.thicknesses : [1.2];

      // If current thickness not available for this color, switch to first available
      if (!availableThicknesses.includes(this.state.topThickness)) {
        this.state.topThickness = availableThicknesses[0];
      }

      container.innerHTML = `
        <div class="dim-section">
          <div class="dim-section-label">Plattenstärke</div>
          <div class="dim-btn-row" id="thickness-row">
            ${matType.thicknessOptions.map(t => {
              const isAvailable = availableThicknesses.includes(t);
              const isActive = this.state.topThickness === t;
              return `<button class="dim-btn ${isActive ? 'active' : ''} ${!isAvailable ? 'locked' : ''}"
                      data-thickness="${t}" ${!isAvailable ? 'disabled' : ''}>${t === 1.2 ? '12mm' : '20mm'}</button>`;
            }).join('')}
          </div>
        </div>
      `;
      container.querySelector('#thickness-row').addEventListener('click', (e) => {
        const btn = e.target.closest('.dim-btn');
        if (!btn || btn.classList.contains('locked')) return;
        this.state.topThickness = parseFloat(btn.dataset.thickness);
        container.querySelectorAll('.dim-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.applyDimensions();
        this.updateDimensionDisplay();
        this.updateSummary();
      });
    } else {
      // Oak: fixed 4cm, just show info
      container.innerHTML = '';
    }

    // Update the static thickness display
    document.getElementById('thickness-value').textContent = this.getThicknessCm() + ' cm';
  }

  updateDimensionDisplay() {
    const isRound = this.state.shape === 'round';
    const thicknessCm = this.getThicknessCm();
    document.getElementById('thickness-value').textContent = thicknessCm + ' cm';

    const badge = document.getElementById('dimension-badge');
    if (isRound) {
      badge.innerHTML = `\u00d8 <span id="dim-length">${this.state.length}</span> x <span id="dim-height">${thicknessCm}</span> cm`;
      document.getElementById('val-dimensions').textContent =
        `\u00d8 ${this.state.length} cm \u00b7 ${thicknessCm} cm`;
    } else {
      badge.innerHTML = `<span id="dim-length">${this.state.length}</span> x <span id="dim-width">${this.state.width}</span> x <span id="dim-height">${thicknessCm}</span> cm`;
      document.getElementById('val-dimensions').textContent =
        `${this.state.length} \u00d7 ${this.state.width} \u00d7 ${thicknessCm} cm`;
    }
  }

  bindResetCamera() {
    document.getElementById('btn-reset-camera').addEventListener('click', () => {
      this.resetCamera();
    });

    // AR button
    document.getElementById('btn-ar').addEventListener('click', () => this.handleAR());
    document.getElementById('ar-popup-close')?.addEventListener('click', () => {
      document.getElementById('ar-popup').classList.add('hidden');
    });
    document.getElementById('ar-popup')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) e.currentTarget.classList.add('hidden');
    });

    // Save/load button
    document.getElementById('btn-save').addEventListener('click', () => this.showSavedConfigs());
    document.getElementById('saved-popup-close')?.addEventListener('click', () => {
      document.getElementById('saved-popup').classList.add('hidden');
    });
    document.getElementById('saved-popup')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) e.currentTarget.classList.add('hidden');
    });

    // Share button
    document.getElementById('btn-share').addEventListener('click', () => this.showSharePopup());
    document.getElementById('share-popup-close')?.addEventListener('click', () => {
      document.getElementById('share-popup').classList.add('hidden');
    });
    document.getElementById('share-popup')?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) e.currentTarget.classList.add('hidden');
    });
    document.querySelectorAll('.share-opt').forEach(btn => {
      btn.addEventListener('click', () => this.handleShare(btn.dataset.channel));
    });
  }

  getConfigSummaryText() {
    const shape = TABLE_SHAPES.find(s => s.id === this.state.shape);
    const matType = MATERIAL_TYPES[this.state.materialType];
    const color = matType?.colors.find(c => c.id === this.state.color);
    const activeLeg = this.legObjects[this.activeLegIndex];
    const edgeNames = { standaard: 'Gerade Kante', facet: 'Schweizer Kante', boomstam: 'Baumstammkante' };

    const lines = [];
    lines.push(`${shape?.name || ''} · ${this.state.materialType === 'oak' ? 'Eiche' : 'Keramik'} ${this.state.behandlungTitle || color?.name || ''}`);
    if (this.state.shape === 'round') {
      lines.push(`Ø ${this.state.length} cm · ${this.getThicknessCm()} cm`);
    } else {
      lines.push(`${this.state.length} × ${this.state.width} × ${this.getThicknessCm()} cm`);
    }
    lines.push(`Kantenbearbeitung: ${edgeNames[this.state.edge] || this.state.edge}`);
    if (this.state.zwLegName) lines.push(`Tischgestell: ${this.state.zwLegName}`); else if (activeLeg) lines.push(`Tischgestell: ${activeLeg.displayName}${activeLeg.isWood ? ' (Holz)' : ' (Metall)'}`);
    return lines;
  }

  getShareUrl() {
    return `https://zazawoods.de/pages/esstisch-konfigurator${window.location.search}`;
  }

  showSharePopup() {
    document.getElementById('share-popup').classList.remove('hidden');
  }

  handleShare(channel) {
    const url = this.getShareUrl();
    const summary = this.getConfigSummaryText().join('\n');
    const text = `Sieh dir meine Zaza Woods Esstisch-Konfiguration an:\n${summary}\n\n`;

    switch (channel) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(text + url)}`, '_blank');
        break;
      case 'email':
        window.open(`mailto:?subject=${encodeURIComponent('Meine Zaza Woods Tischkonfiguration')}&body=${encodeURIComponent(text + url)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url).then(() => this.showToast('Link kopiert'));
        break;
    }
    document.getElementById('share-popup').classList.add('hidden');
  }

  showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.remove('hidden');
    requestAnimationFrame(() => toast.classList.add('show'));
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.classList.add('hidden'), 300);
    }, 2500);
  }

  takeScreenshot() {
    // Render one clean frame
    this.renderer.render(this.scene, this.camera);

    const srcCanvas = this.renderer.domElement;
    const w = srcCanvas.width;
    const h = srcCanvas.height;

    // Create overlay canvas
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    // Draw 3D scene
    ctx.drawImage(srcCanvas, 0, 0);

    // Summary text
    const lines = this.getConfigSummaryText();
    const fontSize = Math.max(11, Math.round(h * 0.013));
    const padding = Math.round(h * 0.015);
    const lineHeight = fontSize * 1.35;
    const logoImg = document.querySelector('.brand img');

    // Measure text width
    ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    let maxTextW = 0;
    lines.forEach(line => {
      maxTextW = Math.max(maxTextW, ctx.measureText(line).width);
    });

    // Logo + "ZAZA WOODS" text dimensions
    const logoH = Math.round(h * 0.032);
    const logoW = logoImg ? logoH * (logoImg.naturalWidth / logoImg.naturalHeight) : 0;
    const brandFont = `600 ${Math.round(fontSize * 1.0)}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    ctx.font = brandFont;
    const brandTextW = ctx.measureText('ZAZA WOODS').width;
    const brandRowW = logoW + 6 + brandTextW;
    maxTextW = Math.max(maxTextW, brandRowW);

    const boxW = maxTextW + padding * 3;
    const boxH = padding + lines.length * lineHeight + padding * 0.8 + logoH + padding;
    const boxX = padding;
    const boxY = h - boxH - padding;

    // Draw summary box (bottom-left)
    ctx.fillStyle = 'rgba(255,255,255,0.88)';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(boxX, boxY, boxW, boxH, 8);
    } else {
      ctx.rect(boxX, boxY, boxW, boxH);
    }
    ctx.fill();

    // Draw config lines
    ctx.fillStyle = '#1a1a1a';
    ctx.font = `600 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
    lines.forEach((line, i) => {
      if (i > 0) ctx.font = `400 ${fontSize}px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`;
      ctx.fillText(line, boxX + padding, boxY + padding + (i + 1) * lineHeight - fontSize * 0.2);
    });

    // Draw separator line
    const sepY = boxY + padding + lines.length * lineHeight + padding * 0.3;
    ctx.strokeStyle = 'rgba(0,0,0,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(boxX + padding, sepY);
    ctx.lineTo(boxX + boxW - padding, sepY);
    ctx.stroke();

    // Draw logo + ZAZA WOODS text (centered in remaining space)
    const brandY = sepY + padding * 0.4;
    const brandTotalW = logoW + 6 + brandTextW;
    const brandX = boxX + (boxW - brandTotalW) / 2;
    if (logoImg && logoImg.complete) {
      ctx.drawImage(logoImg, brandX, brandY, logoW, logoH);
    }
    ctx.fillStyle = '#1a1a1a';
    ctx.font = brandFont;
    ctx.fillText('ZAZA WOODS', brandX + logoW + 6, brandY + logoH * 0.75);

    // Generate filename: Vorm-length-color-legname
    const shape = TABLE_SHAPES.find(s => s.id === this.state.shape);
    const matType = MATERIAL_TYPES[this.state.materialType];
    const color = matType?.colors.find(c => c.id === this.state.color);
    const activeLeg = this.legObjects[this.activeLegIndex];
    const filename = [
      shape?.name || 'Tisch',
      this.state.length,
      color?.name || '',
      activeLeg?.displayName || ''
    ].join('-').replace(/\s+/g, '_').replace(/[()]/g, '') + '.png';

    // Export
    const finalUrl = canvas.toDataURL('image/png');
    if (navigator.share && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      canvas.toBlob(async (blob) => {
        const file = new File([blob], filename, { type: 'image/png' });
        try {
          await navigator.share({ title: 'Mein Zaza Woods Tisch', files: [file] });
        } catch { /* user cancelled */ }
      });
    } else {
      const a = document.createElement('a');
      a.href = finalUrl;
      a.download = filename;
      a.click();
    }
    this.showToast('Screenshot gespeichert');
  }

  saveCurrentConfig() {
    const saved = JSON.parse(localStorage.getItem('zazawoods-saved-configs') || '[]');

    // Generate a thumbnail
    this.renderer.render(this.scene, this.camera);
    const thumb = this.renderer.domElement.toDataURL('image/jpeg', 0.5);

    const shape = TABLE_SHAPES.find(s => s.id === this.state.shape);
    const matType = MATERIAL_TYPES[this.state.materialType];
    const color = matType?.colors.find(c => c.id === this.state.color);
    const activeLeg = this.legObjects[this.activeLegIndex];

    const config = {
      id: Date.now(),
      thumb,
      title: `${shape?.name || ''} · ${color?.name || ''}`,
      sub: `${this.state.length} cm · ${activeLeg?.displayName || ''}`,
      state: { ...this.state },
      legName: activeLeg?.displayName || '',
      url: window.location.search
    };

    saved.unshift(config);
    if (saved.length > 10) saved.pop(); // max 10
    localStorage.setItem('zazawoods-saved-configs', JSON.stringify(saved));
    this.showToast('Konfiguration gespeichert');
    return config;
  }

  showSavedConfigs() {
    const popup = document.getElementById('saved-popup');
    const list = document.getElementById('saved-list');
    const empty = document.getElementById('saved-empty');
    const saved = JSON.parse(localStorage.getItem('zazawoods-saved-configs') || '[]');

    if (saved.length === 0) {
      list.innerHTML = '';
      empty.style.display = '';
      // Show save button
      list.innerHTML = `<button id="save-current-btn" style="width:100%;padding:12px;border-radius:10px;border:1px solid var(--color-accent);background:var(--color-accent-light);color:var(--color-accent);font-weight:600;font-size:13px;cursor:pointer;margin-bottom:12px;">+ Aktuelle Konfiguration speichern</button>`;
      list.querySelector('#save-current-btn').onclick = () => {
        this.saveCurrentConfig();
        this.showSavedConfigs(); // refresh
      };
    } else {
      empty.style.display = 'none';
      let html = `<button id="save-current-btn" style="width:100%;padding:12px;border-radius:10px;border:1px solid var(--color-accent);background:var(--color-accent-light);color:var(--color-accent);font-weight:600;font-size:13px;cursor:pointer;margin-bottom:12px;">+ Aktuelle Konfiguration speichern</button>`;
      saved.forEach(c => {
        html += `
          <div class="saved-card" data-url="${c.url}">
            <img class="saved-card-img" src="${c.thumb}" alt="">
            <div class="saved-card-info">
              <div class="saved-card-title">${c.title}</div>
              <div class="saved-card-sub">${c.sub}</div>
            </div>
            <button class="saved-card-del" data-id="${c.id}" title="Löschen">&times;</button>
          </div>`;
      });
      list.innerHTML = html;

      // Save current
      list.querySelector('#save-current-btn').onclick = () => {
        this.saveCurrentConfig();
        this.showSavedConfigs();
      };

      // Load config on card click
      list.querySelectorAll('.saved-card').forEach(card => {
        card.addEventListener('click', (e) => {
          if (e.target.closest('.saved-card-del')) return;
          const url = card.dataset.url;
          if (url) window.location.search = url.replace('?', '');
          popup.classList.add('hidden');
        });
      });

      // Delete
      list.querySelectorAll('.saved-card-del').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = parseInt(btn.dataset.id);
          const updated = saved.filter(c => c.id !== id);
          localStorage.setItem('zazawoods-saved-configs', JSON.stringify(updated));
          this.showSavedConfigs();
        });
      });
    }

    popup.classList.remove('hidden');
  }

  async handleAR() {
    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    const btn = document.getElementById('btn-ar');
    btn.classList.add('loading');

    try {
      if (isIOS) {
        // iOS: export scene to GLB and launch AR via Quick Look
        const glbBlob = await this.exportSceneToGLB();
        const blobUrl = URL.createObjectURL(glbBlob);

        let mv = document.getElementById('ar-model-viewer');
        if (mv) mv.remove();

        mv = document.createElement('model-viewer');
        mv.id = 'ar-model-viewer';
        mv.setAttribute('src', blobUrl);
        mv.setAttribute('ar', '');
        mv.setAttribute('ar-modes', 'quick-look');
        mv.setAttribute('ar-scale', 'fixed');
        mv.setAttribute('camera-controls', '');
        mv.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none;z-index:-1;';
        document.body.appendChild(mv);

        mv.addEventListener('load', () => {
          mv.activateAR();
          btn.classList.remove('loading');
        }, { once: true });

        setTimeout(() => btn.classList.remove('loading'), 5000);

      } else if (isAndroid) {
        // Android: QR popup
        btn.classList.remove('loading');
        this.showARPopup();

      } else {
        // Desktop: show popup with instructions + QR code
        btn.classList.remove('loading');
        this.showARPopup();
      }
    } catch (err) {
      console.error('AR error:', err);
      btn.classList.remove('loading');
      // On any error, fallback to QR popup
      if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        this.showARPopup();
      }
    }
  }

  showARPopup() {
    const popup = document.getElementById('ar-popup');
    popup.classList.remove('hidden');

    const qrContainer = document.getElementById('ar-qr');
    qrContainer.innerHTML = '';

    const params = new URL(window.location.href).search;
    const currentUrl = 'https://zazawoods.de/pages/esstisch-konfigurator' + params;
    const qrImg = document.createElement('img');
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(currentUrl)}&margin=8`;
    qrImg.width = 180;
    qrImg.height = 180;
    qrImg.style.borderRadius = '8px';
    qrImg.alt = 'QR Code';
    qrContainer.appendChild(qrImg);
  }

  async startWebXR() {
    const session = await navigator.xr.requestSession('immersive-ar', {
      requiredFeatures: ['hit-test', 'dom-overlay'],
      domOverlay: { root: document.getElementById('viewer') }
    });

    // Create a separate renderer for WebXR
    const xrRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    xrRenderer.setPixelRatio(window.devicePixelRatio);
    xrRenderer.setSize(window.innerWidth, window.innerHeight);
    xrRenderer.xr.enabled = true;
    xrRenderer.xr.setReferenceSpaceType('local');

    // Fullscreen overlay for the AR session
    const overlay = document.createElement('div');
    overlay.id = 'webxr-overlay';
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:99999;';
    overlay.appendChild(xrRenderer.domElement);

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'Schließen';
    closeBtn.style.cssText = 'position:fixed;top:20px;right:20px;z-index:100000;padding:12px 24px;border-radius:24px;border:none;background:rgba(0,0,0,0.7);color:#fff;font-size:14px;font-weight:600;cursor:pointer;';
    closeBtn.onclick = () => {
      session.end();
    };
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);

    // Clone the current model for AR scene
    const arScene = new THREE.Scene();
    const arCamera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 20);

    // Lighting for AR
    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    arScene.add(light);
    const directional = new THREE.DirectionalLight(0xffffff, 0.8);
    directional.position.set(0.5, 1, 0.5);
    arScene.add(directional);

    // Clone model and scale to real-world size (model is in ~meters already)
    const modelClone = this.currentModel.clone(true);
    // Remove invisible objects
    const toRemove = [];
    modelClone.traverse(ch => { if (!ch.visible) toRemove.push(ch); });
    toRemove.forEach(o => o.parent?.remove(o));
    modelClone.visible = false; // hidden until placed
    arScene.add(modelClone);

    // Reticle for placement
    const reticleGeom = new THREE.RingGeometry(0.08, 0.1, 32).rotateX(-Math.PI / 2);
    const reticleMat = new THREE.MeshBasicMaterial({ color: 0xb5956b });
    const reticle = new THREE.Mesh(reticleGeom, reticleMat);
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    arScene.add(reticle);

    let placed = false;
    let hitTestSource = null;

    await xrRenderer.xr.setSession(session);

    session.addEventListener('end', () => {
      overlay.remove();
      xrRenderer.dispose();
    });

    // Set up hit testing
    const viewerSpace = await session.requestReferenceSpace('viewer');
    const hitTestSourceInit = await session.requestHitTestSource({ space: viewerSpace });
    hitTestSource = hitTestSourceInit;

    // Place model on tap
    session.addEventListener('select', () => {
      if (reticle.visible && !placed) {
        modelClone.position.setFromMatrixPosition(reticle.matrix);
        modelClone.visible = true;
        placed = true;
      } else if (placed) {
        // Tap again to reposition
        modelClone.position.setFromMatrixPosition(reticle.matrix);
      }
    });

    // Render loop
    const refSpace = await session.requestReferenceSpace('local');
    xrRenderer.setAnimationLoop((time, frame) => {
      if (!frame) return;

      // Hit test for placement reticle
      if (hitTestSource) {
        const hitResults = frame.getHitTestResults(hitTestSource);
        if (hitResults.length > 0) {
          const hit = hitResults[0];
          const pose = hit.getPose(refSpace);
          reticle.visible = true;
          reticle.matrix.fromArray(pose.transform.matrix);
        } else {
          reticle.visible = false;
        }
      }

      xrRenderer.render(arScene, arCamera);
    });
  }

  async exportSceneToGLB() {
    if (!this.currentModel) throw new Error('No model loaded');

    const exporter = new GLTFExporter();

    // Clone the visible parts of the scene for export
    const exportScene = new THREE.Scene();
    const modelClone = this.currentModel.clone(true);

    // Remove invisible objects to keep export clean
    const toRemove = [];
    modelClone.traverse(child => {
      if (!child.visible) toRemove.push(child);
    });
    toRemove.forEach(obj => obj.parent?.remove(obj));

    exportScene.add(modelClone);

    return new Promise((resolve, reject) => {
      exporter.parse(
        exportScene,
        (buffer) => resolve(new Blob([buffer], { type: 'model/gltf-binary' })),
        (error) => reject(error),
        { binary: true }
      );
    });
  }

  updateSummary() {
    const shape = TABLE_SHAPES.find(s => s.id === this.state.shape);
    const matType = MATERIAL_TYPES[this.state.materialType];
    if (!shape || !matType) return;
    const color = matType.colors.find(c => c.id === this.state.color);
    const edge = EDGE_OPTIONS.find(e => e.id === this.state.edge);
    const powder = POWDER_COAT_COLORS.find(c => c.id === this.state.powderCoat);

    const activeLeg = this.legObjects[this.activeLegIndex];
    let legLabel = '';
    if (activeLeg) {
      const legType = activeLeg.isWood ? 'Holz' : (powder ? powder.name : 'Metall');
      legLabel = `${activeLeg.displayName} (${legType})`;
    }

    let extras = '';
    if (this.state.shape === 'rectangle' && this.state.radius > 0) {
      extras += ` &middot; Radius ${this.state.radius}mm`;
    }

    const summary = document.getElementById('summary-text');
    const dimStr = this.state.shape === 'round'
      ? `\u00d8 ${this.state.length} cm \u00b7 ${this.getThicknessCm()} cm`
      : `${this.state.length} \u00d7 ${this.state.width} \u00d7 ${this.getThicknessCm()} cm`;
    summary.innerHTML = `
      <strong>${shape.name}</strong> &middot; ${matType.name} ${this.state.behandlungTitle || (color ? color.name : '')}<br>
      ${dimStr} &middot;
      ${edge ? edge.name : 'Gerade Kante'}${extras}
      ${this.state.zwLegName ? `<br>Tischgestell: ${this.state.zwLegName}` : (legLabel ? `<br>Tischgestell: ${legLabel}` : '')}
    `;

    // Update live price
    this.updatePrice();

    // Keep URL in sync with current configuration
    this.updateURL();
  }

  updatePrice() {
    const product = ZW_PRODUCTS_DATA && ZW_PRODUCTS_DATA[this.state.shape];
    let total = 0;
    if (product) {
      const baseVariant = findBaseVariant(product, this.state.shape, this.state);
      total = baseVariant ? baseVariant.price : 0;
      const edgeTitles = EDGE_TITLE_MAP[this.state.edge] || [];
      const edgeAddon = product.addons.Kantenbearbeitung.find(a => edgeTitles.includes(a.title));
      if (edgeAddon) total += edgeAddon.price;
      let legAddon = null;
      if (this.state.zwLegName) {
        legAddon = product.addons.Tischgestell.find(a => a.title === this.state.zwLegName);
        if (legAddon) total += legAddon.price;
      }
      // Catalog-only legs (standalone purchases) — add their full catalog price too
      if (!legAddon && this.state.zwLegName) {
        const catLeg = CATALOG_ONLY_LEGS.find(c => c.title === this.state.zwLegName);
        if (catLeg) { legAddon = { variantId: catLeg.variantId, price: catLeg.price }; total += catLeg.price; }
      }
      // Preserve any already-picked Behandlung variant (price is €0 so it doesn't affect total)
      const prevBehandlung = this._selectedVariants?.behandlung;
      this._selectedVariants = {
        base: baseVariant?.id,
        edge: edgeAddon?.variantId,
        leg:  legAddon?.variantId,
        behandlung: prevBehandlung
      };
      total = total / 100; // ZW data is in cents; legacy formatPrice expects EUR units
    } else {
      const activeLeg = this.legObjects[this.activeLegIndex];
      total = calculateTotal({
        ...this.state,
        _activeLeg: activeLeg ? { displayName: activeLeg.displayName, isWood: activeLeg.isWood } : null
      });
    }
    const priceEl = document.getElementById('total-price');
    const priceMobileEl = document.getElementById('total-price-mobile');
    if (priceEl) {
      if (total > 0) {
        priceEl.textContent = formatPrice(total);
        priceEl.classList.remove('price-loading');
      } else {
        priceEl.textContent = 'Preis wird berechnet…';
        priceEl.classList.add('price-loading');
      }
    }
    if (priceMobileEl) {
      if (total > 0) {
        priceMobileEl.textContent = formatPrice(total);
        priceMobileEl.classList.remove('price-loading');
      } else {
        priceMobileEl.textContent = '€ ...';
        priceMobileEl.classList.add('price-loading');
      }
    }
  }

  showLoader() {
    if (!this._initialLoadDone) {
      // Full screen loader with progress for first load
      document.getElementById('loader').classList.remove('hidden');
      this.updateLoaderProgress(0);
    } else {
      // Small corner spinner for shape switches
      document.getElementById('mini-loader').classList.remove('hidden');
    }
  }
  hideLoader() {
    document.getElementById('loader').classList.add('hidden');
    document.getElementById('mini-loader').classList.add('hidden');
    this._initialLoadDone = true;
  }

  // ─── Resize & Animate ────────────────────────

  requestParentGapFix() {
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'zazawoods-configurator', action: 'remove-gap' }, '*');
    }
  }

  fixMobileHeight() {
    // Use visualViewport.height: inside a Shopify auto-height iframe this gives
    // the actual pixels visible on screen (not the full document/content height).
    // We set the configurator to exactly this height so it becomes the scroll
    // container — making position:sticky work for both viewer (top) and footer
    // (bottom). The iframe reports this height to Shopify, eliminating blank space.
    if (window.innerWidth <= 900) {
      const vp = window.visualViewport;
      const h = (vp && vp.height > 100) ? vp.height : window.innerHeight;
      if (h < 100) return; // guard: not measured yet
      document.documentElement.style.height = h + 'px';
      document.body.style.height = h + 'px';
      const cfg = document.querySelector('.configurator');
      if (cfg) cfg.style.height = h + 'px';
    } else {
      document.documentElement.style.height = '';
      document.body.style.height = '';
      const cfg = document.querySelector('.configurator');
      if (cfg) cfg.style.height = '';
    }
  }

  onResize() {
    this.fixMobileHeight();
    const viewer = document.getElementById('viewer');
    this.camera.aspect = viewer.clientWidth / viewer.clientHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(viewer.clientWidth, viewer.clientHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

// ─── Bootstrap ───────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  window._configurator = new TableConfigurator();
});
