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
   - KEIN organic / halfrond im NL-Shop → Formen aus `config.js` entfernt
     (seit Punkt 9 wieder drin: eigene NL-Produkte).
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
   - Button-Snippet und Marquee-Ausblenden: zunächst nicht eingebaut, seit
     Punkt 10 (Freigabe Inhaber) über den Theme-Editor drin.
   - Praxis-Tipps Theme-Code-Editor (VS-Code-Web im Shopify-Admin): Datei
     anlegen per Rechtsklick auf Ordner → „New File…" (Pfad wie
     `templates/x.json` geht auch vom Root aus). Der Monaco-Editor sitzt in
     einem cross-origin-iframe → Inhalt nicht per JS injizieren, sondern mit
     ⌘A/⌘V aus der Zwischenablage einfügen (Tippen würde Auto-Close/Indent
     auslösen). Speichern schlägt mit „FileSaveError … 401" fehl, wenn die
     Admin-Session gerade abgelaufen ist → Editor-URL neu laden (Konto
     Nisar Derbaj wählen), der ungespeicherte Puffer bleibt erhalten, dann
     erneut speichern.

8. **Nachtrag (Build `f1c2d8e4`)** — aus dem DE-Repo portiert: Konische Holzsäule
   umbenannt in „Konische Holzsäule aus Eichenholz" (NL-Label „Konische houten zuil
   van eikenhout", neues Swatch + Render), Mobile-Fix gegen „WebGL context lost"
   (kein AR-Export mehr bei jeder Änderung, GPU-Puffer alter Formen freigeben,
   Context-Loss-Guard mit Reload, Shadow-Map 1024² auf Handys) — Details im
   DE-HANDOFF 2026-08-30, Abschnitt „Mobile".

9. **Vollausbau NL-Shop + Preiserhöhung (Build `a7d3e5f1`, 2026-08-31 abends)**
   - **10 Addon-Beine im NL-Shop angelegt** (CSV-Import, Typ „Onderstel", Tag
     `addon`, DE-Preise, DE-CDN-Bilder, NL-Beschreibungen): Drone Tafelonderstel
     (set) 185 €, Stalen wangen tafelonderstel (set) / (S) (set) 560 €, Aeris
     Tafelonderstel 195 €, Butterfly Tafelonderstel (set) 175 €, Vario
     Tafelonderstel 245 €, Dubbel V-Tafelonderstel 225 €, Felix Tafelonderstel
     220 €, Konische houten zuil van eikenhout 520 € (6 Renders vom Railway-DE),
     U Tafelonderstel (smal) (set) 0 €. Handles: wie Titel; die vier Metall-Beine
     Aeris/Vario/Dubbel V/Felix enden auf `-addon`, weil die bestehenden
     Einzelprodukte „… Tafelpoot" (375–575 €, unverändert) die kurzen Handles
     belegen. Variant-IDs stehen in `zw-products.json`.
   - **Addons-Widget:** im NL-Theme kommt die Addon-Liste NICHT aus einer
     Collection (wie DE), sondern aus dem Produkt-Metafeld **„addons list"**
     (Product-List) jedes Tafel-Produkts. Die 10 neuen Beine wurden bei Milano,
     Danilo, Sergio, Valerio, Organisch und Halfrond eingetragen (Admin →
     Produkt → Metafeld → „Select products"). Romano (rund) absichtlich nicht
     (dort nur die runden Beine). Andreas (Deens ovaal, nur `by-handle`) auch nicht.
   - **Zwei neue Tafel-Produkte** (Duplikat von Milano → per CSV-Overwrite mit
     den DE-Varianten/Preisen/Bildern gefüllt, Titel nur übersetzt):
     `organische-eettafel-pure-van-massief-eikenhout` (15732884177236, „Organische
     eettafel „Pure“ van massief eikenhout", 6 Größen) und
     `halfronde-eettafel-van-massief-eikenhout` (15732884767060, „Halfronde
     eettafel van massief eikenhout", Lengte × Breedte, 27 Varianten). Beide
     aktiv, Collection „tafels", Tags `binnentafel, mytag01, vierkant`, SEO-Titel/
     -Beschreibung gesetzt, Metafelder (Custom Tabs, addons list) von Milano.
     → `config.js`: Formen `organic` („Organisch") und `halfrond` („Halfrond")
     wieder drin, jetzt 7 Formen wie DE; `scrape_nl_products.py` SHAPES/HANDLES
     erweitert; Button-Snippet `docs/eettafel-configurator-button.liquid` kennt
     die zwei Handles + parst „Breedte" als Breite.
   - **Preise +200 € ab 320 cm** (Auftrag Inhaber, beide Shops): alle Tisch-
     Varianten mit Länge ≥ 320 cm (350/400 bei den 9-Größen-Tischen, 350/400 beim
     Halfrond, 320–400 bei den Romeo-Tischen mit Aansteekplaten). NL: 76
     Varianten in 12 Produkten (+ Halfrond schon mit +200 importiert), DE: 138
     Varianten in 20 Produkten. Gemacht mit dem Shopify-**Bulk-Editor**
     (`/bulk?resource_name=ProductVariant&edit=price&ids=…`) → Variant-IDs bleiben
     stabil, nur der Preis ändert sich. NICHT erhöht (Rückfrage an Inhaber):
     Tuintafel/Picknicktafel Douglas (NL), Gartentisch/Picknicktisch Douglas und
     Baumscheiben-Tische Sipo (DE). Verifiziert über `/products/<handle>.json`.
   - `locale.js`: NL-Titel der neuen Beine in `TITLE_TO_CANONICAL` (Drone jetzt
     „Drone Tafelonderstel (set)"), UI-Strings „Lengte (cm)" / „Bladdikte"
     (waren noch deutsch). `app.js`: Organisch 200 versteckt zusätzlich die
     Ovale Holzsäule (DE-Audit, 3,8 cm Überstand).
   - **Tests** (Harness `fulltest_nl.js` + neues `sizetest.js` = jede Größe jeder
     Form: gewählte Basis-Variante existiert im Shop, angezeigter Gesamtpreis =
     Shop-Preis + Addon-Preise): alle 7 Formen, alle Karten, alle Größen PASS,
     Konsole leer — lokal und auf Railway.

10. **Theme: Button + Marquee (Freigabe Inhaber, 2026-08-31)** — beides ohne
    Code-Dateien im Theme, nur über den Theme-Editor (= JSON-Templates):
    - **„Configurator openen"-Button** auf den Tafel-Produktseiten: Block
      „Custom Liquid" in der Sektion „Product information" des Templates
      „Default product" (`templates/product.json`), direkt unter „Buy buttons".
      Inhalt = `docs/eettafel-configurator-button.liquid`. Da die NL-Tafeln kein
      eigenes Produkt-Template haben (Suffix `tafels` existiert im Theme nicht),
      entscheidet eine **Handle-Liste** im Snippet (= Schlüssel von
      `zw-products-by-handle.json`, 11 Tafeln) — auf allen anderen Produkten
      rendert der Block nichts. Der Link trägt Form + Handle + gewählte Maße
      (auch „Breedte" beim Halfrond) + Behandeling/Randafwerking/Onderstel-Karte.
      Neue Tafel → Handle in der Liste ergänzen (Theme-Editor → Block → Code).
    - **Marquee + Footer ausblenden** auf `/pages/eettafel-configurator`: Sektion
      „Custom Liquid" (Padding 0/0) im Template `page.eettafel-configurator.json`,
      Inhalt = `docs/hide-marquee-on-configurator.liquid`. Countdown-Balken
      bleibt.
    - Theme-Editor-Stolperfallen: das Liquid-Textfeld sitzt in einem cross-origin
      iframe → Inhalt per Zwischenablage (⌘A/⌘V) einfügen; Block-Reihenfolge
      per Drag&Drop in der linken Liste; läuft die Admin-Session ab, kommt
      „Request unsuccessful: 401" bzw. „There was a problem with your request"
      → in einem zweiten Tab admin.shopify.com öffnen (Konto Nisar Derbaj), dann
      erneut Save — der Puffer bleibt erhalten, eine Reihenfolge-Änderung aber
      nicht (Reihenfolge prüfen, ggf. wiederholen).
    - Live geprüft: zazawoods.nl/products/halfronde-… zeigt den Button mit
      `?shape=halfrond&product=…&length=180&width=90`; Tafelpoten-Produkte ohne
      Button; `/pages/eettafel-configurator?shape=halfrond&length=350` → 7 Formen,
      Halfrond 350×100 = € 3.125, Marquee/Footer weg.

11. **Nachträge (Antworten Inhaber, 2026-08-31 abends)**
    - Douglasie-Tuintafel/Picknicktafel (NL+DE) und Sipo-Tische (DE): bleiben
      OHNE +200 € (Entscheidung Inhaber).
    - DE-Datenfehler „Abgerundete Rechteckform" 400 cm < 350 cm korrigiert
      (400 cm = 4020/4070/4120 € wie Cortado; Produkt nicht im Konfigurator).
    - Beide neuen Tafeln stehen (via Milano-Duplikat) in der Collection
      **Eikentafels** — das ist die Seite hinter dem Menü TAFELS → Eikentafels,
      dort sind sie sichtbar. Hinweis: die Collection `tafels`
      (Footer-Link „Tafels") ist komplett leer — für ALLE Produkte, war schon
      vorher so; Befüllen ist Sache des Inhabers.
    - **Einzelprodukt „Konische houten zuil van eikenhout"** (760 €, wie DE)
      angelegt: Handle `konische-houten-zuil-van-eikenhout-tafelpoot`
      (der kurze Handle gehört dem 520-€-Addon), Typ `Onderstel`, Tag
      `onderstel` → landet automatisch in der Collection `tafel-onderstellen`
      (Menü TAFELPOTEN), 6 Railway-Renders, aktiv.
      Produkt-ID 15734007923028, Variante 56989715693908.
    - Countdown-Balken auf der Konfigurator-Seite bleibt sichtbar
      (Entscheidung Inhaber).

## Offen / Fragen an den Inhaber

- ~~Fehlende NL-Addon-Produkte~~ → erledigt (Punkt 9).
- ~~Organische / halbrunde Tafel~~ → erledigt (Punkt 9). Beide Produkte tragen
  wie Milano das Theme-Template `tafels`, das im aktuellen Theme nicht mehr
  existiert (Admin zeigt „Template not available") — rendert mit dem
  Standard-Produkttemplate, genau wie Milano. Verlinkung im Menü/Collections
  ist Sache des Inhabers.
- ~~Gartentische / Sipo +200?~~ → Inhaber: nein, bleiben wie sie sind (Punkt 11).
- Die alten NL-Draft-Tische (Salvatore/Mauricio/Valentino/Lorenzo/Verona) sind
  weiterhin Entwürfe und unangetastet.
- **danish-oval**: Sergio als Hauptprodukt gewählt (älter); Andreas ist
  preisgleich. Bei Bedarf `shopifyHandle` in `config.js` tauschen.
- ~~Button auf den Tafel-Produktseiten + Marquee-Ausblenden~~ → erledigt (Punkt 10).
- Die Seite `/pages/eettafel-configurator` ist öffentlich, aber nirgends
  verlinkt (Menü/Produktseiten) — Verlinkung ist Sache des Inhabers.

## Nachtrag 2026-08-31 abends (Build c9b2e7d4)

1. **Konische houten zuil stand quer** — gleicher Fix wie DE:
   `isSaeuleExt = /^(Ovale|Konische) Holzsäule/i` in `app.js` (Titel sind
   intern deutsch). Kein Überstand auf allen Formen (Convex-Hull-Check).
2. **Karten-Reihenfolge der Tischgestelle = exakt wie im DE-Konfigurator**
   (Wunsch Inhaber): in `renderLegGrid` sortiert nach der eingefrorenen Liste
   `DE_CARD_ORDER` (kanonische DE-Titel; unbekannte Titel fallen ans Ende).
   Verifiziert auf Prod: Rechteck 28 Karten + Rund 4 Karten 1:1 wie DE.
3. **Boot-Watchdog + Prefetch-Timeout** wie DE (Hinweistext läuft durch `T()`,
   NL-Übersetzung in `locale.js`: „Trage verbinding — laad de pagina opnieuw.").
4. **Shop-Kollektionen umsortiert** (Wunsch Inhaber, „Reihenfolge wie
   Deutschland"): In `zaza-woods`-Admin die manuelle Sortierung gesetzt für
   - `eikentafels` (ID 406871081174): aktive Tafeln jetzt in DE-Reihenfolge
     der Collection `tische-fur-den-innenbereich`; NL-Produkte ohne
     DE-Pendant (Elena, Sienna) am Ende der aktiven, Drafts dahinter
     unverändert.
   - `tafel-onderstellen` „Metalen Tafelpoten" (ID 406871310550): alle 36
     aktiven Beine jetzt in DE-Reihenfolge der Collection `tischgestelle`,
     inkl. der neuen Holzbeine und der neuen „Konische houten zuil van
     eikenhout" am Schluss (wie DE).
   Verifiziert per Storefront-JSON: beide Kollektionen matchen die Zielliste
   1:1. Hinweis: Beide Kollektionen sind Tag-automatisiert („binnentafel" /
   „onderstel") mit Default sort „Manually" — NEUE Produkte mit diesen Tags
   landen irgendwo in der Liste und müssen ggf. manuell einsortiert werden.

Prod-Verifikation: fulltest_nl ALL PASS (alle 7 Formen, alle Karten),
sizetest 59 Checks PASS, Mobile-Emulation (Pixel-UA) alle 7 Formen PASS.

## Nachtrag 2026-09-03 (Build e5d7a3b9) — Schwarzer Bildschirm auf Pixel

Identischer Fix wie DE-Repo (siehe dessen HANDOFF, Nachtrag 2026-09-03):
Mobile GPU-Diät (kein MSAA, DPR ≤ 1,5, PCFShadowMap), Lite-Modus-Boot nach
WebGL-Context-Loss (`zw_gpu_lite`), Fehler-Overlay statt schwarzem Canvas
(Text hier niederländisch), AR-Prep auf Telefonen erst nach 15 s.
Recovery-Test lokal RECOVERY PASS; Prod-Mobile-Emulation alle 7 Formen ok.
