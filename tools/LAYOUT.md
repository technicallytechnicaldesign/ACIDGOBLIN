# Source and public paths

Source directories are organized for editing. The publishing build preserves existing public addresses without redirects.

| Source | Public |
|---|---|
| `places/<place>/` | `<place>/` |
| `assets/town/` | `town-assets/` |
| `assets/newspapers/` | `gobbo-weekly/` |
| `assets/styles/<file>.css` | `<file>.css` |
| `assets/scripts/<file>.js` | `<file>.js` |

Keep place IDs, storage keys, asset catalog order, and public links stable. Preview the source before committing, then check the build with `python tools/tests/check_town.py _site`.

New Town stops belong in `places/`. Shared artwork belongs in `assets/town/`. Place-only artwork stays with its place. Add a new stop to the URL bridge in `assets/scripts/town-journey.js` if older journey calls use its public path.
