# Acid Goblin

[Enter Goblin Town](https://technicallytechnicaldesign.github.io/ACIDGOBLIN/)

Goblins, gossip, a rummage yard, postcards, zines, an Oracle, and free prints. Start at the Town map and follow whichever door looks suspicious.

## Source layout

- `index.html`: the Town map and entry point.
- `places/`: the Bookshop, Newsstand, Oracle, Yard, Well, Post Office, Merch, and zines; each place owns its page and local assets.
- `assets/`: shared styles, scripts, Town artwork, and newspapers.
- `tools/`: publishing, checks, and development notes.

The workspace checkout uses this same layout. Source studies, prompts, and print masters stay in the workspace project.

## Run and publish

Serve this folder with any static web server to preview the source. There are no runtime packages to install.

For publishing, run `npm ci --prefix tools`, then `node tools/build-site.cjs _site`. The output directory must be empty. Run `python tools/tests/check_town.py` to check the source, or pass `_site` to check the built site.

GitHub Actions builds and deploys on each push to `main`. The published pages retain their original URLs, including `/bookshop/`, `/mushroom-post-office/`, artwork, and PDF downloads. Source paths are organized for editing; the build restores the public layout.
