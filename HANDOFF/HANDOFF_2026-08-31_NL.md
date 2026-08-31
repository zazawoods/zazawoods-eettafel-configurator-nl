# HANDOFF 2026-08-31 — NL-Klon angelegt (zazawoods.nl)

Liest du das als neuer (KI-)Agent: zuerst `README.md`, dann dieses File.
Das DE-Repo (`zazawoods-esstisch-konfigurator-de`) ist die Quelle der Engine;
dessen HANDOFF-Dateien erklären die Historie (Beine, Audits, Mobile-Perf).

## Was gemacht wurde

1. Repo aus dem DE-Stand (Build `2da8f153`) geklont, NL-Build `8a4c2d17`.
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
   und Preise, Konsole leer. Überstand-Audit (Vertices vs. Platten-Hülle, alle
   Karten × alle Größen): „Matrix Tafelonderstel (Rond)" ragt bei Ø100 0,9 cm
   über → versteckt (`HIDE_LEGS_BY_SHAPE_LENGTH.round[100]`; gilt geometrisch
   genauso im DE-Shop, dort noch nicht versteckt). Ovaal 160×90 (nur NL):
   Thorn/U(M)/X/Ovale zuil/Ovale set ragen 1,9–4,3 cm über → `oval[160]`
   versteckt die komplette 180er-Liste + die Ovale zuil. Alles andere sauber.

6. **Deploy:** GitHub `zazawoods/zazawoods-eettafel-configurator-nl` (Import des
   DE-Repos + 6 Commits), Railway-Projekt `zazawoods-configurator-nl`
   (ID 8353bdc3-f7ee-4aa5-b851-f52eea561f4c), Service
   `zazawoods-eettafel-configurator-nl`, Variable `PORT=3000` (ohne sie 502),
   Domain **https://zazawoods-eettafel-configurator-nl-production.up.railway.app**.
   Build `8a4c2d17` live.

7. **Theme-Einbau im NL-Shop (Store `zaza-woods`, Theme „codixel-update",
   ID 186248593748)** — erledigt, ohne Änderung an bestehenden Theme-Dateien:
   - `sections/eettafel-configurator-embed.liquid` = Inhalt von
     `docs/eettafel-configurator-embed.liquid` (Schema-Labels niederländisch).
   - `templates/page.eettafel-configurator.json` = nur diese Sektion
     (`{"sections":{"main":{"type":"eettafel-configurator-embed","settings":{}}},"order":["main"]}`).
   - Seite „Eettafel configurator" (ID 712847130964, Handle
     `eettafel-configurator`, Template `page.eettafel-configurator`, sichtbar)
     → **https://zazawoods.nl/pages/eettafel-configurator** lädt das Railway-
     iframe, URL-Parameter (`?shape=oval&length=240`) werden durchgereicht.
   - NICHT eingebaut (Entscheidung Inhaber, weil es Produkt-Template/`theme.liquid`
     verändert): Button-Snippet auf den Tafel-Produktseiten
     (`docs/eettafel-configurator-button.liquid`) und Marquee-Ausblenden
     (`docs/hide-marquee-on-configurator.liquid`).
   - Praxis-Tipps Theme-Code-Editor (VS-Code-Web im Shopify-Admin): Datei
     anlegen per Rechtsklick auf Ordner → „New File…" (Pfad wie
     `templates/x.json` geht auch vom Root aus). Der Monaco-Editor sitzt in
     einem cross-origin-iframe → Inhalt nicht per JS injizieren, sondern mit
     ⌘A/⌘V aus der Zwischenablage einfügen (Tippen würde Auto-Close/Indent
     auslösen). Speichern schlägt mit „FileSaveError … 401" fehl, wenn die
     Admin-Session gerade abgelaufen ist → Editor-URL neu laden (Konto
     Nisar Derbaj wählen), der ungespeicherte Puffer bleibt erhalten, dann
     erneut speichern.

## Offen / Fragen an den Inhaber

- **Fehlende NL-Addon-Produkte** (im DE-Shop vorhanden, hier nicht): Drone
  (185 €), Stahlwangen ×2 (560 €), Aeris/Butterfly/Vario/Doppel V/Felix Metall
  (195/175/245/225/220 €), Konische Holzsäule (520 €), U (schmal). Sobald sie
  im NL-Shop existieren → `CATALOG_ONLY_LEGS` (app.js) mit NL-Variant-IDs füllen;
  die niederländischen Titel stehen schon in `locale.js` (`TITLE_TO_CANONICAL`).
- **Organische / halbrunde Tafel** gibt es im NL-Shop nicht → Formen fehlen.
- **danish-oval**: Sergio als Hauptprodukt gewählt (älter); Andreas ist
  preisgleich. Bei Bedarf `shopifyHandle` in `config.js` tauschen.
- **Button auf den Tafel-Produktseiten** + Marquee-Ausblenden (siehe Punkt 7)
  — Snippets liegen in `docs/`, Einbau erst nach Freigabe.
- Die Seite `/pages/eettafel-configurator` ist öffentlich, aber nirgends
  verlinkt (Menü/Produktseiten) — Verlinkung ist Sache des Inhabers.
