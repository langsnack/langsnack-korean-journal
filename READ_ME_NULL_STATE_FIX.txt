LANGSNACK NOTEBOOK — NULL STORAGE FIX

Root cause found from the browser console:

TypeError: Cannot read properties of null (reading 'entries')
at getJournalState()

An older browser session contained:
langsnackJournalState = null

The previous parser treated JSON null as valid and then attempted to read
null.entries. That stopped the page before buttons were initialized.

This build:
- safely handles null, empty and malformed storage values
- validates that journal state is an object
- uses a new shared.js cache version
- keeps the existing design, Wix code and CMS setup unchanged

Upload all ZIP-root website files to GitHub.
The wix-code folder does not need to be replaced for this particular fix.
