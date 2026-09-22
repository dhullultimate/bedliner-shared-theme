# bedliner-theme

Shared Eleventy chrome (layout, CSS, nav JS) and canonical SDS documents for the four
Ultimate Linings OEM bedliner-repair clone sites: Toyotabedliner, Setoyotabedliner,
Fordbedlinerrepair, Gmbedlinerrepair. Visual reference is Toyotabedliner.

## What lives here

- `includes/base.njk` — the canonical Eleventy layout (header/nav/hero-adjacent/footer).
  Nav links come from each site's own `nav` data (see below). A language switcher
  renders only when a site's `_data/site.js` sets `site.langSwitcher`.
- `assets/css/style.css` — the canonical design system (colors, type, header, hero,
  sections, forms, buttons, footer). One set of class names across all four sites.
- `assets/js/main.js` — nav toggle + language-switcher toggle. (Order-form JS is
  **not** shared — each site's order-parts page markup differs enough that its form
  script stays local to that repo.)
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
npm `prebuild` step, which copies `base.njk` / `style.css` / `main.js` into the site's
own `src/_includes` / `src/assets`. Until this repo is pushed to GitHub, the script
falls back to a sibling checkout at `../bedliner-shared-theme` for local dev.

Each site's own data (`_data/nav.json` or equivalent) must provide a `nav` array of
`{ href, label }` items for the header, matching the schema `base.njk` expects.

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
