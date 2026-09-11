# Pita for the Planet

The page at `pita-for-the-planet.html` introduces the offer and places the email form in the hero. Both pages link to it through the gold “Pita for the Planet” navigation item. The Earth rendering starts with North America visible, turns briefly on entry, responds to scrolling, and respects reduced-motion preferences. NASA imagery and the existing Three.js runtime are served locally.

## Required before merging for launch

The mailing-list provider has not been selected or connected. The form deliberately has no action and its handler prevents submission; entering a valid email displays an availability message. It never shows a fake subscription success or stores addresses in the browser. Without JavaScript, the submit button stays disabled and an explanatory message is shown.

Connect the owner's approved signup endpoint, including provider-specific field names, consent settings, spam protection, and duplicate handling. Use a real provider response or confirmation page. A frontend success state must only appear after the provider confirms receipt. Do not place secret API keys in these public assets. Verify a test subscriber in the actual list before merging for launch.

The offer (“we’ll remove 1 kg of CO₂ from the atmosphere in your name”) and clean-food updates were explicitly supplied by the owner. The page does not claim removal happens instantly when the form is submitted.

## Validation

- HTML routes and local asset references; JavaScript syntax.
- Desktop, tablet, and mobile layouts, including navigation between both pages.
- Invalid email handling and a valid-address submission with no provider configured: no request, no success state, no address in the URL.
- Globe rendering, default North America view, static fallback, and console errors.
- QR code decoded from the final single-sticker PDF and all nine labels on the Letter sheet.

A separate public test URL is used by the temporary packaging sticker. Replace that QR destination with the permanent Zeus Bakery URL before a production print run.
