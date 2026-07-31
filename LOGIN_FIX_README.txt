LANGSNACK NOTEBOOK V3.5.1 LOGIN FIX

Why it previously looked like nothing happened:
- journal.langsnack.com is hosted on GitHub Pages.
- Wix login can only open from the Wix page that embeds the Notebook.
- When opened directly, there was no Wix parent page to receive the login request.

This version:
- Removes the hard-coded Jennifer fallback.
- Shows a neutral greeting for guests.
- Keeps Save visible, but clicking it asks the guest to log in.
- Clicking Save, Get feedback, or Log in redirects direct visitors to:
  https://www.langsnack.com/journal
- When embedded in Wix, it still uses postMessage and opens Wix login normally.
- Guest writing is temporary and is not restored after refresh.

IMPORTANT:
If your private Wix Notebook page uses a different URL, open shared.js and change:
const WIX_NOTEBOOK_URL = "https://www.langsnack.com/journal";
