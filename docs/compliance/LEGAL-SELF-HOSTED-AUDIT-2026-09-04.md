# Audit juridic-tehnic și migrare self-hosted

**Platformă:** BeforeToBuy.com
**Operator:** PortanX - Catalin Portan, UID CHE-373.501.736
**Data auditului:** 2026-09-04
**Versiune documente publice după migrare:** 2.0
**Statut:** audit tehnic și documentar; nu reprezintă opinie juridică sau certificare de conformitate

## 1. Modelul real al serviciului

BeforeToBuy este un serviciu gratuit de prezentare și comparare a ofertelor. Platforma:

- nu vinde produse;
- nu încasează prețul produselor;
- nu procesează plăți, comenzi, livrări, retururi sau garanții;
- afișează date primite din feeduri comerciale și redirecționează utilizatorul către magazin;
- poate primi un comision de recomandare de la magazin sau rețeaua afiliată, fără adaos BeforeToBuy;
- nu garantează prețul, transportul sau stocul; confirmarea finală se face pe site-ul comerciantului.

## 2. Infrastructura constatată

| Componentă | Rol real | Statut public |
|---|---|---|
| Origin self-hosted | rulează aplicația, administrat direct de PortanX | activ |
| Cloudflare | DNS, reverse proxy, protecție, livrare conținut și loguri tehnice | activ |
| Supabase/PostgreSQL | catalog de produse și oferte | activ |
| AWIN / 2Performant | feeduri și redirecționări afiliate pentru programele aprobate | activ doar unde este configurat |
| Upstash | rate limit/cache extern | opțional; neconfirmat în producția auditată |
| Resend | livrare formular de contact | opțional; neconfirmat în producția auditată |
| Datadog RUM | monitorizare browser | cod existent, dar componenta nu este montată |
| CDN-uri comercianți | imagini de produs încărcate în browser | activ, în funcție de ofertă |

## 3. Migrarea de la iubenda

Migrarea este fezabilă fără abonament iubenda deoarece aplicația are deja:

- pagini juridice locale;
- conținut în engleză, germană, franceză, italiană și română;
- banner propriu pentru preferințe;
- cookie semnat pentru dovada alegerii;
- centru juridic și datele operatorului.

Acțiunile implementate în versiunea 2.0:

1. `/privacy` este randată exclusiv din conținut local tipizat.
2. Nu mai există fetch sau HTML juridic injectat de la iubenda.
3. Bridge-ul, widgetul, fișierele și testele iubenda au fost eliminate.
4. CSP nu mai permite conexiuni, imagini sau iframe-uri iubenda.
5. Setările sunt deschise exclusiv prin dialogul propriu BeforeToBuy.
6. Footerul expune direct toate grupurile de documente juridice.

## 4. Inventarul documentelor publice

### Companie

- `/legal` — centru juridic și companie
- `/impressum` — identificarea operatorului și registrul comercial
- `/transparency` — modelul platformei și transparență
- `/about` — descrierea serviciului
- `/contact` — contact general, juridic și privacy

### Confidențialitate

- `/privacy` — politica de confidențialitate self-hosted
- `/cookies` — cookie-uri, localStorage și tehnologii similare
- `/accessibility` — declarația de accesibilitate
- `/complaints` — procedura de reclamații privind platforma

### Comercial și afiliere

- `/terms` — termenii serviciului
- `/affiliate-disclosure` — comision și relații afiliate
- `/disclaimer` — preț, stoc, transport și limitele datelor
- `/policies/comparison` — metodologia comparației și clasării
- `/policies/editorial` — separarea prezentării de checkout
- `/policies/feeds` — production feed, sample și demo
- `/policies/merchants` — integrarea magazinelor
- `/policies/notifications` — notificări publice despre serviciu

## 5. Stocare în browser

| Nume | Tip | Scop | Durată |
|---|---|---|---|
| `b2b_consent` | cookie HttpOnly semnat | sursa server-side a alegerii | până la 180 zile |
| `b2b_consent_hint` | cookie first-party | sincronizarea interfeței | până la 180 zile |
| `b2b_consent_v4` | localStorage | copia locală a alegerii | până la retragere/ștergere |
| `btb-ui-lang` | cookie + localStorage | limba aleasă explicit | până la 1 an |
| `btb-market-country` | cookie + localStorage | piața aleasă explicit | până la 1 an |
| `btb:compare-list:v1` | localStorage | produsele adăugate explicit la comparație | până la golire/ștergere |
| `btb-browse-page:v9:*` | sessionStorage | cache temporar al catalogului în fila curentă | maximum 15 minute |
| `btb:browse-scroll-y` | sessionStorage | revenire la poziția de scroll | sesiunea filei |
| `btb:browse-scroll-anchor` | sessionStorage | revenire la produsul deschis | sesiunea filei |
| `btb:product-preview` | sessionStorage | redeschiderea preview-ului | sesiunea filei |

Lista de comparație nu mai este scrisă automat la simpla încărcare. Cache-ul catalogului nu mai persistă între sesiuni/taburi.

## 6. Remedieri implementate

- politica Privacy locală în 5 limbi;
- infrastructură publică schimbată din Vercel în Cloudflare + origin self-hosted;
- iubenda eliminat din runtime și CSP;
- disclosure de comision afișat lângă linkurile comerciale;
- CTA-urile de comparație schimbate din „Cumpără acum” în „Vezi oferta în magazin”;
- formularul cere confirmarea citirii notei privacy, nu consimțământ ca temei al răspunsului;
- footer juridic complet, grupat și responsive;
- reducerea stocării automate înainte de interacțiune.

## 7. Decizii încă deschise

### Reprezentant UE și UK

PortanX este operator elvețian, iar site-ul țintește explicit Germania, România și Regatul Unit. Aplicabilitatea GDPR/UK GDPR și obligația unui reprezentant în UE și UK trebuie evaluate de un avocat. Această decizie nu poate fi rezolvată doar prin cod.

### Redirect afiliat

Categoria „Affiliate” rămâne conservator blocată până la confirmarea contractuală AWIN/2Performant:

- dacă redirectul nu scrie/citește identificatori înainte de ieșirea din site, blocarea poate fi eliminată și păstrat disclosure-ul comercial;
- dacă rețeaua accesează stocare sau identificatori în redirect, trebuie documentat exact scopul și obținut consimțământul necesar.

### Imagini externe

Imaginile de produs pot transmite IP și metadate către hosturile comercianților/CDN. Remedierea tehnică preferată este un proxy/cache first-party pentru imagini; până atunci politica trebuie să descrie destinatarii.

### Retenții și contracte

Trebuie confirmate în conturile furnizorilor:

- retenția Cloudflare și serviciile activate;
- localizarea și retenția logurilor originului;
- retenția Supabase;
- dacă Upstash, Resend și Datadog sunt active;
- rolurile și contractele AWIN/2Performant.

## 8. Teste obligatorii înainte de publicare

- `rg -i iubenda src` nu găsește dependențe de runtime;
- `/privacy` funcționează fără acces la iubenda sau alt generator extern;
- toate documentele păstrează limba selectată;
- înainte de interacțiune nu apare `btb:compare-list:v1` și nu apare cache persistent de catalog;
- „Doar esențiale” nu pornește servicii opționale;
- fiecare CTA extern are `rel="sponsored nofollow noopener noreferrer"` după activare;
- fiecare CTA are disclosure vizibil privind posibilul comision;
- CTA-urile nu pretind că vânzarea are loc pe BeforeToBuy;
- footerul este utilizabil pe mobil, tabletă și desktop;
- politica de procesatori corespunde infrastructurii publice observabile.

## 9. Surse oficiale de control

- [FDPIC — obligația de informare](https://www.edoeb.admin.ch/en/duty-to-provide-information)
- [FDPIC — declarații de confidențialitate pe internet](https://www.edoeb.admin.ch/en/privacy-statements-on-the-internet)
- [FDPIC — cookie-uri și tehnologii similare](https://www.edoeb.admin.ch/dam/en/sd-web/ByXs53ExpIEy/20260327%20Merkblatt%20Cookies_EN.pdf)
- [Swiss Federal Act on Data Protection](https://www.fedlex.admin.ch/eli/cc/2022/491/en)
- [GDPR — text oficial](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32016R0679)
- [ePrivacy Directive](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32002L0058)
- [ICO — cookies și tehnologii similare](https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/cookies-and-similar-technologies/)
- [FTC — disclosure pentru afiliere](https://www.ftc.gov/business-guidance/resources/ftcs-endorsement-guides-what-people-are-asking)
- [Cloudflare Customer DPA](https://www.cloudflare.com/cloudflare-customer-dpa/)

## 10. Limită importantă

Acest audit poate face aplicația și documentația consecvente cu funcționarea observată, dar nu poate garanta „conformitate perfectă”. Publicarea finală pentru piețele UE/UK trebuie urmată de verificarea reprezentanților, a contractelor afiliate și a retențiilor de către un specialist juridic.
