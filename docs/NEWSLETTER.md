# Pita for the Planet 2027

The page at `pita-for-the-planet.html` introduces the mission and launch offer, with the email form in the hero. Both pages link to it through the gold “Pita for the Planet 2027” navigation item. Earth makes one full turn on entry, returns to the East Coast view, and spins on click, tap, Enter, or Space. Valid form submission triggers a brief smile and bounce; it acknowledges the interaction without claiming a subscription was saved. Reduced motion disables the entrance and bounce animations and uses a static change of view for direct activation. NASA imagery and the existing Three.js runtime are served locally.

## Required before merging for launch

The mailing-list provider has not been selected or connected. The form deliberately has no action and its handler prevents submission; entering a valid email displays an availability message. It never shows a fake subscription success or stores addresses in the browser. Without JavaScript, the submit button stays disabled and an explanatory message is shown.

Connect the owner's approved signup endpoint, including provider-specific field names, consent settings, spam protection, and duplicate handling. Use a real provider response or confirmation page. A frontend success state must only appear after the provider confirms receipt. Do not place secret API keys in these public assets. Verify a test subscriber in the actual list before merging for launch.

The offer (“we’ll remove 1 kg of CO₂ from the atmosphere in your name”) and clean-food updates were explicitly supplied by the owner. The page does not claim removal happens instantly when the form is submitted.

## Carbon removal fulfillment plan

The How it works section describes a future 2027 campaign, not an existing provider agreement. It explicitly says the removal partner and delivery schedule are being finalized. Before launching:

- Select independently verified carbon removal with a known delivery schedule, and publish the provider and timing. Completed, issued removal credits would make delivery easier to explain than a promise of future removal. Avoided-emissions credits do not fulfill this removal promise.
- Count each new, confirmed subscription once. Keep a private record allocating 1 kg per eligible signup; do not publish subscriber names or emails.
- Buy removal in batches and retire the corresponding credits so they cannot be sold or claimed again. Keep purchased, delivered, retired, and allocated quantities distinct. Ensure the wording “in your name” matches the provider's beneficiary and allocation rules.
- Share the supported projects, quantity, delivery status, and verification or retirement evidence. A signup or purchase alone is not proof of completed removal.

Planning references checked September 11, 2026: [Charm's purchase page](https://charmindustrial.com/buy) lists $600 per tonne plus a $10 per tonne verification fee (about $0.61 per signup before any other costs). [Climeworks' technology portfolio](https://climeworks.com/actnow) lists $500 per tonne, but allows delivery within seven years following the purchase year. These are reference prices, not a selected provider or purchase. [Isometric's registry guide](https://docs.isometric.com/user-guides/registry/introduction) explains the record of removals, issuance, and retirement.

## Validation

- HTML routes and local asset references; JavaScript syntax.
- Desktop, tablet, and mobile layouts, including navigation between both pages.
- Invalid email handling and a valid-address submission with no provider configured: no request, no success state, no address in the URL.
- Globe rendering, default North America view, click and keyboard interaction, valid-input celebration, static fallback, and console errors.
- QR code decoded from the final single-sticker PDF and all nine labels on the Letter sheet.

A separate public test URL is used by the temporary packaging sticker. Replace that QR destination with the permanent Zeus Bakery URL before a production print run.
