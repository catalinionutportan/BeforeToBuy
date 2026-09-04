# Catalog classification dry-run — CH, GB, US

Date: 2026-09-05  
Mode: read-only; no database or production writes

## Result

The reproducible scan read 1,890 products belonging to `ch-acer`, `gb-seentat`,
and `us-dji`. It found 100 rows whose previous rule proposal was semantically
wrong and whose database category already matches the corrected conservative
proposal:

| Market | Rows | Previous proposal | Corrected proposal |
| --- | ---: | --- | --- |
| CH / Acer | 22 | 7 laptops, 9 desktops, 4 monitors, 2 projectors | `peripherals-accessories` |
| GB / Seentat | 33 | `wearables-smartwatch` | `unmapped` |
| US / DJI | 45 | 30 drones, 15 drone accessories | `photo-gimbals` |

The database therefore needs no corrective write for these 100 rows. The rule
changes prevent a future feed import from moving already-correct rows into the
wrong categories.

## Exact affected product IDs

### CH / Acer service and warranty products (22)

`feed-29906957911`, `feed-29906957917`, `feed-29906957919`,
`feed-29906957927`, `feed-29906957931`, `feed-29906957933`,
`feed-29906957935`, `feed-29906957937`, `feed-29906957939`,
`feed-29906957941`, `feed-29906957943`, `feed-29906957945`,
`feed-32071619317`, `feed-39607100037`, `feed-39607100038`,
`feed-39616762411`, `feed-42739970631`, `feed-43071128874`,
`feed-44301931673`, `feed-44301931674`, `feed-44301931675`,
`feed-44301931676`.

Reason: these rows sell a service/warranty. Hardware names after the separator
describe what is covered; they do not turn the service into a laptop, desktop,
monitor, or projector.

### GB / Seentat Casio G-Shock products (33)

`feed-45225011625`, `feed-45225011626`, `feed-45225011627`,
`feed-45225011628`, `feed-45225011629`, `feed-45225011630`,
`feed-45225011631`, `feed-45225011632`, `feed-45225011633`,
`feed-45231884596`, `feed-45231884597`, `feed-45231884598`,
`feed-45231884599`, `feed-45231884600`, `feed-45231884601`,
`feed-45231884602`, `feed-45231884603`, `feed-45240784831`,
`feed-45240784832`, `feed-45240784833`, `feed-45240784834`,
`feed-45240784835`, `feed-45240784836`, `feed-45240784837`,
`feed-45240784838`, `feed-45240784839`, `feed-45240784840`,
`feed-45240784841`, `feed-45240784842`, `feed-45240784843`,
`feed-45240784844`, `feed-45240784845`, `feed-45240784846`.

Reason: `G-Shock`, `watch`, and `men's watches` do not prove smartwatch
functionality. The current taxonomy has no ordinary-watch leaf, so `unmapped`
is safer than inventing a connected-device classification. Explicit smartwatch
titles such as Apple Watch, Galaxy Watch, Pixel Watch, Huawei Watch, and the
literal word `smartwatch` remain supported.

### US / DJI RS and OM stabilizer ecosystem products (45)

`feed-45287201583`, `feed-45287201584`, `feed-45287201585`,
`feed-45287201588`, `feed-45287201618`, `feed-45287201649`,
`feed-45287201650`, `feed-45287201653`, `feed-45287201654`,
`feed-45287201655`, `feed-45287201656`, `feed-45287201657`,
`feed-45287201658`, `feed-45287201659`, `feed-45287201660`,
`feed-45287201661`, `feed-45287201662`, `feed-45287201663`,
`feed-45287201664`, `feed-45287201665`, `feed-45287201669`,
`feed-45287201671`, `feed-45287201673`, `feed-45287201699`,
`feed-45287201713`, `feed-45287201714`, `feed-45287201768`,
`feed-45287201769`, `feed-45287201770`, `feed-45287201794`,
`feed-45287201816`, `feed-45287201817`, `feed-45287201958`,
`feed-45287201959`, `feed-45287201960`, `feed-45287201961`,
`feed-45287202112`, `feed-45287202113`, `feed-45287202120`,
`feed-45287202275`, `feed-45287202322`, `feed-45287202323`,
`feed-45287202328`, `feed-45287202359`, `feed-45287202360`.

Reason: `DJI RS` and `DJI OM` identify DJI's handheld stabilizer ecosystems.
Their grips, cables, plates, clamps, mounts, and tracking modules are not drones
or drone accessories.

## Reproduction

Run:

```sh
node --env-file=.env.local --import tsx src/scripts/audit-category-classification.ts
```

The JSON output contains every product ID, merchant product ID, title, database
category, previous rule proposal, corrected proposal, and reason. The script is
read-only and explicitly reports `databaseWrites: 0`.

## Deliberately not auto-corrected

- Other generic DJI cables, batteries, hubs, adapters, transmission equipment,
  and camera accessories remain outside this change unless a product-family
  name makes the destination certain.
- Casio G-Shock models are not moved to `fashion-accessories` because that would
  also be an assumption; a dedicated ordinary-watch taxonomy leaf should be a
  separate product decision.
- This dry-run does not infer or reconstruct missing raw merchant-category
  values from the database. It validates only conclusions supported by stored
  product titles and merchant identity.
