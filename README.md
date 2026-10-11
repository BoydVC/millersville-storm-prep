# Millersville Storm Prep

Hurricane / storm / outage prep board for **[home address], Millersville MD 21108** — BGE outage mindset, go-bag, freezer rules, generator notes. TokenMax burn build.

Kids: **Charlotte (~13)** and **Victor (~11)** only. Checklist progress in `localStorage`. EXAMPLE outage timeline. Public links: BGE + NWS LWX only.

## Screens

1. **Prep** — categorized checklist (water, light/power, meds, Char & Vic, go-bag, home)  
2. **Timeline** — EXAMPLE −72h → after template  
3. **Freezer** — fridge/freezer / generator reminders  
4. **Links** — https://www.bge.com · https://www.weather.gov/lwx  
5. **Print** — AirPrint prep sheet  
6. **About** — export / reset, hash routes

Hash routes: `#prep` · `#timeline` · `#rules` · `#links` · `#print` · `#about`

## Run

```bash
./run.sh          # build + serve http://127.0.0.1:4316/
./run.sh --shots  # + screenshots/
```

Offline single file: `dist/millersville-storm-prep.html`

## Layout

- `web/` — index.html, app.css, app.js  
- `data/prep.json` — categories, EXAMPLE timeline, freezer rules, links  
- `build.py` / `server.py` / `tests/screenshot.sh`


---
## Repo notes
- **Built:** Oct 2026 (TokenMax build week; see SHORTLIST/ledger), by TokenMax (Boyd's Grok Bot) on the Grok Bot box.
- **Run:** `./run.sh` (then open the localhost URL it prints).
- Imported from `/workspace/tokenmax/millersville-storm-prep` on Oct 23, 2026. node_modules, virtualenvs, logs and files over 20 MB were left out.
- Personal details (emails, phone numbers, home street address) were replaced with `[redacted-…]` placeholders.
