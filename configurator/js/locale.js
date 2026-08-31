// ─── NL locale layer ─────────────────────────────────────────────────────────
// This repo is the Dutch clone (zazawoods.nl) of the German configurator.
// Strategy: the app logic keeps working with the GERMAN ("canonical") addon
// titles internally (3D model map, swatch file names, hide rules, …). The NL
// shop data (zw-products.json, scraped from the NL product pages) is
// normalised at load time: category names and addon titles are mapped to
// their canonical German counterparts, and the original Dutch title is kept
// as `label` for display. Anything shown to the customer goes through L().
//
// If a NEW Dutch addon appears in the shop, add it to TITLE_TO_CANONICAL
// (Dutch title → German title that has a 3D model in app.js). Without an
// entry the card still renders, but as a red "no model" card.

export const LOCALE = 'nl';
export const SHOP_URL = 'https://zazawoods.nl';

// Addon category names on the NL product page → canonical (German) keys.
export const CATEGORY_ALIASES = {
  'Onderstel':     'Tischgestell',
  'Randafwerking': 'Kantenbearbeitung',
  'Behandeling':   'Behandlung',
};

// Dutch addon title → canonical German title (as used everywhere in app.js).
export const TITLE_TO_CANONICAL = {
  // Onderstel (legs)
  'Matrix Tafelonderstel':                              'Spider Tischgestell (L)',
  'Matrix Tafelonderstel (M)':                          'Spider Tischgestell (M)',
  'Matrix Tafelonderstel (S)':                          'Spider Tischgestell (S)',
  'Konische Matrix Tafelonderstel':                     'Konisches Spidertischgestell',
  'Thorn Tafelonderstel (set)':                         'Thorn Tischgestelle (Satz)',
  'V Tafelonderstel':                                   'V Tischgestell',
  'RVS Matrix Tafelonderstel':                          'Spider Tischgestell Edelstahl',
  'RVS Matrix Tafelonderstel (S)':                      'Spider Tischgestell Edelstahl (S)',
  'U Tafelonderstel (set)':                             'U Tischgestell (Satz)',
  'U Tafelonderstel (M) (set)':                         'U Tischgestell (M) (Satz)',
  'U Tafelonderstel (smal) (set)':                      'U Tischgestell (schmal) (Satz)',
  'X Tafelonderstel (set)':                             'X Tischgestell (Satz)',
  'A Tafelonderstel (set)':                             'A Tischgestell (Satz)',
  'Trapezium Tafelonderstel (set)':                     'Trapezium Tischgestell (Satz)',
  'Aeris tafelonderstel van eikenhout':                 'Aeris Tischgestell aus Eichenholz',
  'Ovale houten zuil van stokhout, eiken':              'Ovale Holzsäule aus Stäbchenholz, Eiche',
  'Ovale tafelonderstellen van eiken-stokhout (set)':   'Ovale Tischgestelle aus Eiche-Stäbchenholz (Satz)',
  'Ovale tafelonderstellen van eikenhout (set)':        'Ovale Tischgestelle aus Eichenholz (Satz)', // excluded via LEG_TITLE_EXCLUDE (same as DE)
  'Butterfly tafelpoten van eikenhout (set) (A)':       'Butterfly Tischbeine aus Eichenholz (Satz) (A)',
  'Halfronde tafelpoten van eikenhout (set) (A)':       'Halbrunde Tischbeine aus Eichenholz (Satz) (A)',
  'Matrix Tafelonderstel (Rond)':                       'Spider Gestell (rund)',
  'Matrix Tafelonderstel (S) (Rond)':                   'Spider Gestell - Schmal (Rund)',
  'Ronde houten zuil van stokhout, eiken':              'Runde Holzsäule aus Stäbchenholz, Eiche',
  'Ronde houten zuilen van eikenhout (set) (A)':        'Runde Holzsäule aus Eichenholz (Satz) (A)',
  // Not yet sold as addon in the NL shop — mapped so they work as soon as the
  // NL products exist (titles are the ones the NL shop would use).
  'Konische houten zuil van stokhout, eiken':           'Konische Holzsäule aus Stäbchenholz, Eiche',
  'Drone tafelpoten (set)':                             'Drone Tischbeine (Satz)',
  'Aeris Tafelonderstel':                               'Aeris Tischgestell',
  'Butterfly Tafelonderstel (set)':                     'Butterfly Tischgestell (Satz)',
  'Vario Tafelonderstel':                               'Vario Tischgestell',
  'Dubbel V-Tafelonderstel':                            'Doppel V-Tischgestell',
  'Felix Tafelonderstel':                               'Felix Tischgestell',
  // Randafwerking (edges)
  'Boomstamkanten':                                     'Baumstammkanten',
  'Rechte Kanten':                                      'Gerade Kanten',
  'Schuine Kanten':                                     'Schweizer Kanten',
  // Behandeling (finishes) — only the ones whose name differs
  'Onzichtbare SKYLT-Lak':                              'Unsichtbarer Skylt-Lack',
};

// Canonical German title → Dutch display label (inverse of the map above,
// plus labels for internal display names that never come from the shop).
export const LABELS = Object.fromEntries(
  Object.entries(TITLE_TO_CANONICAL).map(([nl, de]) => [de, nl])
);
Object.assign(LABELS, {
  'Stahlwangen Tischgestell (Satz)':      'Stalen wangen tafelonderstel (set)',
  'Stahlwangen Tischgestell (S) (Satz)':  'Stalen wangen tafelonderstel (S) (set)',
  'Gerade Kante':                         'Rechte kant',
  'Schweizer Kante':                      'Schuine kant',
  'Baumstammkante':                       'Boomstamkant',
  'Holz':                                 'Hout',
  'Metall':                               'Metaal',
  'Eiche':                                'Eiken',
  'Keramik':                              'Keramiek',
});

// Dutch shop title (as sent by product-page buttons in the URL) → canonical.
export function canonicalTitle(title) {
  if (title == null) return title;
  const t = String(title).trim();
  if (TITLE_TO_CANONICAL[t]) return TITLE_TO_CANONICAL[t];
  const lc = t.toLowerCase();
  for (const [nl, de] of Object.entries(TITLE_TO_CANONICAL)) if (nl.toLowerCase() === lc) return de;
  return t;
}

export function L(title) {
  if (title == null) return title;
  return LABELS[title] || title;
}

// Runtime UI strings used from app.js (German source string → Dutch).
export const UI = {
  'Tischgestell':                         'Onderstel',
  'Kantenbearbeitung':                    'Randafwerking',
  'Behandlung':                           'Behandeling',
  'Bitte wähle: ':                        'Kies a.u.b.: ',
  'Diese Größe ist gerade nicht verfügbar — bitte andere Länge/Breite wählen.':
                                          'Deze maat is momenteel niet beschikbaar — kies een andere lengte/breedte.',
  'Konfiguration unvollständig — bitte erneut auswählen':
                                          'Configuratie onvolledig — selecteer opnieuw',
  'Lade Untergestelle…':                  'Onderstellen laden…',
  'Keine Untergestelle verfügbar':        'Geen onderstellen beschikbaar',
  'Lade Farben…':                         'Kleuren laden…',
  'Meine Zaza Woods Tischkonfiguration':  'Mijn Zaza Woods tafelconfiguratie',
  'Sieh dir meine Zaza Woods Esstisch-Konfiguration an:':
                                          'Bekijk mijn Zaza Woods eettafel-configuratie:',
  'Link kopiert':                         'Link gekopieerd',
  'Tisch':                                'Tafel',
  'Mein Zaza Woods Tisch':                'Mijn Zaza Woods tafel',
  'Screenshot gespeichert':               'Screenshot opgeslagen',
  'Konfiguration gespeichert':            'Configuratie opgeslagen',
  '+ Aktuelle Konfiguration speichern':   '+ Huidige configuratie opslaan',
  'AR wird geladen …':                    'AR wordt geladen …',
  'Ihren Tisch in AR ansehen':            'Uw tafel in AR bekijken',
  'Stellen Sie den konfigurierten Tisch direkt in Ihren Raum.':
                                          'Plaats de geconfigureerde tafel direct in uw ruimte.',
  'Weiter zum Konfigurator':              'Verder naar de configurator',
  'QR wird erstellt …':                   'QR wordt aangemaakt …',
  'Schließen':                            'Sluiten',
  'Preis wird berechnet…':                'Prijs wordt berekend…',
  'Wir bauen Ihren Tisch auf…':           'We bouwen uw tafel op…',
  'Gerade Kante':                         'Rechte kant',
  'Schweizer Kante':                      'Schuine kant',
  'Eiche':                                'Eiken',
  'Keramik':                              'Keramiek',
  'Holz':                                 'Hout',
  'Metall':                               'Metaal',
  'Noch keine gespeicherten Konfigurationen.': 'Nog geen opgeslagen configuraties.',
  'Gespeichert':                          'Opgeslagen',
  'Laden':                                'Laden',
  'Löschen':                              'Verwijderen',
};
export function T(s) { return UI[s] || s; }

// Normalise the NL product data (zw-products.json) to canonical keys/titles.
export function canonicalizeProducts(data) {
  if (!data) return data;
  for (const prod of Object.values(data)) {
    if (!prod || !prod.addons) continue;
    const out = {};
    for (const [cat, list] of Object.entries(prod.addons)) {
      const canonCat = CATEGORY_ALIASES[cat] || cat;
      out[canonCat] = (list || []).map(a => {
        const canon = TITLE_TO_CANONICAL[a.title] || a.title;
        return Object.assign({}, a, { title: canon, label: a.title });
      });
    }
    prod.addons = out;
  }
  return data;
}
