BRANDSTOFTRACKER PWA

Bestanden:
- index.html: de app
- styles.css: vormgeving
- app.js: opslag, berekeningen, back-up/import en CSV
- manifest.webmanifest: PWA-instellingen
- sw.js: offline cache

SNEL TESTEN OP WINDOWS
1. Pak de ZIP uit.
2. Open de map in Visual Studio Code.
3. Gebruik een lokale webserver zoals de VS Code-extensie Live Server.
4. Open het getoonde lokale adres in de browser.

OP IPHONE GEBRUIKEN
De PWA moet via HTTPS bereikbaar zijn. Publiceer de map bijvoorbeeld met GitHub Pages,
Netlify of Cloudflare Pages. Open daarna de site in Safari en kies Delen > Zet op beginscherm.

GEGEVENS
Tankbeurten worden lokaal in de browser opgeslagen met localStorage.
Gebruik regelmatig 'Back-up downloaden'. De JSON-back-up kan via 'Back-up importeren'
worden samengevoegd of volledig worden teruggezet. CSV is bedoeld voor Excel.
