# Town journeys

This pass turns the town into connected small visits: a rumour can lead to a discovery, an invention can become a card, and keepers notice what a visitor has found.

## Shared grammar, different materials

Every place offers Crossroads, Other doors, and Your pocket. Bookshop and Newsstand keep their editorial layouts; the Yard uses scraps and wood, the Well pond colours, the Post Office a plum counter with drawers, Merch a print stall, and Trippa compact transparent controls.

The first crossing follows an illustrated lantern through the mist. Return journeys use a short crossing. Reduced motion gives a static arrival; the skip button works while artwork loads. The arrival=1 query replays the full entrance for visual review.

## Adding a discovery

Add a stable ID, name, story, existing art reference, clue and place to TownJourney.secrets in town-journey.js. Attach a keyboard-operable hotspot to something in the world. Clues should describe a particular object; they should not expose a rewards checklist.

Give Wisp a rumour with that ID and a matching rumour query. Add a keeper greeting for both hearing and finding it. Discovery messages and pocket contents use text nodes rather than rendering stored strings as HTML.

The pocket is local to this browser. Failed or malformed storage does not stop a visit. Secret and invention links carry a validated ID, so a souvenir can still arrive on a card without a stored pocket.

## Sending something to Dot

- Yard: mushroom-post-office/?invention=0 through 27.
- Discoveries: mushroom-post-office/?souvenir=bookmark, mushroom, or star.
- Oracle: mushroom-post-office/?oracle=latest, with the final charm and completed reading saved by the Oracle.

An import adds its object once and preserves the rest of the scene. Generated notes can be replaced by the next generated note; handwritten messages stay intact. Existing numeric catalog slots remain stable for saved drafts. New discoveries are appended after the existing objects.

PNG and interactive gift export continue to use the exact preview canvas. Trippa retains its standalone offline instrument; its navigation can return to the public town.

## Checks

Run python tests/check_town.py for script compilation, missing assets and IDs, all 28 recipe-to-keepsake mappings, and malformed/blocked journey storage.

Browser verification should include: first/return/skip arrivals, keyboard discoveries and dialog dismissal, Wisp-to-Moss acknowledgement, invention-to-card import, preserved handwritten notes, reload without duplicate objects, completed Oracle handoff, PNG/HTML export, and phone layouts.
