# Plan de remediere — 4 septembrie 2026

## Status implementare

Versiunea locală de recuperare a fost implementată și verificată în 4 septembrie 2026. Sunt finalizate: eliminarea prefetch-ului masiv, limita inițială de 24 produse, carduri în HTML, timeout controlat, păstrarea grilei în timpul filtrării, schimbarea atomică a pieței, butonul „Încarcă mai multe”, CTA vizibil pe card, mutarea panourilor după produse și mesajul comercial corectat.

Verificări înainte de publicare: typecheck verde, lint fără avertismente, 287/287 teste unitare, build de producție reușit și 25/25 fluxuri E2E trecute.

Versiunea de recuperare a fost publicată controlat pe `www.beforetobuy.com` în 4 septembrie 2026. După publicare, toate cele 9 verificări smoke au trecut, iar piețele RO, CH, DE, GB și US au livrat câte 12 carduri direct în HTML, fără stare falsă de zero rezultate, în aproximativ 0,13–0,17 secunde. Containerul rulează fără restarturi. Versiunea anterioară este păstrată pe NAS la `/share/Container/beforetobuy-backup-20260904-pre-recovery1` pentru rollback.

## Verdict executiv

Site-ul nu trebuie reparat prin încă un strat de cache sau prin alte preîncărcări. Problema este structurală: pagina livrează uneori un catalog gol, browserul poate porni zeci de cereri simultan, importurile pot șterge temporar produsele active, iar baza de date permite cererilor să rămână blocate până la două minute.

În plus, baza comercială nu susține în acest moment promisiunea de „comparare de prețuri”: din 210.517 produse, numai 5 au mai mult de o ofertă activă, nu există GTIN-uri salvate, iar aproximativ 96,7% dintre produse au brandul lipsă sau generic. Pentru aproape toate produsele, utilizatorul nu compară mai multe magazine; vede o singură ofertă.

Recomandarea este o recuperare controlată, în două direcții paralele:

1. stabilizarea tehnică a catalogului și a interfeței;
2. corectarea produsului comercial și a traseului care produce clickuri afiliate.

Nu recomand o rescriere totală din prima zi. Recomand înlocuirea controlată a componentelor critice, cu criterii de acceptare măsurabile și posibilitate de revenire.

## Decizie imediată

- Versiunea de recuperare publicată rămâne baza stabilă pentru următoarele intervenții.
- Se îngheață schimbările funcționale neesențiale până la finalizarea importului atomic.
- Se păstrează copia de rollback și nu se rulează importuri distructive peste catalogul activ.
- Se alege o singură piață pilot și un set mic de comercianți cu feeduri proaspete și aprobate.
- Până la construirea unei comparații reale, comunicarea trebuie să descrie site-ul sincer ca platformă de descoperire/oferte, nu ca motor complet de comparare a prețurilor.

## Etapa 0 — oprirea incidentului

### Modificări obligatorii

1. Eliminarea completă a preîncărcării automate pentru 12–25 de categorii.
2. Maximum o cerere inițială de catalog, cu 12–24 produse.
3. Timeout de 5 secunde pentru baza de date și maximum 8 secunde pentru răspunsul endpointului.
4. La timeout sau eroare se afișează ultimul catalog valid, marcat intern `degraded`; nu se returnează listă goală cu HTTP 200.
5. Un răspuns gol sau întârziat nu mai are voie să înlocuiască produsele deja afișate.
6. Repararea erorilor de typecheck/build și a celor 7 teste eșuate.
7. Blocarea automată a publicării dacă lint, typecheck, teste, build sau verificarea vizuală eșuează.
8. Separarea verificării „procesul rulează” de verificarea „catalogul poate fi livrat”.

### Criterii de ieșire

- cel puțin 12 carduri sunt prezente chiar în HTML-ul inițial;
- nu apare niciodată un mesaj fals de „0 produse” înainte de finalizarea încărcării;
- cardurile apar în maximum 2,5 secunde pentru 95% dintre vizite;
- nicio cerere de catalog nu depășește 8 secunde;
- 20 de sesiuni simultane nu produc erori, limitări sau cozi de un minut.

## Etapa 1 — un singur traseu stabil pentru catalog

Se creează un singur serviciu intern `getBrowsePage`, folosit atât de pagina randată pe server, cât și de API. Acesta caută în ordinea:

1. Redis persistent;
2. read-model-ul optimizat din baza de date;
3. ultimul snapshot valid, dacă baza este lentă sau indisponibilă.

Se elimină cache-ul de catalog de pe disc și din `localStorage`. Memoria procesului poate rămâne numai ca nivel rapid temporar, iar Redis devine sursa comună. Cache-ul trebuie invalidat după un import reușit, nu prin schimbări manuale de versiune.

Interfața trebuie să aibă stări distincte: încărcare, succes, rezultat cu adevărat gol, mod degradat și eroare. Răspunsurile vechi trebuie ignorate atunci când utilizatorul schimbă rapid țara, categoria sau filtrul.

## Etapa 2 — importuri fără dispariția produselor

Importurile nu mai au voie să șteargă catalogul activ înainte de terminarea procesării.

Fluxul corect este:

```text
feed nou
  -> încărcare în staging
  -> validare volum, imagini, linkuri și câmpuri
  -> blocare automată dacă volumul scade anormal
  -> publicare atomică a unei versiuni noi
  -> invalidare Redis
  -> încălzirea paginilor principale
  -> păstrarea versiunii anterioare pentru rollback
```

Orice import cu o scădere mai mare de 10% trebuie oprit automat până la verificare. O întrerupere la jumătatea importului trebuie să lase vechiul catalog complet funcțional.

## Etapa 3 — bază de date și viteză

- Se configurează un singur Redis real: fie Redis-ul NAS, fie un serviciu REST compatibil; nu două sisteme necoordonate.
- Se înlocuiește paginarea cu `OFFSET` prin cursor stabil.
- Se adaugă căutare full-text/trigram pentru titlu, brand și identificatori.
- Se aliniază schema Prisma cu indexurile reale din baza de date.
- Se creează un read-model care conține deja țara, categoria, produsul, oferta minimă, prețul total și rangul.
- Numărătorile, brandurile distincte și prețul minim nu se mai recalculează integral la fiecare vizită.
- Se expun timpi separați pentru Redis, baza de date și răspunsul total.

Ținte: cache hit p95 sub 200 ms, cache miss p95 sub 2 secunde, p99 sub 4 secunde.

## Etapa 4 — interfață care poate produce venit

Pe mobil, primul produs apare acum după aproximativ 2.383 px, aproape trei ecrane. Panourile mari trebuie reduse sau mutate după produsele principale.

Traseul recomandat:

```text
produs vizibil în primul ecran
  -> buton clar „Vezi oferta”
  -> consimțământ, dacă este juridic necesar
  -> reluarea intenției utilizatorului
  -> comerciant
```

Detaliile produsului rămân opționale, nu un pas obligatoriu. Comportamentul consimțământului trebuie validat juridic; dacă acesta este necesar, după acceptare acțiunea inițială trebuie reluată într-un mod clar, fără ca utilizatorul să ghicească faptul că trebuie să apese din nou.

Se măsoară, conform regulilor de confidențialitate:

- afișarea cardului;
- deschiderea detaliilor;
- afișarea consimțământului;
- clickul către comerciant;
- comerciantul și oferta selectată;
- linkurile afiliate invalide sau expirate.

Fără această măsurare nu se poate ști dacă lipsa veniturilor vine din trafic, poziționare, interfață, consimțământ, linkuri sau conversia comerciantului.

## Etapa 5 — comparație reală și calitatea datelor

Trebuie aleasă explicit una dintre cele două direcții:

### Varianta recomandată pe termen scurt

Lansare controlată ca platformă de descoperire a ofertelor într-o singură piață și nișă, cu puțini comercianți verificați, feeduri actualizate și pagini de calitate. Aceasta poate fi stabilizată mai repede și descrie corect ceea ce există acum.

### Varianta strategică

Construirea unui motor real de comparație. Pentru aceasta sunt obligatorii:

- GTIN/EAN, MPN și brand-model normalizate;
- un produs canonic legat la mai multe oferte;
- reguli și scor de încredere pentru potrivirea produselor;
- coadă de verificare pentru potrivirile incerte;
- minimum două oferte reale pentru paginile prezentate ca „comparare”.

Brandurile nu trebuie inventate din primul cuvânt al titlului. Produsele fără identitate suficientă trebuie marcate, corectate sau excluse din paginile importante.

## SEO și acceptarea rețelelor afiliate

- Se scot temporar din sitemap paginile subțiri cu o singură ofertă și date slabe.
- Se indexează numai pagini cu produs identificabil, conținut util, ofertă activă și limbă/piață coerente.
- HTML-ul văzut de crawler trebuie să conțină aceleași produse și aceeași limbă ca pagina văzută după încărcare.
- Feedurile vechi, comercianții dezactivați sau programele suspendate nu trebuie afișate doar pentru că mai există rânduri active în baza de date.
- Se verifică înainte de relansare conformitatea afirmațiilor comerciale și a mecanismului de consimțământ.

## Reguli de publicare

O versiune poate ajunge în producție numai dacă:

- build, typecheck, lint și toate testele sunt verzi;
- pagina inițială conține minimum 12 produse reale în HTML;
- piața, limba, textele și metadatele coincid;
- întregul traseu până la linkul afiliat este verificat pe desktop și mobil;
- căderea bazei sau a Redis-ului afișează ultima versiune bună;
- oprirea unui import nu afectează catalogul activ;
- monitorizarea detectează catalogul gol, latența excesivă și scăderea volumului;
- există rollback verificat.

## Ordinea de execuție recomandată

1. Stabilizare și revenire la un singur request.
2. HTML cu produse reale și snapshot de siguranță.
3. Import atomic și Redis funcțional.
4. Read-model și optimizarea căutării/paginării.
5. Simplificarea UI și măsurarea clickurilor.
6. Curățarea datelor și alegerea poziționării comerciale.
7. Relansare pilot într-o singură piață.
8. Extindere numai după ce stabilitatea și funnelul sunt măsurate.

## Concluzie

Site-ul poate fi recuperat, dar nu prin încă o corecție punctuală. Mai întâi trebuie eliminată posibilitatea ca aplicația să livreze sau să publice un catalog gol. Apoi trebuie redusă drastic complexitatea traseului de date și a interfeței. În paralel, produsul comercial trebuie adus în acord cu realitatea datelor: astăzi există în principal câte o ofertă per produs, nu o comparație autentică.
