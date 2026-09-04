# Audit tehnic BeforeToBuy.com

Data auditului: 4 septembrie 2026  
Scop: disponibilitatea catalogului, cardurile de prezentare, stările goale/skeleton, timpii de răspuns, arhitectura de date și capacitatea de deploy.

## Verdict executiv

Site-ul nu are o problemă izolată de CSS sau de componentă `ProductCard`. Cardurile se pot afișa, dar apar numai după ce un lanț fragil de cache și cereri client-side reușește. Defectul central este arhitectural: HTML-ul inițial poate fi livrat fără produse, browserul pornește multe cereri de catalog, erorile sunt mascate, iar răspunsurile pot înlocui lista existentă cu o listă goală.

În forma analizată, proiectul este într-o stare de incident P0:

- producția poate afișa inițial `0 rezultate / Niciun produs găsit`, apoi se corectează singură după încărcarea client-side;
- un robot de validare, un crawler sau un screenshot făcut devreme poate vedea un site gol și poate respinge integrarea;
- primul request rece pentru catalogul RO a durat 7,66 s în producție și 11,47 s local;
- homepage-ul poate porni 12 cereri RO sau 25 cereri CH de prefetch, fiecare pentru 96 produse;
- baza de date este configurată cu `connection_limit=1`, deci cererile concurente formează coadă;
- există două cereri consecutive pentru același catalog în calea de fallback, fără timeout propriu;
- build-ul de producție eșuează în starea curentă;
- suita unit are 6 teste eșuate în zona cardurilor/shortcut boards.

Concluzie: reclamația că site-ul este instabil și poate fi respins repetat este confirmată de audit.

## Dovezi observate

### Producție

- `https://www.beforetobuy.com/` a răspuns HTTP 200 în aproximativ 0,18 s, dar HTML-ul inițial nu conținea cardurile de produs.
- Prima stare observată în browserul de producție a fost `0 rezultate` și `Niciun produs găsit` pentru DE.
- Fără intervenție, aceeași pagină a trecut ulterior la `84.265 rezultate` și 12 carduri. Acesta este un flash de stare falsă, nu un catalog gol real.
- Snapshot-ul recent al motorului de căutare pentru homepage a indexat tot `0 rezultate / Niciun produs găsit`.
- API RO, 24 produse, cache miss: TTFB 7,66 s.
- API CH, 24 produse, cache miss: TTFB 0,84 s.
- API RO, 96 produse: payload aproximativ 105 KB; API CH, 96 produse: aproximativ 113 KB; API DE, 96 produse: aproximativ 71 KB.
- După încălzirea cache-ului, aceleași cereri au răspuns în aproximativ 0,08–0,10 s.
- Cloudflare a raportat `CF-Cache-Status: DYNAMIC`, deși API-ul trimite headere publice de cache. Performanța depinde astfel în principal de cache-ul intern al aplicației, nu de un edge cache verificat.
- Endpoint-ul public `/api/health` a răspuns `healthy` în aproximativ 0,16 s, dar versiunea publică nu verifică baza de date și nici faptul că produsele pot fi livrate.
- Primele 12 imagini din fiecare piață RO, CH și DE au fost verificate direct: 36/36 au răspuns cu imagine validă. Imaginile nu sunt cauza principală pentru dispariția întregii grile.

### Local și CI

- Serverul de dezvoltare pornește repede, iar cu cache cald afișează 12 carduri fără skeleton rămas.
- Un request RO rece pentru 24 produse a durat 11,47 s local.
- Logul local a arătat imediat după homepage un val de cereri automate pe categorii.
- `npm run lint`: 0 erori, 6 avertismente; două sunt dependențe lipsă în efectele React din homepage.
- `npm run test:unit`: 281 teste trecute, 6 eșuate; toate cele 6 eșecuri sunt în `browse-shortcut-boards.test.ts`.
- `npm run build`: eșuat la TypeScript. Erorile curente sunt:
  - `src/hooks/useUserLocation.ts`: `isCountryCode` nu este definit și un `string` este trimis unde este necesar `CountryCode`;
  - `src/lib/categories.ts`: tipul ofertei nu declară `storeName` și `feedMerchantId`.
- Testele E2E nu au putut fi rulate corect deoarece build-ul de producție nu se finalizează.

## Cauze rădăcină

### P0. Homepage-ul livrează un shell gol și depinde de recuperarea în browser

`src/app/page.tsx` este `force-dynamic`, dar la randarea server-side citește numai prima pagină din cache. Dacă acel cache lipsește sau pagina este considerată „neutilizabilă”, trimite `initialProducts=[]`. Nu face un fetch controlat al catalogului și nici nu transmite către client o stare de eroare.

Efect:

- browserul și crawlerul primesc mai întâi un site fără produse;
- starea goală poate fi interpretată ca rezultat real;
- cardurile apar doar dacă JavaScript, API-ul și baza de date răspund ulterior;
- orice validare automată făcută înainte de terminarea requestului vede un site gol.

### P0. Două cereri consecutive pentru același catalog, fără timeout

În `HomePageClient`, fluxul încearcă mai întâi `ensureBrowseCatalog()`. Dacă acesta întoarce `null` sau un rezultat respins de regula `isUsableAllBrowsePage`, codul construiește și trimite încă o cerere către același `/api/products`.

Nici `ensureBrowseCatalog()` și nici fetch-ul de rezervă nu au timeout de produs. `AbortController` este folosit doar când efectul React este demontat sau repornit. Cum funcția server are limită de 60 s, două așteptări consecutive pot ajunge la aproximativ 120 s, înainte de latența suplimentară de rețea și retry.

### P0. Prefetch de tip thundering herd

După montarea homepage-ului, `prefetchMarketCategories()` parcurge toate categoriile configurate și pornește cererile fără limită de concurență:

- RO: 12 endpoint-uri;
- CH: 25 endpoint-uri;
- fiecare cere implicit 96 produse.

În același timp, Prisma este configurat pentru transaction pooler cu o singură conexiune. Rezultatul previzibil este coadă, competiție cu cererea utilizatorului, timeout și variație foarte mare între cache miss și cache hit.

Acest prefetch nu este o optimizare în forma actuală; este un multiplicator de trafic și latență.

### P0. Stările UI se pot suprascrie și pot afișa gol în mod fals

La un răspuns HTTP valid, `setProducts(nextProducts)` înlocuiește integral lista, inclusiv atunci când `nextProducts=[]`. Starea `isLoadingProducts` este activată numai dacă lista era deja goală. La schimbarea pieței sau filtrului pot rămâne temporar produse vechi, apoi lista poate deveni zero fără un fallback stabil.

Două efecte React au dependențe incomplete conform ESLint. Acest lucru favorizează closure-uri cu valori vechi pentru produse/meta și decizii greșite despre categorie, cache și încărcare.

### P0. Starea curentă nu poate fi livrată

Build-ul de producție eșuează la verificarea TypeScript. Orice remediere făcută peste o ramură care nu construiește adaugă risc și face imposibilă validarea end-to-end.

### P1. Cache cu mai multe surse de adevăr și persistență nesigură

Catalogul poate veni din:

1. memorie de proces;
2. fișiere `.cache` în `process.cwd()`;
3. Redis/Upstash;
4. cache HTTP/CDN;
5. `localStorage` în browser;
6. baza de date.

Erorile la cache-ul de disc sunt înghițite complet. În serverless, memoria și discul nu reprezintă o sursă persistentă între instanțe. Browserul păstrează copii 15 minute. Fiecare strat poate avea altă versiune de cheie și alte reguli de validare. Acest model explică de ce o remediere pare să funcționeze, apoi „revine” problema.

### P1. API-ul supraîncarcă prima pagină

UI afișează inițial 12 carduri, dar API-ul cere 96 produse. Pentru prefetch, această supracerere se repetă pentru fiecare categorie. Payload-urile măsurate de 71–113 KB nu includ costul imaginilor remote.

### P1. Interogările și indecșii nu sunt aliniați cu traficul real

Schema are indecși individuali utili, dar traseul de browse combină:

- `targetCountries`;
- existența ofertelor `inStock`;
- categorie/brand/magazin;
- sortări și paginare;
- uneori `count`, `groupBy`, `distinct` și query raw.

Fără planuri `EXPLAIN ANALYZE` pe query-urile reale nu se poate confirma un index optim. Valul de cereri concurente amplifică orice scanare lentă.

### P1. Health check-ul public poate da fals pozitiv

Versiunea publică declară `healthy` numai pentru că aplicația rulează și există feed-uri configurate. Nu verifică dacă Supabase răspunde, dacă există produse vizibile sau dacă `/api/products` poate livra prima pagină într-un timp acceptabil.

### P1. Testele maschează scenariul de producție

- E2E folosește `FORCE_SAMPLE_FEEDS=1`, deci nu reproduce obligatoriu baza de date și cache-ul de producție.
- Testele acceptă până la 60 s pentru apariția primului card; o astfel de limită poate face un test verde, deși experiența este deja neacceptabilă.
- Nu există o aserțiune că HTML-ul inițial conține produse sau o stare de încărcare corectă.
- Nu există test pentru explozia de prefetch, pentru un cache miss real, pentru două cereri duplicate sau pentru răspunsurile sosite în ordine inversă.

### P2. Optimizarea imaginilor este dezactivată global

`images.unoptimized=true`, iar grila folosește `<img loading="lazy">`. Primele imagini testate sunt valide, deci aceasta nu explică dispariția catalogului. Totuși, costul, stabilitatea și comportamentul CDN rămân dependente de serverele comercianților. Este o problemă secundară după repararea traseului de date.

## Arhitectura actuală a defectului

```text
Cerere homepage
    |
    v
Next.js force-dynamic
    |
    +--> există cache intern valid? -- da --> HTML cu produse
    |                              
    +--> nu --> HTML cu 0 produse
                 |
                 v
           browserul pornește fetch catalog
                 |
                 +--> prefetch simultan 12/25 categorii x 96 produse
                 |
                 +--> prima încercare eșuează/null
                           |
                           v
                    a doua cerere identică
                           |
                           v
                 API -> cache-uri multiple -> Prisma -> Supabase
                           |
                           v
                 lista curentă poate fi înlocuită cu []
```

## Plan de remediere recomandat

### Etapa 0 — înghețarea incidentului (imediat)

1. Opriți complet prefetch-ul automat al categoriilor de pe homepage.
2. Nu mai publicați până când `build`, typecheck și testele unit sunt toate verzi.
3. Reduceți prima pagină la 12 sau 24 produse; încărcați restul numai la scroll/interacțiune.
4. Păstrați ultima listă validă la timeout/5xx/429; un răspuns gol nu trebuie să șteargă produse decât dacă este confirmat ca rezultat valid pentru filtrul curent.
5. Introduceți un timeout unic de 8–10 s și eliminați al doilea fetch duplicat.

### Etapa 1 — un singur traseu de date (aceeași zi)

1. Randarea server-side trebuie să obțină prima pagină dintr-un serviciu unic `getBrowsePage`, cu regula: cache central -> DB cu timeout -> ultimul cache stale.
2. HTML-ul inițial trebuie să conțină cardurile pentru piața aleasă sau o stare explicită `loading/degraded`; niciodată un „0 rezultate” înainte de terminarea requestului.
3. Modelați starea UI explicit: `idle | loading | success | empty | error | degraded`.
4. Folosiți un request ID/sequence ID și aplicați un răspuns numai dacă aparține celei mai noi selecții de piață/filtru.
5. Corectați toate dependențele efectelor React și adăugați teste pentru schimbări rapide de piață/filtru.

### Etapa 2 — cache și bază de date (1–2 zile)

1. Alegeți o singură sursă persistentă de cache pentru producție, de exemplu Redis obligatoriu; memoria rămâne doar L1 opțional.
2. Eliminați cache-ul pe disc din request path și erorile silențioase.
3. Adăugați protecție anti-stampede: un singur warm per cheie și coalescing între instanțe, nu doar în același proces.
4. Încălziți numai paginile critice prin job controlat, nu din browserul fiecărui vizitator.
5. Verificați configurația Cloudflare/Vercel astfel încât cache-ul public să fie într-adevăr HIT la edge sau eliminați presupunerea că există.
6. Rulați `EXPLAIN (ANALYZE, BUFFERS)` pentru browse RO/CH/DE, categorie, magazin și sortare. Adăugați indecși numai pe baza acestor planuri.

### Etapa 3 — observabilitate și criterii de acceptare

Log obligatoriu pentru fiecare request de catalog:

- request ID;
- țară, categorie, limită și offset;
- cache hit/miss/stale;
- timp Redis, timp DB și timp total;
- număr de produse returnate;
- motivul exact pentru fallback/empty;
- timeout și cod de eroare.

Health check-ul public trebuie să returneze `503 degraded/unhealthy` când o probă mică de catalog nu poate fi servită în timp util.

## Criterii de acceptare înainte de următorul deploy

- `npm run build`: succes.
- `npm run typecheck`: succes.
- `npm run lint`: zero erori și zero avertismente în traseul homepage/catalog.
- `npm run test:unit`: 100% teste trecute.
- E2E pe configurație apropiată de producție, fără `FORCE_SAMPLE_FEEDS`, pe o bază de staging.
- HTML-ul inițial conține minimum 12 carduri pentru o piață cu inventar.
- Nu apare niciun flash `0 rezultate` înainte de terminarea încărcării.
- O singură cerere de catalog pentru încărcarea inițială.
- Zero prefetch-uri de categorie înainte de interacțiunea utilizatorului.
- Cache hit p95 sub 500 ms; cache miss p95 sub 2 s; timeout controlat sub 10 s.
- 10 sesiuni concurente nu produc cozi de 60 s, 429, 5xx sau grile goale.
- Schimbarea rapidă RO -> CH -> DE nu permite unui răspuns vechi să suprascrie piața curentă.
- Health check-ul detectează baza de date/catalogul indisponibil.
- Un crawler fără JavaScript vede produse sau conținut degradat corect, nu `0 rezultate` fals.

## Ordinea corectă de lucru

Nu recomand repararea separată a aspectului cardurilor înaintea traseului de date. Ordinea sigură este:

1. build verde;
2. eliminare prefetch masiv și fetch duplicat;
3. SSR cu prima pagină reală/stale;
4. stare UI deterministă;
5. cache central și query profiling;
6. observabilitate;
7. abia apoi design vizual și optimizarea imaginilor.

Fără primele șase puncte, modificările de interfață vor continua să pară reparate temporar și să se strice după schimbarea cache-ului, a instanței sau a ordinii răspunsurilor.

## Addendum — auditul celor trei agenți

Auditul extins, realizat separat pe UI, backend/performanță și arhitectură/livrare, a confirmat și următoarele:

### Date și model comercial

- baza conține 210.517 produse și 210.523 oferte;
- numai 5 produse au mai mult de o ofertă activă;
- niciun produs nu are GTIN salvat;
- 203.516 produse, aproximativ 96,7%, au brandul lipsă sau generic;
- primele 96 de rezultate din fiecare piață verificată au exact o ofertă per produs;
- multe feeduri sunt vechi de una până la peste trei săptămâni;
- inferarea brandului din primul cuvânt al titlului poate produce etichete false precum „Sports”, „Classic” sau „Edge”.

Consecință: site-ul funcționează în prezent în principal ca un catalog afiliat cu o ofertă per produs, nu ca un motor real de comparare a prețurilor. Aceasta este o problemă comercială și de încredere, nu doar una tehnică.

### Import și infrastructură

- baza de date are `statement_timeout = 2min`, fără timeout inferior în aplicație;
- pe infrastructura NAS, limita Vercel de 60 s nu se aplică;
- Redis-ul pornit în Docker nu este utilizat de codul aplicației, care știe doar protocolul REST Upstash/KV;
- mai multe importatoare șterg ofertele și produsele active înainte de recreare, fără staging și fără swap atomic;
- importurile nu invalidează cache-ul după publicare;
- joburile de import, încălzire și smoke test sunt manuale, nu programate;
- endpoint-ul public de sănătate nu verifică baza, Redis sau existența unui catalog servibil.

### Reproduceri UI

- pentru toate cele cinci piețe, HTML-ul inițial a conținut zero carduri de produs;
- pentru URL RO/română, serverul a putut livra inițial țara CH și corp în germană;
- aplicarea filtrului `rowenta.ro` a produs o perioadă cu zero carduri și totalul vechi, înainte ca cele 12 carduri să reapară;
- schimbarea DE -> RO a afișat temporar produsele Germaniei etichetate în lei;
- un interval de preț invalid a afișat zero carduri, dar a păstrat un total vechi;
- infinite scroll mută continuu footerul, făcând paginile legale greu accesibile;
- primul produs mobil apare după aproximativ 2.383 px, aproape trei ecrane sub începutul paginii;
- fluxul comercial cere mai mulți pași: card -> detalii/modal -> ofertă -> consimțământ -> încă un click către comerciant;
- nu există măsurare proprie a impresiilor și clickurilor afiliate.

### Starea livrării

- build și typecheck eșuează în starea auditată;
- 280 teste unitare trec și 7 eșuează;
- testele smoke/E2E pot raporta fals succes, deoarece caută elemente generice și nu confirmă carduri reale în HTML;
- homepage-ul livrează aproximativ 1,16 MiB de JavaScript în 16 fișiere;
- `HomePageClient` are aproximativ 1.190 linii și concentrează prea multe responsabilități.

Planul executabil rezultat din acest audit este documentat separat în `PLAN_REMEDIERE_SITE_2026-09-04.md`.
