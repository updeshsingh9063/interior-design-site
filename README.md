# Anaya Interiors

A seven-page marketing site for a residential interior design studio. Static
HTML, CSS and vanilla JavaScript with no build step, no framework and no
dependencies.

## Pages

| Page | File | Contents |
| --- | --- | --- |
| Home | `index.html` | Hero, introduction, key services, featured projects, why choose us, testimonials, enquiry |
| About | `about.html` | Company introduction, experience timeline, vision and approach, areas served |
| Services | `services.html` | Seven service details, process, FAQ |
| Projects | `projects.html` | Completed projects, a project in detail, before/after comparison |
| Gallery | `gallery.html` | Filterable grid by room, with a lightbox |
| Testimonials | `testimonials.html` | Client reviews |
| Contact | `contact.html` | Contact details, enquiry form, map, FAQ |

`design-system.html` is a living style guide documenting the foundations and
every component. It is marked `noindex` and is not linked from the site.

## Structure

```
assets/
  css/
    tokens.css        design tokens - the single source of truth
    base.css          reset, typography, layout primitives, utilities
    components.css    reusable components
    sections.css      page-section composition
    design-system.css style-guide chrome only, not shipped behaviour
  js/
    main.js           all interaction, one file, no dependencies
  img/                photography
```

Stylesheets load in that order and each depends only on the ones above it.

## Design system

The brand rule is that **everything is a rectangle** - border radius is forced
to `0` globally in `base.css` and nothing can opt out. The palette is a single
warm hue family from espresso to warm white.

Two tokens, `--c-mocha` and `--c-sand`, are fill-only and must never carry
small text; text-safe siblings `--c-mocha-tx` and `--c-sand-lt` exist for that.
Every text pairing the site actually uses meets WCAG AA, and the contrast
matrix in the style guide is computed live from the tokens so the
documentation cannot drift from the code.

Components read semantic colour roles rather than raw palette values, so
dropping one onto a dark band re-skins it automatically without a variant class.

## Accessibility

- Every text pairing in use meets WCAG AA (4.5:1).
- Visible focus ring on everything interactive; minimum 44px touch targets.
- A skip link precedes the header on every page.
- `prefers-reduced-motion` collapses all animation and reveals every element.
- Reveal animations are gated behind a `js` class set inline in `<head>`, so if
  the script fails the content renders visible rather than being stranded
  behind an animation that never runs.

## Deployment

A static site with `index.html` at the repository root. Vercel, Netlify and
GitHub Pages all serve it as-is with no build command and no output directory.

## Before going live

- Replace the brand name, phone number, email and address, which are
  placeholders throughout.
- Wire the enquiry forms to a mail handler or CRM. They currently validate in
  the browser and confirm in place without sending anywhere.
- The photography is now the studio's own project work. Source PNGs live in
  `images by client/`, which is excluded from git and from the deploy. See
  `CREDITS.md` for the slot-to-source mapping and the conversion settings.
- The before and after slider on the Projects page is not yet genuine. The
  supplied set contains one mid-build photograph and no matched pairs, so the
  two comparisons show different rooms at different angles. Either supply a
  before and an after of the same room from the same position, or remove the
  section.
- Four walkthrough videos were supplied and are not used. They are vertical
  phone recordings, 576x1024 and 63 to 97 seconds, roughly 46MB in total.
  Serving them unprocessed would cost more than the rest of the site combined,
  so they need compressing and probably trimming, or hosting on YouTube and
  embedding, before they go anywhere near a page.
- Project names, floor areas, locations and years are still invented
  placeholders. The images are now real but the captions around them are not.
