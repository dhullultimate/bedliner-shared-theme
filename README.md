# bedliner-theme

Shared Eleventy chrome (layout, CSS, nav JS) and canonical SDS documents for the four
Ultimate Linings OEM bedliner-repair clone sites: Toyotabedliner, Setoyotabedliner,
Fordbedlinerrepair, Gmbedlinerrepair. Visual reference is Toyotabedliner.

## What lives here

- `includes/base.njk` — the canonical Eleventy layout (header/nav/hero-adjacent/footer).
  Nav links come from each site's own `nav` data (see below). A language switcher
  renders only when a site's `_data/site.js` sets `site.langSwitcher`. Links two
  stylesheets: `theme.css` (this repo's, synced) then `site.css` (the site's own,
  never touched by sync — see below).
- `assets/css/theme.css` — the canonical design system (colors, type, header, hero,
  sections, forms, buttons, footer). One set of class names across all four sites.
  Each site keeps its own `src/assets/css/site.css` for page-body styles theme.css
  doesn't cover (e.g. a site's own order-parts table layout). When porting a site
  onto this theme, remove from its `site.css` any selector theme.css already
  defines (`.site-header`, `.hero`, `.site-footer`, `button[type="submit"]`, etc.)
  so the shared styling isn't silently overridden by cascade order.
- `assets/js/main.js` — nav toggle + language-switcher toggle.
- `assets/js/order-form.js` — shared behavior for any "order a part/kit" page: live
  total from `.order-products` rows, generic `FormData` → JSON submit to the form's
  own `action`, status message via `.form-status[data-state]`. It never reads or
  hardcodes individual field names — only structural classes/ids (`.order-form`,
  `.order-products`, `.qty`, `#order-total`, `#order-form-status`) — so the same
  script works against each site's own backend field-name contract. Used by
  Toyotabedliner, Setoyotabedliner, and Fordbedlinerrepair's order pages.
  Gmbedlinerrepair keeps its own `order-parts.js` since its backend expects a
  structured `items` array built from `tr[data-sku]` rows rather than flat
  `qty_<sku>` fields — don't move it onto this script without also changing its
  Cloudflare Function.
- `docs/sds/` — canonical MSDS/SDS PDFs. Real content will be replaced before launch;
  these are placeholders for wiring the shared link, not final documents.

## How a site consumes this

Each site's `package.json` depends on this repo (once pushed) as a git dependency:

```json
"dependencies": {
  "bedliner-theme": "github:dhullultimate/bedliner-shared-theme#v1.0.0"
}
```

and runs `site/scripts/sync-theme.mjs` (a copy of `scripts/sync-theme.mjs` here) as an
npm `prebuild` step, which copies `base.njk` / `theme.css` / `main.js` / `order-form.js`
into the site's own `src/_includes` / `src/assets`.

Each site's own data (`_data/nav.json` or equivalent) must provide a `nav` array of
`{ href, label }` items for the header, matching the schema `base.njk` expects.

## Order-parts / order-kit page structure

Every "order a part/kit" page (Toyotabedliner, Setoyotabedliner, Fordbedlinerrepair,
Gmbedlinerrepair's order-parts pages, and Fordbedlinerrepair's order-repair-kit page)
follows the same markup shape, using `theme.css`'s existing classes — this isn't a
synced file since each site's field `name`s/backend differ, but the *shape* should
stay identical when editing any of them:

```html
<div class="wrap page-head"><h1>Order Parts</h1></div>
<div class="wrap">
  <form id="order-parts-form" class="order-form" method="post" action="/api/...">
    <p class="form-note">Please fill in your details below:</p>
    <div class="form-row form-row-2"> business name / contact name </div>
    <fieldset class="form-fieldset"> street, then form-row-4: city/state/zip/country </fieldset>
    <div class="form-row form-row-2"> dealer code / phone </div>
    <div class="form-row form-row-2"> email / fax </div>
    <h2 class="form-section-title">Enter Parts Quantity:</h2>
    <table class="order-products">
      <thead><tr><th>Item</th><th>Description</th><th>Price</th><th>Quantity</th></tr></thead>
      <tbody><tr data-price="..." data-sku="..."><td>SKU</td><td>Description</td><td class="price">$..</td><td><input class="qty" type="number" name="qty_SKU" min="0" value="0"></td></tr>...</tbody>
      <tfoot><tr><td colspan="3">Total</td><td id="order-total">$0.00</td></tr></tfoot>
    </table>
    <label class="full">Message (if any)<textarea name="message" rows="6"></textarea></label>
    <div class="hp-field" aria-hidden="true">...</div>
    <button type="submit" class="btn btn-primary">Submit</button>
    <p id="order-form-status" class="form-status" role="status" aria-live="polite"></p>
  </form>
</div>
<script src="/assets/js/order-form.js" defer></script>
```

`data-sku` on each `<tr>` is optional for sites using the shared `order-form.js`
(which only reads `data-price` and `.qty`) but required for Gmbedlinerrepair's own
script, which builds its `items` payload from it — include it everywhere anyway so
adding/removing a product row never depends on which site you're editing.

## SDS links

Sites link their MSDS/SDS section to PDFs living here rather than hosting their own
copies, so replacing a document in `docs/sds/` updates the link on all four sites at
once — once this repo has a public URL to link to. **That requires standing up a small
deployment (e.g. a Cloudflare Pages project) for this repo, which needs Darren's
explicit go-ahead before it's created**, per the bedliner sites' AGENTS.md rule against
creating Cloudflare resources without approval. Until then, each site keeps a local
copy of the current placeholder PDFs.

## Cutting a new version

1. Make the change here, commit.
2. Tag a release: `git tag vX.Y.Z && git push --tags`.
3. In each site, bump the `bedliner-theme` dependency to the new tag and run
   `npm install && npm run build` to verify, then commit the lockfile/package.json bump.
