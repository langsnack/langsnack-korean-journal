LANGSNACK NOTEBOOK — FINAL WORKING RUNTIME FIX

The previous build relied on the browser automatically creating JavaScript
variables from HTML element IDs. Wix embeds do not reliably support that.

This version:
- explicitly binds every required page element
- preserves the approved design
- preserves Wix CMS and login code
- preserves the Korean date picker
- preserves the Teacher Dashboard
- adds a visible error message if a future runtime problem occurs
- uses new cache-busting URLs so the browser does not reuse the old scripts

UPLOAD:
Delete the current GitHub website files and upload everything from this ZIP root.
Do not upload the wix-code folder as public website code. Paste its contents into Wix.
