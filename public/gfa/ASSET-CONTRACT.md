# GFA original illustration contract — Section 1

Educational text stays in HTML. Do not bake Thai or English teaching sentences into artwork.
Do not use approved North Star posters as a single flattened webpage image.

Place original files in this folder. Preferred raster: WebP. Also accepted: PNG or SVG with the same basename.

Do not download commercial art. Do not copy other brands or characters.

## PRODUCTION FREEZE

The five named WebPs below are present and frozen as Section 1 Visual Master v1 production art. Do not regenerate, recompress, or rename them.

## Directory

```
public/gfa/
  characters/
  scenes/
  props/
```

## ASSET_1

NAME=bai-tong-explaining
PATH=`/gfa/characters/bai-tong-explaining.webp`
PURPOSE=main learning companion
RECOMMENDED_ASPECT=5:6
TRANSPARENT_BACKGROUND=YES
DESKTOP_ROLE=large visual anchor beside mission and grammar board (~300–430px tall)
MOBILE_ROLE=readable companion above teaching panels (~200–220px)
TEXT_INSIDE_ASSET=NO
QUALITY=full-body Bai Tong; approved GFA identity; explaining pose; branding details OK; do not crop face/head/hands

## ASSET_2

NAME=habit-walk-to-school
PATH=`/gfa/scenes/habit-walk-to-school.webp`
PURPOSE=teach repeated routine
CONTENT=child or Bai Tong walking toward GFA school in morning garden; recognizable repeated routine
TEXT_INSIDE_ASSET=NO
RECOMMENDED_ASPECT=16:10
DESKTOP_ROLE=right-column teaching panel
MOBILE_ROLE=full-width teaching panel after grammar board
QUALITY=scene only; no sentence text; no Thai explanation; no UI card; no progress indicator

## ASSET_3

NAME=general-truth-sunrise-east
PATH=`/gfa/scenes/general-truth-sunrise-east.webp`
PURPOSE=teach general truth
CONTENT=sunrise over landscape; east/dawn visually understandable without letters if possible
TEXT_INSIDE_ASSET=NO
RECOMMENDED_ASPECT=16:10
DESKTOP_ROLE=right-column teaching panel
MOBILE_ROLE=full-width teaching panel under habit
QUALITY=scene only; no sentence text; no Thai explanation; no UI; avoid baked-in EAST unless strictly decorative

## ASSET_4

NAME=everyday-garden-background
PATH=`/gfa/scenes/everyday-garden-background.webp`
PURPOSE=world atmosphere for ลานเขียวอิสระ / สวนกิจวัตร
TEXT_INSIDE_ASSET=NO
RECOMMENDED_ASPECT=16:9
DESKTOP_ROLE=full-bleed world behind UI
MOBILE_ROLE=soft atmosphere behind stacked layout
TRANSPARENT_BACKGROUND=NO
QUALITY=Green Freedom Grounds; school/garden/path/greenery; quiet space for HTML overlays; no text; no required character; no lesson UI

## ASSET_5 (optional)

NAME=lunch-support
PATH=`/gfa/props/lunch-support.webp`
PURPOSE=support strip for remaining Section 1 example (We eat lunch at noon.)
TEXT_INSIDE_ASSET=NO
RECOMMENDED_ASPECT=1:1
DESKTOP_ROLE=small cue beside HTML sentence
MOBILE_ROLE=same, compact
QUALITY=lunch / noon concept; no instructional text; transparent preferred

## Fallbacks until files exist

- All slots: `GfaArtSlot` shows `รอภาพต้นฉบับ GFA` (or empty transparent for background)
- Do not draw replacement scenes with CSS rectangles, SVG houses/trees, or geometric Bai Tong
- Geometric `GfaCharacter` SVG is not Section 1 production art

Do not bake progress, titles, English sentences, Thai teaching copy, or fake buttons into illustrations.

ART = visual meaning. HTML = grammar authority.

The current `workshop-he-she-it` scene is an approved prototype-era exception with baked labels. Do not regenerate it in this freeze.

Future Sections 4–8 production art must avoid baked instructional grammar text. HTML remains grammar authority; art shows people, places, and actions.
