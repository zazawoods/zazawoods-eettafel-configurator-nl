// ─── Shopify Price Integration ────────────────────────
// Fetches live prices from Shopify products and calculates totals

const SHOPIFY_STORE = 'https://1d4515-15.myshopify.com';

// Product handles for fetching live data
const PRODUCT_HANDLES = {
  // Vorm (shape) products
  rectangle:  'configurator-rechthoek',
  oval:       'configurator-ovaal',
  'danish-oval': 'configurator-deens-ovaal',
  round:      'configurator-rond',
  kiezel:     'configurator-kiezel',
  organic:    'configurator-organisch',
  halfrond:   'vorm-halfrond',
  boogvorm:   'vorm-boogvormig',
  verbaan:    'vorm-luna',
  // Other products
  materiaal:     'configurator-materiaal',
  kleur:         'configurator-kleur',
  randafwerking: 'configurator-randafwerking',
  onderstel:     'configurator-onderstel',
  poedercoat:    'configurator-poedercoat',
  hoekradius:    'hoekradius',
  variant:       'variant'
};

// ─── Variant ID mappings (fallback if API is slow) ───

const SHAPE_VARIANT_MAP = {
  rectangle: {
    '180x90': 53624392810829, '180x100': 53624392843597, '180x110': 53624392876365,
    '200x90': 53624392909133, '200x100': 53624392941901, '200x110': 53624392974669,
    '220x90': 53624393007437, '220x100': 53624393040205, '220x110': 53624393072973,
    '240x90': 53624393105741, '240x100': 53624393138509, '240x110': 53624393171277,
    '260x90': 53624393204045, '260x100': 53624393236813, '260x110': 53624393269581,
    '280x90': 53624393302349, '280x100': 53624393335117, '280x110': 53624393367885,
    '300x90': 53624393400653, '300x100': 53624393433421, '300x110': 53624393466189,
    '350x90': 53624393498957, '350x100': 53624393531725, '350x110': 53624393564493,
    '400x90': 53624393597261, '400x100': 53624393630029, '400x110': 53624393662797,
  },
  oval: {
    '160x90': 53624393695565, '180x90': 53624393728333, '200x100': 53624393761101,
    '220x110': 53624393793869, '240x120': 53624393826637, '260x120': 53624393859405,
    '280x120': 53624393892173, '300x120': 53624393924941,
  },
  'danish-oval': {
    '180x100': 53624393957709, '200x100': 53624393990477, '220x100': 53624394023245,
    '240x110': 53624394056013, '260x120': 53624394088781, '280x120': 53624394121549,
    '300x120': 53624394154317, '350x140': 53624394187085,
  },
  round: {
    '100': 53624394285389, '110': 53624394318157, '120': 53624394350925,
    '130': 53624394383693, '140': 53624394416461, '150': 53624394449229,
    '160': 53624394481997, '170': 53624394514765, '180': 53624394547533,
  },
  kiezel: {
    '180x100': 53624394613069, '200x100': 53624394645837, '220x100': 53624394678605,
    '240x110': 53624394711373, '260x120': 53624394744141, '280x120': 53624394776909,
    '300x120': 53624394809677,
  },
  organic: {
    '200x100': 53624394842445, '220x110': 53624394875213, '240x120': 53624394907981,
    '260x130': 53624394940749, '280x140': 53624394973517, '300x140': 53624395006285,
  },
  halfrond: {
    '180x90': 53624755388749, '180x100': 53624755421517, '180x110': 53624755454285,
    '200x90': 53624755487053, '200x100': 53624755519821, '200x110': 53624755552589,
    '220x90': 53624755585357, '220x100': 53624755618125, '220x110': 53624755650893,
    '240x90': 53624755683661, '240x100': 53624755716429, '240x110': 53624755749197,
    '260x90': 53624755781965, '260x100': 53624755814733, '260x110': 53624755847501,
    '280x90': 53624755880269, '280x100': 53624755913037, '280x110': 53624755945805,
    '300x90': 53624755978573, '300x100': 53624756011341, '300x110': 53624756044109,
    '350x90': 53624756076877, '350x100': 53624756109645, '350x110': 53624756142413,
    '400x90': 53624756175181, '400x100': 53624756207949, '400x110': 53624756240717,
  },
  boogvorm: {
    '180x90': 53624752865613, '180x100': 53624752898381, '180x110': 53624752931149,
    '200x90': 53624752963917, '200x100': 53624752996685, '200x110': 53624753029453,
    '220x90': 53624753062221, '220x100': 53624753094989, '220x110': 53624753127757,
    '240x90': 53624753160525, '240x100': 53624753193293, '240x110': 53624753226061,
    '260x90': 53624753258829, '260x100': 53624753291597, '260x110': 53624753324365,
    '280x90': 53624753357133, '280x100': 53624753389901, '280x110': 53624753422669,
    '300x90': 53624753455437, '300x100': 53624753488205, '300x110': 53624753520973,
    '350x90': 53624753553741, '350x100': 53624753586509, '350x110': 53624753619277,
    '400x90': 53624753652045, '400x100': 53624753684813, '400x110': 53624753717581,
  },
  verbaan: {
    '180x90': 53624749949261, '180x100': 53624749982029, '180x110': 53624750014797,
    '200x90': 53624750047565, '200x100': 53624750080333, '200x110': 53624750113101,
    '220x90': 53624750145869, '220x100': 53624750178637, '220x110': 53624750211405,
    '240x90': 53624750244173, '240x100': 53624750276941, '240x110': 53624750309709,
    '260x90': 53624750342477, '260x100': 53624750375245, '260x110': 53624750408013,
    '280x90': 53624750440781, '280x100': 53624750473549, '280x110': 53624750506317,
    '300x90': 53624750539085, '300x100': 53624750571853, '300x110': 53624750604621,
    '350x90': 53624750637389, '350x100': 53624750670157, '350x110': 53624750702925,
    '400x90': 53624750735693, '400x100': 53624750768461, '400x110': 53624750801229,
  },
};

const MATERIAAL_VARIANTS = {
  'oak':     53624397726029,  // Eikenhout - €0
  'ceramic': 53624397758797,  // Keramiek - €260
};

// Map configurator color IDs to Shopify Kleur variant IDs
const KLEUR_VARIANTS = {
  // Oak
  'natural':     53624397824333,
  'cocoa':       53624397857101,
  'mist':        53624397889869,
  'vanilla':     53624397922637,
  'pure':        53624397955405,
  'golden-hour': 53624397988173,
  'macchiato':   53624398020941,
  'shell-grey':  53624398053709,
  'walnut':      53624398086477,
  'charcoal':    53624398119245,
  'white5':      53624953045325,
  'deep-black':  53624953078093,
  'chocolate':   53624953110861,
  'yakisugi':    53624953143629,
  // Ceramic
  'calacatta-black':    53624398152013,
  'crema-marfil':       53624398184781,
  'elegant-black':      53624398217549,
  'emperador':          53624398250317,
  'fior-di-bosco':      53624398283085,
  'golden-white-lux':   53624398315853,
  'golden-white-satin': 53624398315853, // Same Shopify variant as lux
  'jade':               53624398348621,
  'onice-avorio':       53624398381389,
  'onice-beige':        53624398414157,
  'onice-giada':        53624398446925,
  'onice-nero':         53624398479693,
  'patagonia':          53624398512461,
  'pulpis':             53624398545229,
  'silver-root':        53624398577997,
  'sodalite-blue':      53624398610765,
  'statuario':          53624398643533,
  'tafu':               53624398676301,
  'taj-mahal':          53624398709069,
  'travertino':         53624398741837,
  'verde-aver':         53624398774605,
};

// Map configurator edge IDs to Shopify Randafwerking variant IDs
const EDGE_VARIANTS = {
  'standaard':  53624398807373,
  'facet':      53624398840141,
  'angle20':    53624398872909,
  'angle20inv': 53624398905677,
  'facetbol':   53624398938445,
  'boomstam':   53624398971213,
  'sharknose':  53624399003981,
};

// Map configurator leg display names to Shopify Onderstel variant IDs
const ONDERSTEL_VARIANTS = {
  'Konische Spider_wood':  53624445272397,
  'Pilares_wood':          53624445305165,
  'Hannah_wood':           53624445337933,
  'Golvend Kolom_wood':    53624445370701,
  'Lara_wood':             53624445403469,
  'Diablo_wood':           53624445436237,
  'Ferdo_wood':            53624445469005,
  'Schuin_wood':           53624445501773,
  'Rondo_wood':            53624445534541,
  'Bernard_wood':          53624445567309,
  'Demi Lune_wood':        53624445600077,
  'Blok_wood':             53624445632845,
  'Hapa_wood':             53624445665613,
  'Base_wood':             53624445698381,
  'Golvend Duo_wood':      53624445731149,
  'Moda_wood':             53624445763917,
  'Vera_metal':            53624445796685,
  'A-vorm_metal':          53624445829453,
  'Butterfly_metal':       53624445862221,
  'Diago_metal':           53624445894989,
  'V-vorm_metal':          53624445927757,
  'Walrus_metal':          53624445960525,
  'Ekso_metal':            53624445993293,
  'X-vorm_metal':          53624446026061,
  'Hairpin_metal':         53624446058829,
  'Matrix_metal':          53624446091597,
  'Konische Spider_metal': 53624446124365,
  'Stative_metal':         53624446157133,
  'Vedo_metal':            53624446189901,
  'Thore_metal':           53624446222669,
  'Criss Cross_metal':     53624446255437,
  'Lara_metal':            53624446288205,
  'Pluto_metal':           53624446320973,
  'Ovaal Kolom_metal':     53624446353741,
  'Tapse Spin_metal':      53624446386509,
  'Pedro_metal':           53624446419277,
  'VN_metal':              53624446452045,
  'Cona_metal':            53624446484813,
  'Positivo_metal':        53624446517581,
  'Ronde Kolom_metal':     53624446550349,
  'Twist_metal':           53624615403853,
  'Vierpoot_metal':        53624615436621,
  'Golvend Rond_wood':     53625041846605,
};

const POEDERCOAT_VARIANTS = {
  'black':      53624400413005,  // Zwart - €0
  'anthracite': 53624400478541,  // Antraciet - €100
  'bronze':     53624400511309,  // Brons - €100
  'champagne':  53624400544077,  // Champagne - €100
  'white':      53624400445773,  // Wit - €100
};

const HOEKRADIUS_VARIANTS = {
  0:   53625037717837,   // 0mm
  15:  53625037750605,   // 15mm
  35:  53625037783373,   // 35mm
  100: 53625037816141,   // 100mm
  210: 53625037848909,   // 210mm
  300: 53625037881677,   // 300mm
  400: 53625037914445,   // 400mm
  500: 53625037947213,   // 500mm
};

const VARIANT_VARIANTS = {
  'a': 53625039389005,  // Variant A - €0
  'b': 53625039421773,  // Variant B - €0
};

// ─── Price Cache (populated from API or hardcoded fallback) ───

let priceCache = {};
let cacheLoaded = false;

// Hardcoded fallback prices (from Shopify data)
const FALLBACK_PRICES = {};

// Build fallback from variant maps
function buildFallbackPrices() {
  // These will be populated by fetchAllPrices from the API
  // If API fails, we use empty cache (prices show as "—")
}

// ─── API Fetching ───

async function fetchProductByHandle(handle) {
  try {
    const resp = await fetch(`${SHOPIFY_STORE}/products/${handle}.json`);
    if (!resp.ok) return null;
    const data = await resp.json();
    return data.product;
  } catch (e) {
    console.warn(`Failed to fetch ${handle}:`, e);
    return null;
  }
}

export async function fetchAllPrices() {
  if (cacheLoaded) return priceCache;

  const handles = Object.values(PRODUCT_HANDLES);
  const results = await Promise.allSettled(
    handles.map(h => fetchProductByHandle(h))
  );

  results.forEach((result) => {
    if (result.status === 'fulfilled' && result.value) {
      const product = result.value;
      product.variants.forEach(v => {
        priceCache[v.id] = parseFloat(v.price);
      });
    }
  });

  cacheLoaded = true;
  console.log(`Shopify price cache loaded: ${Object.keys(priceCache).length} variants`);
  return priceCache;
}

// ─── Price Lookup ───

function getPrice(variantId) {
  if (!variantId) return 0;
  return priceCache[variantId] ?? 0;
}

export function getShapeVariantKey(state) {
  if (state.shape === 'round') {
    return `${state.length}`;
  }
  return `${state.length}x${state.width}`;
}

export function calculateTotal(state) {
  const items = getLineItems(state);
  return items.reduce((sum, item) => sum + item.price, 0);
}

export function getLineItems(state) {
  const items = [];

  // Order: Vorm → Hoekradius → Variant → Materiaal → Kleur → Randafwerking → Onderstel → Poedercoat

  // 1. Vorm + Afmeting
  const shapeMap = SHAPE_VARIANT_MAP[state.shape];
  const sizeKey = getShapeVariantKey(state);
  const shapeVariantId = shapeMap?.[sizeKey];
  items.push({
    label: 'Vorm + Afmeting',
    variantId: shapeVariantId,
    price: getPrice(shapeVariantId)
  });

  // 2. Hoekradius (only for Rechthoek)
  if (state.shape === 'rectangle') {
    const radius = state.radius || 0;
    const radiusVariantId = HOEKRADIUS_VARIANTS[radius];
    if (radiusVariantId) {
      items.push({
        label: 'Hoekradius',
        variantId: radiusVariantId,
        price: getPrice(radiusVariantId)
      });
    }
  }

  // 3. Variant (for kiezel, organic, luna)
  if (state.variant && ['kiezel', 'organic', 'verbaan'].includes(state.shape)) {
    const variantVariantId = VARIANT_VARIANTS[state.variant];
    if (variantVariantId) {
      items.push({
        label: 'Variant',
        variantId: variantVariantId,
        price: getPrice(variantVariantId)
      });
    }
  }

  // 4. Materiaal
  const matVariantId = MATERIAAL_VARIANTS[state.materialType];
  items.push({
    label: 'Materiaal',
    variantId: matVariantId,
    price: getPrice(matVariantId)
  });

  // 5. Kleur
  const kleurVariantId = KLEUR_VARIANTS[state.color];
  items.push({
    label: 'Kleur',
    variantId: kleurVariantId,
    price: getPrice(kleurVariantId)
  });

  // 6. Randafwerking
  const edgeVariantId = EDGE_VARIANTS[state.edge];
  items.push({
    label: 'Randafwerking',
    variantId: edgeVariantId,
    price: getPrice(edgeVariantId)
  });

  // 7. Onderstel
  const legObj = state._activeLeg; // set by app.js
  if (legObj) {
    const suffix = legObj.isWood ? '_wood' : '_metal';
    const onderstelKey = `${legObj.displayName}${suffix}`;
    const onderstelVariantId = ONDERSTEL_VARIANTS[onderstelKey];
    items.push({
      label: 'Onderstel',
      variantId: onderstelVariantId,
      price: getPrice(onderstelVariantId)
    });

    // 8. Poedercoat (only for metal legs)
    if (!legObj.isWood) {
      const pcVariantId = POEDERCOAT_VARIANTS[state.powderCoat];
      items.push({
        label: 'Poedercoat',
        variantId: pcVariantId,
        price: getPrice(pcVariantId)
      });
    }
  }

  return items;
}

export function formatPrice(amount) {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// ─── Shopify Cart Integration ───

export async function addToCart(state) {
  const items = getLineItems(state).filter(i => i.variantId);

  // Build Shopify checkout URL with all variant IDs (reversed so first item shows at top in cart)
  // Format: /cart/variantId:quantity,variantId:quantity,...
  const cartPath = [...items].reverse().map(item => `${item.variantId}:1`).join(',');
  const checkoutUrl = `${SHOPIFY_STORE}/cart/${cartPath}`;

  // Redirect to checkout
  window.open(checkoutUrl, '_blank');
}
