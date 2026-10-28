# Project photo descriptions

`assets/project-gallery.js` is the single source for the title, summary and
expanded description of each photo. Gallery cards, specialty captions and the
shared viewer use that record. Gallery filters use the categories in the
verified source records: seven cuisine photos, two salle-de-bain photos and
one buanderie photo. No projects are invented to fill a filter.

## Evidence and attribution (28 October 2026)

All twelve photo sources were visually inspected in full. Statements about
visible arrangement do not prove installation authorship or hidden work.

| Photo | Basis and limits |
| --- | --- |
| salle-bain-vasque.webp | Diego explicitly states the bath was already present and the glass bath screen, vanity/basin, shower equipment and mirror were added, with the rest of this room arranged. The grey tiled room and black framed bath screen identify this photo. This fact is not applied to other bathrooms. No specific hidden work or material claimed. |
| salle-bain-vasque-douche.webp | Different visible setting: veined wall, vanity drawers, mirror and tall cabinet. Described visually only; no claim of shared chronology with the grey bathroom. |
| douche-marbre.webp | Visible tray, glazed enclosure and shower equipment. “Décor veiné” describes appearance, not actual marble. No hidden waterproofing or installation claim. |
| buanderie-plan-travail.webp | Diego requests emphasis on adaptation to the existing space. Visible worktop above washing machine and adjacent open storage support this description. No claim of custom manufacture or appliance installation. |
| cuisine-blanche-plan-bois.webp | Visible L-shaped worktop, sink, white cabinets, oven. No solid-wood material claim. |
| cuisine-renovee-angle.webp | Visible continuous worktop around corner, sink on long side, hob/oven on return, high/low cabinets. |
| cuisine-renovee-marbre.webp | Veined worktop/backsplash appearance, dark sink/hob, oven and tall unit. No actual marble claim. |
| cuisine-ouverte-sejour.webp | Kitchen corner, worktop, sink, cooking column, dining area and circulation visible. |
| kitchenette-blanche.webp | Sink and hob on compact worktop, high/low units and tall unit beside window. |
| cuisine-bois-blanc.webp | Long pale worktop, oven and wood-look cabinet fronts; sink not visible in this angle and not claimed. |
| cuisine-lineaire-angle.webp | Two facing runs; sink/cooking area visible opposite long worktop; central passage. |
| cuisine-plan-travail-ilot.webp | Visible base units and separate worktop elements along walls/under window. Despite filename, no island, installed sink or completed project claimed. |

No dates, prices, warranties, qualifications, before/after pairs, hidden plumbing,
electrical work, waterproofing or custom manufacture have been inferred.

## Interaction

The viewer is shared by gallery and the four photo-bearing specialty pages.
Descriptions are below/beside the image, never on top of it. Its close header
stays outside the scrollable content. Escape, focus return and keyboard trapping
are retained; the rest of the page is inert only while the viewer is open.
The original photo remains a normal link without JavaScript.
Filters are explicit buttons with pressed state and a live result count. The
allowlisted `categorie` query preserves selection on reload/back. Closing a
photo does not change its filter. Without JavaScript, all gallery cards remain
visible; no empty filter controls are shown. There is no next/previous viewer
control that could silently cross categories.
