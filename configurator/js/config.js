// Zaza Woods Esstisch-Konfigurator — Configuration Data

const BASE_PATH = '..';

export const TABLE_SHAPES = [
  {
    id: 'rectangle',
    name: 'Rechteck',
    shopifyHandle: 'rechteckiger-esstisch-milano-aus-massiver-eichenholz-mit-baumstammkanten',
    glbFile: `${BASE_PATH}/glb files tables and legs/rectangle.glb`,
    icon: `<img src="Swatches/Vorm/Rechteck_bw.png?v=bec141f-v3" alt="Rechteck"/>`,
    meshPrefix: ['rectangle', 'Rectangle'],
    defaultLength: 240,
    defaultWidth: 100,
    lengths: [180, 200, 220, 240, 260, 280, 300, 350, 400],
    widths: [100],
    variants: [
      { size:'180cm x 100cm x 4cm', length:180, width:100, price:119900, id:36045911851174 },
      { size:'200cm x 100cm x 4cm', length:200, width:100, price:124900, id:36046025130022 },
      { size:'220cm x 100cm x 4cm', length:220, width:100, price:149900, id:36046025162790 },
      { size:'240cm x 100cm x 4cm', length:240, width:100, price:159900, id:36046025195558 },
      { size:'260cm x 100cm x 4cm', length:260, width:100, price:169900, id:36046025228326 },
      { size:'280cm x 100cm x 4cm', length:280, width:100, price:179900, id:36046025261094 },
      { size:'300cm x 100cm x 4cm', length:300, width:100, price:189900, id:36046025293862 },
      { size:'350cm x 100cm x 4cm', length:350, width:100, price:229900, id:36046025326630 },
      { size:'400cm x 100cm x 4cm', length:400, width:100, price:296900, id:36046025359398 }
    ]
  },
  {
    id: 'oval',
    name: 'Oval',
    shopifyHandle: 'ovaler-esstisch-danilo-aus-massiver-eichenholz-mit-schweizer-kante',
    glbFile: `${BASE_PATH}/glb files tables and legs/Oval.glb`,
    icon: `<img src="Swatches/Vorm/Oval_bw.png?v=bec141f-v3" alt="Oval"/>`,
    meshPrefix: ['Oval'],
    defaultLength: 240,
    defaultWidth: 120,
    fixedDimensions: [
      [180, 90], [200, 100], [220, 100], [240, 120],
      [260, 120], [280, 120], [300, 120], [350, 120], [400, 120]
    ]
  },
  {
    id: 'danish-oval',
    name: 'Dänisch-Oval',
    shopifyHandle: 'danisch-ovaler-esstisch-aus-massivem-eichenholz-andreas-mit-abgeschragter-kante',
    glbFile: `${BASE_PATH}/glb files tables and legs/DanishOval.glb`,
    icon: `<img src="Swatches/Vorm/DanishOval_bw.png?v=bec141f-v3" alt="Dänisch-Oval"/>`,
    meshPrefix: ['Danish_Oval', 'Danish'],
    defaultLength: 240,
    defaultWidth: 110,
    fixedDimensions: [
      [180, 100], [200, 100], [220, 100], [240, 110],
      [260, 120], [280, 120], [300, 120], [350, 120], [400, 120]
    ]
  },
  {
    id: 'round',
    name: 'Rund',
    shopifyHandle: 'runder-esstisch-romano-aus-massiver-eichenholz',
    glbFile: `${BASE_PATH}/glb files tables and legs/Round.glb`,
    icon: `<img src="Swatches/Vorm/Rund_bw.png?v=bec141f-v3" alt="Rund"/>`,
    meshPrefix: ['Round'],
    excludeLegs: ['Rondo'],
    defaultLength: 140,
    defaultWidth: 140,
    lockAspect: true,
    lengths: [100, 110, 120, 130, 140, 150, 160, 170, 180]
  },
  {
    id: 'organic',
    name: 'Organisch',
    shopifyHandle: 'esstisch-milano-aus-massivem-eichenholz-mit-baumstammkanten-copy',
    glbFile: `${BASE_PATH}/glb files tables and legs/Organic.glb`,
    icon: `<img src="Swatches/Vorm/Organisch_bw.png?v=bec141f-v3" alt="Organisch"/>`,
    meshPrefix: ['Organic'],
    defaultLength: 240,
    defaultWidth: 120,
    fixedDimensions: [
      [200, 100], [220, 110], [240, 120],
      [260, 130], [280, 140], [300, 140]
    ]
  },
  {
    id: 'bootsform',
    name: 'Bootsform',
    shopifyHandle: 'bootsform-esstisch-sergio-aus-massivem-eichenholz',
    glbFile: `${BASE_PATH}/glb files tables and legs/Bootsform.glb`,
    icon: `<img src="Swatches/Vorm/Bootsform_bw.png?v=bec141f-v3" alt="Bootsform"/>`,
    meshPrefix: ['bootsform_', 'Bootsform_'],
    defaultLength: 240,
    defaultWidth: 110,
    fixedDimensions: [
      [180, 100], [200, 100], [220, 100], [240, 110],
      [260, 120], [280, 120], [300, 120], [350, 140], [400, 140]
    ],
    variants: [
      { size:'180cm x 100cm x 4cm', length:180, width:100, price:124900, id:43827799130378 },
      { size:'200cm x 100cm x 4cm', length:200, width:100, price:134900, id:43827799163146 },
      { size:'220cm x 100cm x 4cm', length:220, width:100, price:144900, id:43827799195914 },
      { size:'240cm x 110cm x 4cm', length:240, width:110, price:164900, id:43827799228682 },
      { size:'260cm x 120cm x 4cm', length:260, width:120, price:174900, id:43827799261450 },
      { size:'280cm x 120cm x 4cm', length:280, width:120, price:179900, id:43827799294218 },
      { size:'300cm x 120cm x 4cm', length:300, width:120, price:191900, id:43827799326986 },
      { size:'350cm x 120cm x 4cm', length:350, width:120, price:271900, id:51945233678602 },
      { size:'400cm x 120cm x 4cm', length:400, width:120, price:336900, id:51945233711370 }
    ]
  },
  {
    id: 'halfrond',
    name: 'Halbrund',
    shopifyHandle: 'halbkreisform-esstisch-aus-massivem-eichenholz',
    glbFile: `${BASE_PATH}/glb files tables and legs/Halfrond.glb`,
    icon: `<img src="Swatches/Vorm/Halbrund_bw.png?v=bec141f-v3" alt="Halbrund"/>`,
    meshPrefix: ['Halfrond'],
    defaultLength: 240,
    defaultWidth: 100,
    lengths: [180, 200, 220, 240, 260, 280, 300, 350, 400],
    widths: [90, 100, 110]
  }
];

export const MATERIAL_TYPES = {
  oak: {
    id: 'oak',
    name: 'Eiche',
    thickness: 4,
    roughness: 0.72,
    metalness: 0.0,
    colors: [
      { id: 'natural',     name: 'Natural',     file: `${BASE_PATH}/Textures/Oak wood colors/1_OIL_PLUS_2C_OAK_NATURAL.jpg`,     swatch: '#c8a96e' },
      { id: 'cocoa',       name: 'Cocoa',       file: `${BASE_PATH}/Textures/Oak wood colors/2_OIL_PLUS_2C_OAK_COCOA.jpg`,       swatch: '#6b4c3b' },
      { id: 'deep-black',  name: 'Deep Black',  file: `${BASE_PATH}/Textures/Oak wood colors/Deep Black.jpg`,                   swatch: '#1a1a1a' },
      { id: 'mist',        name: 'Mist',        file: `${BASE_PATH}/Textures/Oak wood colors/3_OIL_PLUS_2C_OAK_MIST_5.jpg`,      swatch: '#b5a899' },
      { id: 'vanilla',     name: 'Vanilla',     file: `${BASE_PATH}/Textures/Oak wood colors/4_OIL_PLUS_2C_OAK_VANILLA.jpg`,     swatch: '#d4c5a9' },
      { id: 'pure',        name: 'Pure',        file: `${BASE_PATH}/Textures/Oak wood colors/5_OIL_PLUS_2C_OAK_PURE - Copy.jpg`, swatch: '#dcc99d' },
      { id: 'macchiato',   name: 'Macchiato',   file: `${BASE_PATH}/Textures/Oak wood colors/7_OIL_PLUS_2C_OAK_MACCHIATO.jpg`,   swatch: '#8b6f52' },
      { id: 'charcoal',    name: 'Charcoal',    file: `${BASE_PATH}/Textures/Oak wood colors/10_OIL_PLUS_2C_OAK_CHARCOAL.jpg`,   swatch: '#3a3632' },
      { id: 'shell-grey',  name: 'Shell Grey',  file: `${BASE_PATH}/Textures/Oak wood colors/8_OIL_PLUS_2C_OAK_SHELL_GREY.jpg`,  swatch: '#9e9589' },
      { id: 'walnut',      name: 'Walnut',      file: `${BASE_PATH}/Textures/Oak wood colors/9_OIL_PLUS_2C_OAK_WALNUT.jpg`,      swatch: '#5c4033' },
      { id: 'chocolate',   name: 'Chocolate',   file: `${BASE_PATH}/Textures/Oak wood colors/Chocolate.jpg`,                    swatch: '#6b5544' },
      { id: 'white5',      name: 'White 5%',    file: `${BASE_PATH}/Textures/Oak wood colors/White 5.jpg`,                      swatch: '#c8b48a' },
      { id: 'yakisugi',    name: 'Yakisugi',    file: `${BASE_PATH}/Textures/Oak wood colors/Yakisugi.jpg`,                     swatch: '#1e1e1e', roughness: 0.92, bumpScale: 0.015 }
    ]
  },
  ceramic: {
    id: 'ceramic',
    name: 'Keramik',
    thickness: 2,
    thicknessOptions: [1.2, 2],
    roughness: 0.35,
    metalness: 0.05,
    colors: [
      { id: 'calacatta-black',    name: 'Calacatta Black (Satin)',    file: `${BASE_PATH}/configurator/textures/ceramic/calacatta-black-lux.jpg`,       swatch: '#1a1a1a', finish: 'satin', thicknesses: [1.2, 2] },
      { id: 'crema-marfil',       name: 'Crema Marfil (Satin)',       file: `${BASE_PATH}/configurator/textures/ceramic/crema-marfil-satin.jpg`,        swatch: '#e8d5b8', finish: 'satin', thicknesses: [1.2] },
      { id: 'elegant-black',      name: 'Elegant Black (Satin)',      file: `${BASE_PATH}/configurator/textures/ceramic/elegant-black-satin.jpg`,       swatch: '#2a2a2a', finish: 'satin', thicknesses: [1.2] },
      { id: 'emperador',          name: 'Emperador (Lux)',            file: `${BASE_PATH}/configurator/textures/ceramic/emperador-lux.jpg`,             swatch: '#5c3d2e', finish: 'lux', thicknesses: [1.2] },
      { id: 'fior-di-bosco',      name: 'Fior di Bosco (Satin)',      file: `${BASE_PATH}/configurator/textures/ceramic/fior-di-bosco-satin.png`,       swatch: '#6a6a68', finish: 'satin', landscape: true, thicknesses: [1.2] },
      { id: 'golden-white-lux',   name: 'Golden White (Lux)',         file: `${BASE_PATH}/configurator/textures/ceramic/golden-white-lux.jpg`,          swatch: '#f0e8d8', finish: 'lux', thicknesses: [1.2] },
      { id: 'golden-white-satin', name: 'Golden White (Satin)',       file: `${BASE_PATH}/configurator/textures/ceramic/golden-white-satin.jpg`,        swatch: '#ede5d5', finish: 'satin', thicknesses: [1.2] },
      { id: 'jade',               name: 'Jade (Lux)',                 file: `${BASE_PATH}/configurator/textures/ceramic/jade-lux.png`,                  swatch: '#8a9a7a', finish: 'lux', landscape: true, thicknesses: [1.2] },
      { id: 'onice-avorio',       name: 'Onice Avorio (Lux)',         file: `${BASE_PATH}/configurator/textures/ceramic/onice-avorio-lux.jpg`,          swatch: '#f5edd5', finish: 'lux', thicknesses: [1.2] },
      { id: 'onice-beige',        name: 'Onice Beige (Lux)',          file: `${BASE_PATH}/configurator/textures/ceramic/onice-beige-lux.jpg`,           swatch: '#d4c4a0', finish: 'lux', thicknesses: [1.2] },
      { id: 'onice-giada',        name: 'Onice Giada (Lux)',          file: `${BASE_PATH}/configurator/textures/ceramic/onice-giada-lux.jpg`,           swatch: '#4a7a5a', finish: 'lux', thicknesses: [1.2] },
      { id: 'onice-nero',         name: 'Onice Nero (Lux)',           file: `${BASE_PATH}/configurator/textures/ceramic/onice-nero-lux.jpg`,            swatch: '#1e1e1e', finish: 'lux', thicknesses: [1.2] },
      { id: 'patagonia',          name: 'Patagonia (Lux)',            file: `${BASE_PATH}/configurator/textures/ceramic/patagonia-lux.jpg`,             swatch: '#8a7060', finish: 'lux', thicknesses: [1.2] },
      { id: 'pulpis',             name: 'Pulpis (Lux)',               file: `${BASE_PATH}/configurator/textures/ceramic/pulpis-lux.webp`,               swatch: '#4a3a2e', finish: 'lux', landscape: true, thicknesses: [1.2] },
      { id: 'silver-root',        name: 'Silver Root Marble (Satin)', file: `${BASE_PATH}/configurator/textures/ceramic/silver-root-marble-satin.jpg`,  swatch: '#c0b8a8', finish: 'satin', landscape: true, thicknesses: [1.2] },
      { id: 'sodalite-blue',      name: 'Sodalite Blue (Lux)',        file: `${BASE_PATH}/configurator/textures/ceramic/sodalite-blue-lux.jpg`,         swatch: '#2a3a6a', finish: 'lux', thicknesses: [1.2] },
      { id: 'statuario',          name: 'Statuario (Satin)',          file: `${BASE_PATH}/configurator/textures/ceramic/statuario-satin.jpg`,           swatch: '#f5f2ed', finish: 'satin', thicknesses: [1.2, 2] },
      { id: 'tafu',               name: 'Tafu (Satin)',               file: `${BASE_PATH}/configurator/textures/ceramic/tafu-satin.jpg`,                swatch: '#d8cfc0', finish: 'satin', thicknesses: [1.2] },
      { id: 'taj-mahal',          name: 'Taj Mahal (Lux)',            file: `${BASE_PATH}/configurator/textures/ceramic/taj-mahal-lux.jpg`,             swatch: '#c8a870', finish: 'lux', thicknesses: [1.2, 2] },
      { id: 'travertino',         name: 'Travertino (Satin)',         file: `${BASE_PATH}/configurator/textures/ceramic/travertino-satin.webp`,         swatch: '#d5c8b0', finish: 'satin', landscape: true, thicknesses: [1.2, 2] },
      { id: 'verde-aver',         name: 'Verde Aver (Lux)',           file: `${BASE_PATH}/configurator/textures/ceramic/verde-aver-lux.jpg`,            swatch: '#3a5a3a', finish: 'lux', thicknesses: [1.2] }
    ]
  }
};

export const EDGE_OPTIONS = [
  { id: 'standaard', name: 'Gerade Kante',     description: 'Klassische gerade Kante' },
  // Schweizer Kante — excluded on Bootsform per user (didn't render correctly)
  { id: 'facet',     name: 'Schweizer Kante',  description: 'Charakteristische Schweizer Kante', onlyMaterial: ['oak'], excludeShapes: ['bootsform'] },
  { id: 'boomstam',  name: 'Baumstammkante',   description: 'Natürliche Baumstammkante',         onlyMaterial: ['oak'] }
];

export const POWDER_COAT_COLORS = [
  { id: 'black',        name: 'Schwarz',          swatch: '#1a1a1a' },
  { id: 'anthracite',   name: 'Anthrazit',      swatch: '#3d3d3d' },
  { id: 'bronze',       name: 'Bronze',          swatch: '#6b5a3e' },
  { id: 'champagne',    name: 'Champagner',      swatch: '#c9b98a' },
  { id: 'white',        name: 'Weiß',            swatch: '#f5f5f0' }
];

export const DEFAULT_STATE = {
  shape: 'rectangle',
  materialType: 'oak',
  color: 'natural',
  length: 240,
  width: 100,
  height: 76,
  edge: 'standaard',
  powderCoat: 'black',
  variant: 'a'
};
