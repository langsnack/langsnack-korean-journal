# Replace the GitHub repository

## 1. Back up the current repository

Download the current repository as a ZIP before replacing anything.

## 2. Remove obsolete frontend files

Remove these old files if they still exist:

- `teacher.html`
- `review.html`
- `index(10).html`
- old duplicate timezone snippets

## 3. Upload these files to the repository root

Upload every file from this package except the Wix backend file:

- `index.html`
- `submit.html`
- `submission.html`
- `history.html`
- `teacher-dashboard.html`
- `shared.css`
- `shared.js`
- `timezone-picker.js`
- `README.md`

The files must all be in the same root folder.

## 4. Do not rename index.html

It must be exactly:

`index.html`

Not:

- `index(10).html`
- `Index.html`
- `index.html.html`

## 5. Commit the changes

Suggested commit message:

`Rebuild journal dashboard and add full timezone support`

## 6. Refresh GitHub Pages

After the commit finishes:

- macOS: `Command + Shift + R`
- Windows: `Ctrl + Shift + R`

## 7. Wix backend

Do not upload `backend-journal-submissions.web.js` to GitHub Pages.

In Wix Velo, create:

`backend/journal-submissions.web.js`

Then paste the contents of that file there.
