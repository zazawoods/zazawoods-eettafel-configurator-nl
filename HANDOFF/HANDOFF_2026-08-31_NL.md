# HANDOFF 2026-08-31 — NL-Klon angelegt (zazawoods.nl)

Liest du das als neuer (KI-)Agent: zuerst `README.md`, dann dieses File.
Das DE-Repo (`zazawoods-esstisch-konfigurator-de`) ist die Quelle der Engine;
dessen HANDOFF-Dateien erklären die Historie (Beine, Audits, Mobile-Perf).

## Was gemacht wurde

1. Repo aus dem DE-Stand (Build `2da8f153`) geklont, NL-Build `7f3e9c01`.
2. **Locale-Schicht** `configurator/js/locale.js` (siehe README „Datenmodell"):
   kanonische deutsche Titel intern, niederländische Labels außen.
   `app.js` wurde nur an den Anzeige-/Text-Stellen angefasst (`L()`/`T()`),
   an der Datenlade-Stelle (`canonicalizeProducts`), bei den URL-Parametern
   (`canonicalTitle`), Warenkorb-/Share-URL (`SHOP_URL`) und Zahlformat (`nl-NL`).
3. **Produktdaten** aus dem NL-Shop gescrapt (`tools/scrape_nl_products.py`):
   - rectangle → „Rechthoekige Eettafel Milano" (7678780604630)
   - oval → „Ovale Eettafel Danilo" (11805126361428, 10 Größen inkl. 160×90)
   - danish-oval → „Deens Ovaal Sergio" (7970159853782); „Andreas"
     (12083205046612, gleiche Größen/Preise) nur in `zw-products-by-handle.json`
   - round → „Ronde eettafel Romano" (7678780080342)
   - bootsform → „Eettafel Stadionvorm Valerio" (7970329395414, 7 Größen ×100)
   - KEIN organic / halfrond im NL-Shop → Formen aus `config.js` entfernt.
4. `config.js`, `index.html`, `server.js` (Titel, CSP `*.up.railway.app`),
   `docs/eettafel-configurator-*.liquid` (NL-Handles, Seite
   `/pages/eettafel-configurator`, Sektionen Behandeling/Randafwerking/Onderstel).
5. **Tests lokal** (Port 3211): alle Karten × 5 Formen → richtige NL-Variant-IDs
   und Preise, Konsole leer. Überstand-Audit: nur „Matrix Tafelonderstel (Rond)"
   ragt bei Ø100 0,9 cm über → versteckt (`HIDE_LEGS_BY_SHAPE_LENGTH.round[100]`).
   Hinweis: gilt geometrisch genauso im DE-Shop (dort noch nicht versteckt).

## Offen / Fragen an den Inhaber

- **Fehlende NL-Addon-Produkte** (im DE-Shop vorhanden, hier nicht): Drone
  (185 €), Stahlwangen ×2 (560 €), Aeris/Butterfly/Vario/Doppel V/Felix Metall
  (195/175/245/225/220 €), Konische Holzsäule (520 €), U (schmal). Sobald sie
  im NL-Shop existieren → `CATALOG_ONLY_LEGS` (app.js) mit NL-Variant-IDs füllen;
  die niederländischen Titel stehen schon in `locale.js` (`TITLE_TO_CANONICAL`).
- **Organische / halbrunde Tafel** gibt es im NL-Shop nicht → Formen fehlen.
- **danish-oval**: Sergio als Hauptprodukt gewählt (älter); Andreas ist
  preisgleich. Bei Bedarf `shopifyHandle` in `config.js` tauschen.
- **Theme-Einbau im NL-Shop** (Seite anlegen, Sektion + Button-Snippet aus
  `docs/` einbauen, `cfg_base` auf die Railway-Domain setzen) — siehe README.
