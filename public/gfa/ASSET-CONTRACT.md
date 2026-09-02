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

ART = VISUAL MEANING + WORLD STORYTELLING.
HTML = GRAMMAR AUTHORITY.

Environmental / world-building text may exist in artwork (location names, booth names, wayfinding, school branding, short interaction cues, approved Wh clue labels). Artwork must not become the source of grammar formulas, Verb 1 rules, Do/Does structures, short-answer formulas, assessed example sentences, or ✓/✗ contrasts.

The current `workshop-he-she-it` scene is an approved prototype-era exception with baked labels. Do not regenerate it in this freeze.

Frozen Sections 1–4 production files are unchanged by this refinement.

## SECTION_4

NAME=bai-tong-pause-guide
PATH=`/gfa/characters/bai-tong-pause-guide.webp`
PURPOSE=gentle pause / not-now companion in Quiet Shelter lead
RECOMMENDED_ASPECT=5:6
TRANSPARENT_BACKGROUND=YES
DESKTOP_ROLE=small companion in the lead/mission area only
MOBILE_ROLE=compact companion; must not dominate the screen
TEXT_INSIDE_ASSET=NO
QUALITY=Bai Tong pause-guide; open-palm not-now gesture; no baked grammar

## SECTION_4_SCENE

NAME=quiet-shelter-not-doing
PATH=`/gfa/scenes/quiet-shelter-not-doing.webp`
PURPOSE=visual cue for “ไม่ได้ทำ”
CONTENT=shaded garden pavilion; idle football; children resting/waiting; school path; sleeping cat
TEXT_INSIDE_ASSET=NO
RECOMMENDED_ASPECT=16:10
DESKTOP_ROLE=framed world stage, object-fit contain, no HTML over artwork
MOBILE_ROLE=full-width contained scene; do not cover-crop
QUALITY=scene only; no sentence text; no Thai grammar; no ✓/✗; no lesson heading

## SECTION_5

NAME=bai-tong-question-guide
PATH=`/gfa/characters/bai-tong-question-guide.webp`
PURPOSE=friendly interviewer / question guide in Question Booth lead
RECOMMENDED_ASPECT=5:6
TRANSPARENT_BACKGROUND=YES
DESKTOP_ROLE=small companion in the lead/mission area only
MOBILE_ROLE=compact companion; must not dominate the screen
TEXT_INSIDE_ASSET=NO
QUALITY=Bai Tong holding a blank ticket; inviting gesture; no instructional grammar

## SECTION_5_SCENE

NAME=question-booth-ask-answer
PATH=`/gfa/scenes/question-booth-ask-answer.webp`
PURPOSE=visual ASK → LISTEN → ANSWER at the garden Question Booth
CONTENT=wooden booth; girl and boy exchanging a blank ticket; waiting queue; lush garden path; school world
WORLD_STORYTELLING_TEXT=YES
ALLOWED_ENVIRONMENTAL_TEXT=QUESTION BOOTH; Ask Listen Answer; ANSWER TICKETS; GFA / Green Freedom Academy; garden/classroom/playground wayfinding
FORBIDDEN_GRAMMAR_AUTHORITY=Do/Does formulas; Verb 1 rules; assessed example questions; short-answer formulas; ✓/✗
RECOMMENDED_ASPECT=16:10
DESKTOP_ROLE=framed world stage, object-fit contain, no HTML over artwork
MOBILE_ROLE=full-width contained scene; do not cover-crop faces, booth, ticket, or signs

## SECTION_6

NAME=bai-tong-clue-guide
PATH=`/gfa/characters/bai-tong-clue-guide.webp`
PURPOSE=trail explorer / curiosity guide in Clue Trail lead
RECOMMENDED_ASPECT=5:6
TRANSPARENT_BACKGROUND=YES
DESKTOP_ROLE=small companion in the lead/mission area only
MOBILE_ROLE=compact companion; must not dominate the screen
TEXT_INSIDE_ASSET=NO
QUALITY=full-body Bai Tong; GFA green/cream; backpack; map; magnifying glass; pointing toward the trail; cheerful explorer; not detective/crime styling

## SECTION_6_SCENE

NAME=clue-trail-garden
PATH=`/gfa/scenes/clue-trail-garden.webp`
PURPOSE=visual Clue Trail in Everyday Garden; curiosity / follow-the-clues world
CONTENT=bright garden trail; CLUE TRAIL entrance; Question Booth visible behind; winding path; children/exploration; daylight; green / cream / honey
WORLD_STORYTELLING_TEXT=YES
ALLOWED_ENVIRONMENTAL_TEXT=CLUE TRAIL; อยากรู้อะไร?; What? Where? When? Why? Who? How?; Follow the clues; GFA / garden wayfinding; Question Booth continuity
FORBIDDEN_GRAMMAR_AUTHORITY=Wh + do/does formula; Verb 1 rule; keep/keeps correction; full assessed example questions; ✓ / ✗ grammar correction; How often
RECOMMENDED_ASPECT=16:10
DESKTOP_ROLE=framed world stage, object-fit contain, no HTML over artwork
MOBILE_ROLE=full-width contained scene; do not cover-crop entrance, clue markers, booth, or path

## SECTION_7

NAME=bai-tong-clock-guide
PATH=`/gfa/characters/bai-tong-clock-guide.webp`
PURPOSE=time keeper / routine guide in Clock Garden lead
RECOMMENDED_ASPECT=5:6
TRANSPARENT_BACKGROUND=NO
DESKTOP_ROLE=small companion in the lead/mission area only
MOBILE_ROLE=compact companion; must not dominate the screen
TEXT_INSIDE_ASSET=NO
QUALITY=full-body Bai Tong; holding a round clock; pointing; GFA green/cream; not detective styling

## SECTION_7_SCENE

NAME=clock-garden-routines
PATH=`/gfa/scenes/clock-garden-routines.webp`
PURPOSE=visual Clock Garden; when and how often routines happen
CONTENT=giant garden clock; CLOCK GARDEN arch; Morning → Evening sky path; children in daily routines; weekday signpost; lush garden
WORLD_STORYTELLING_TEXT=YES
ALLOWED_ENVIRONMENTAL_TEXT=CLOCK GARDEN; MORNING; EVENING; weekday names; garden wayfinding
FORBIDDEN_GRAMMAR_AUTHORITY=Subject + adverb + Verb; How often formula; adverb position rule; usually/finish contrast; at/on/in formulas; frequency percentages; assessed example sentences; ✓ / ✗
RECOMMENDED_ASPECT=16:10
DESKTOP_ROLE=framed world stage, object-fit contain, no HTML over artwork
MOBILE_ROLE=full-width contained scene; do not cover-crop clock, arch, morning/evening, routines, or weekday signpost

