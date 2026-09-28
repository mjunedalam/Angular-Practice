# Well Profile implementation

Goal: implement the approved construction-review mock as a separate authenticated page.
Architecture: standalone OnPush page, local NgRx Signals store, Angular SVG templates with pure geometry, existing Material and AG Grid dependencies.
Design reference: well-construction-review.html in the conversation visualization directory.
Constraints: preserve existing staged work; explicitly label supplied schematic as reference data; no invented live integration; retain correct nesting, shoe anchors, liner start and completion overlap.

1. Test geometry and depth-reading boundaries and animation state.
2. Implement reference data using existing casing fields, projection helpers, store, SVG diagram and interval component.
3. Implement Material controls, themed inspector and AG Grid casing program.
4. Register lazy route and sidebar item.
5. Run focused Jest, lint and Angular build; inspect the rendered feature where possible.
