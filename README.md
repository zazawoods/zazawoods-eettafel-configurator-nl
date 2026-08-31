# zazawoods-eettafel-configurator-nl  `[NL]`

3D-Eettafel-Configurator für den **niederländischen** Shop **zazawoods.nl**.
Klon des deutschen Konfigurators (`zazawoods/zazawoods-esstisch-konfigurator-de`,
Stand Build `2da8f153`, 2026-08-31) — gleiche 3D-Modelle, gleiche Engine,
eigene Produktdaten, eigene Sprache, eigenes Railway-Projekt.

**Wer hier arbeitet (Mensch oder KI-Agent): erst diese Datei + das neueste
`HANDOFF/HANDOFF_*.md` lesen.** Änderungen an der Engine (app.js) bitte im
DE-Repo machen und hierher portieren — dieses Repo unterscheidet sich nur in
den unten aufgeführten Punkten.

## Was ist anders als im DE-Repo

| Bereich | DE | NL (dieses Repo) |
|---|---|---|
| Shop | zazawoods.de | zazawoods.nl (`SHOP_URL` in `js/locale.js`) |
| Sprache UI | Deutsch (hart im Code) | Niederländisch über `js/locale.js` (`T()` für UI-Strings, `L()` für Produkttitel) + übersetztes `index.html`/`config.js` |
| Produktdaten | `js/zw-products.json` aus dem DE-Shop | `js/zw-products.json` aus dem NL-Shop (Titel niederländisch, siehe „Datenmodell") |
| Formen | 7 (inkl. Organisch, Halbrund) | **5**: Rechthoek, Ovaal, Deens ovaal, Rond, Stadionvorm — der NL-Shop hat (noch) keine organische / halbrunde Tafel. Die GLBs liegen trotzdem im Repo; Form wieder aktivieren = Eintrag in `TABLE_SHAPES` + Produkt in `zw-products.json`. |
| Größen | DE-Varianten | NL-Varianten: Ovaal hat zusätzlich 160×90, Deens ovaal 240×110, Stadionvorm nur 7 Größen (alle 100 breit) |
| Addon-Beine ohne Shop-Produkt (`CATALOG_ONLY_LEGS`) | 9 Einträge | **leer** — Drone, Stahlwangen, Aeris/Butterfly/Vario/Doppel V/Felix (Metall), Konische Holzsäule gibt es im NL-Shop noch nicht als Addon |
| Preise Holzbeine | 540 € (Aeris, Ovale Säule) | 440 € für alle Holzbeine (so im NL-Shop) |
| Yakisugi | eigenes Addon 220 € + Produktwechsel | NL-Finish „Black" (0 €), kein Produktwechsel (`LOCALE === 'nl'` schaltet den Alias ab) |

## Datenmodell — der wichtigste Trick

Die gesamte Engine (3D-Modell-Zuordnung `ZW_LEG_MODEL_MAP`, Swatch-Dateinamen,
`HIDE_LEGS_BY_SHAPE_LENGTH`, `LEG_TITLE_EXCLUDE`, Rund-Whitelist …) arbeitet
weiterhin mit den **deutschen Addon-Titeln** („kanonisch"). `js/locale.js`
übersetzt beim Laden von `zw-products.json`:

- Kategorie `Onderstel` → `Tischgestell`, `Randafwerking` → `Kantenbearbeitung`,
  `Behandeling` → `Behandlung` (`CATEGORY_ALIASES`)
- jeden Addon-Titel über `TITLE_TO_CANONICAL` (z. B. „Matrix Tafelonderstel"
  → „Spider Tischgestell (L)"); der niederländische Originaltitel bleibt als
  `label` erhalten und wird über `L(title)` angezeigt.
- URL-Parameter von den Produktseiten-Buttons (`leg=`, `edge=`, `behandlung=`,
  niederländische Titel) werden mit `canonicalTitle()` ebenfalls umgesetzt.

**Neues Bein im NL-Shop?** Titel in `TITLE_TO_CANONICAL` eintragen (→ deutscher
Titel, der in `ZW_LEG_MODEL_MAP`/`EXTERNAL_LEG_FILES` ein Modell hat) und
`zw-products.json` neu erzeugen. Ohne Eintrag erscheint die Karte rot („kein Modell").

**`zw-products.json` neu erzeugen:** Skript `tools/scrape_nl_products.py`
(liest `zazawoods.nl/products.json` + die Addon-Widgets der 5 Tafel-Produktseiten).
Danach `BUILD_VERSION` bumpen.

## Deployment (Produktion)

- **GitHub:** `zazawoods/zazawoods-eettafel-configurator-nl`, Branch `main`.
- **Railway:** Projekt `zazawoods-configurator-nl` (Service gleichen Namens),
  Auto-Deploy bei Push auf `main`. Prod-URL: siehe `HANDOFF` (Railway-Domain),
  eingebettet über `docs/eettafel-configurator-embed.liquid` im NL-Theme.
- `BUILD_VERSION` steht in **7 Stellen** (eine mehr als DE — der Import von
  `locale.js` in `app.js`): `js/config.js:7`, `index.html` (styles.css?v=,
  modulepreload config.js?v=, app.js?v=), `app.js` (import config.js?v=,
  import locale.js?v=, import shopify.js?v=). Global ersetzen.

## Architektur, Testen, Mobile-Performance

Identisch mit dem DE-Repo — siehe dessen README. Kurz: statisches Frontend
(`configurator/`), Express (`server.js`), three.js 0.162 vom CDN, Draco lokal,
Beine als Meshes in den Form-GLBs + externe GLBs in `external-legs/`.
Test-Rezept: alle `.leg-option`-Karten klicken, prüfen dass
`L(state.zwLegName)` = Kartentitel, `_selectedVariants.leg` = NL-Variant-ID,
Konsole leer; Überstand-Audit Vertices-gegen-Platten-Hülle (Session-Skripte
`fulltest_nl.js` / `overhang_audit.js`, siehe HANDOFF).

## Shopify-Konventionen (NL)

- Store: zazawoods.nl (Shopify-Admin über accounts.shopify.com → Konto
  **Nisar Derbaj, info@zazawoods.nl**, nie info@tablekings.de).
- Addon-Produkte im NL-Shop: Typ `Onderstel` / `Randafwerking` / `Behandeling`,
  werden über das Addon-Widget der Tafel-Produktseite ausgespielt (Collections
  wie im DE-Shop). Neue Addon-Beine: Duplikat eines bestehenden Onderstel-Addons.
