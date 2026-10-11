# Acid Goblin

[Enter Goblin Town](https://technicallytechnicaldesign.github.io/ACIDGOBLIN/)

A questionable goblin platform for testing some proc-gen ideas / scripts for actual projects (not goblin related). 
It contains of: goblins, gossip, a rummage yard, postcards, zines, and a fortune telling Oracle. Follow whichever path looks the most suspicious.

## Source layout

- `index.html`: the Town map and entry point.
- `places/`: the Bookshop, Newsstand, Oracle, Yard, Well, Post Office, and zines.
- `assets/`: shared styles, scripts, Town artwork, and newspapers.
- `tools/`: publishing, checks, and development notes.

## Run and publish notes

Serve this folder with any static web server to preview the source. There are no runtime packages to install.

For publishing, run `npm ci --prefix tools`, then `node tools/build-site.cjs _site`. The output directory must be empty. Run `python tools/tests/check_town.py` to check the source, or pass `_site` to check the built site.

GitHub Actions builds and deploys on each push to `main`. The published pages retain their original URLs, including `/bookshop/`, `/mushroom-post-office/`, artwork, and PDF downloads. Source paths are organized for editing; the build restores the public layout.
