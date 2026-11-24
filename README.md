# PRSNABLE site (draft)

Front-door site for PRSNABLE, built in the MasterCallers visual system (dark, Inter, hairline cards) at Terrence's direction on 2026-11-24: the consumer front door, a personal agent per member, the rooms, and the course as the teaching layer.

**To make live on GitHub Pages:**
1. Go to https://github.com/SpeakerRealm/prsnable-site/settings/pages
2. Under Build and deployment, select Source: Deploy from a branch
3. Branch: main, folder: / (root)
4. Save

Once enabled, the preview will be at:
https://speakerrealm.github.io/prsnable-site/

Draft until Terrence approves. Domain prsnable.com is registered (Cloudflare) but not yet connected; the DNS step happens when Terrence rules on the launch.

Build notes:
- Pages: index (front door + rooms), agent, course, diagnostic, about, start.
- The diagnostic carries the 12 questions from the October PRSNL build verbatim. It is self-contained: answers stay on the visitor's device, and the closing screen shows one honest line drawn from the first answer. The full read is built with the member's agent at start; nothing on this page pretends otherwise.
- The start form composes the visitor's answers into an email in their own mail app (to hello@speakerrealm.com) until the real intake endpoint is ruled. The button says what it does, and the fine print says nothing sends until they press send.
- No prices appear anywhere: PRSNABLE pricing is unruled.
- No em dashes in the site copy written for this build (the diagnostic's original question wording is unchanged).
