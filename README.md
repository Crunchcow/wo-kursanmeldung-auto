# Kursanmeldung – Demo (GitHub Pages Frontend)

Dieses Repo liefert ein **statisches Demo-Frontend** für Kursanmeldungen. Es zeigt:
- Kursauswahl aus Testdaten
- Mitglied/Nicht-Mitglied, Voll/Halb → **Live-Preis**
- Teilnehmerdaten + **SEPA** (mit IBAN-Check)
- DSGVO/SEPA-Bestätigung
- Demo-Submit (ohne Speicherung)

Später kann es per **Power Automate (HTTP)** an SharePoint angebunden werden.

## Dateien
- `index.html` – Seite & Markup
- `styles.css` – schlichtes Dark-Theme
- `app.js` – Logik, inkl. **DEMO_MODE** & Endpunkt-Konfiguration

## Lokal testen
Einfach `index.html` öffnen oder mit einem simplen Webserver (z. B. VS Code „Live Server“).

## GitHub Pages aktivieren
1. Repository nach GitHub pushen.
2. **Settings → Pages**: Branch `main`, Folder `/root` wählen.
3. URL ausgeben lassen und teilen.

## Power Automate anschließen (später)
- In `app.js` konfigurieren:
  ```js
  const CONFIG = {
    DEMO_MODE: false,
    API_COURSES_URL: "https://<flow>/courses",
    API_SIGNUP_URL: "https://<flow>/signup",
  };
