# Hannerup Kirke — statisk klon

Denne repository er en arbejds- og demonstrationskopi af den offentlige hjemmeside
`https://www.hannerup-kirke.dk/`.

Formålet er at kunne afprøve design- og indholdsændringer uden at ændre den levende
TYPO3-side. Den publicerede udgave bygges udelukkende fra mappen `dist/`.

Øjebliksbilledet blev taget 5. september 2026 og omfatter 91 HTML-sider samt de
tilhørende billeder, dokumenter, stylesheets og scripts. Interne links er gjort
relative, så siden også virker under et GitHub Pages-projektnavn.

## Vigtige begrænsninger

- Klonen viser et øjebliksbillede af det offentlige indhold.
- Formularer og TYPO3-funktioner kan ikke gemme data på en statisk GitHub Pages-side.
- Eksterne tjenester og dokumentlinks kan fortsat pege på den oprindelige hjemmeside.
- Produktionssiden ændres ikke af dette projekt.

## Kontrol

```sh
node scripts/check-links.mjs
node scripts/smoke-http.mjs
```

Klonen er markeret `noindex,nofollow`, formularer er deaktiveret, og en lille
arbejdsudgave-markering gør den tydeligt forskellig fra produktionssiden.
