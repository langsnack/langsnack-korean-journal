# Langsnack Korean Journal — Complete Rebuild

This folder is the clean replacement package for the GitHub repository.

## Included files

- `index.html` — student journal
- `submit.html` — submission preparation
- `submission.html` — student submission and feedback
- `history.html` — student submission history
- `teacher-dashboard.html` — teacher correction dashboard
- `shared.css` — shared design and responsive layout
- `shared.js` — shared state, editor and timezone-aware date helpers
- `timezone-picker.js` — complete browser-supported IANA timezone selector
- `backend-journal-submissions.web.js` — Wix CMS backend example
- `WIX_SETUP.md` — Wix production setup
- `UPLOAD_TO_GITHUB.md` — exact deployment steps

## Important product decisions included

- “어떤 부분을 중점적으로 볼까요?” is removed.
- The only optional extra field is a short note for Nicole.
- Students can edit while status is `pending`.
- Clicking `첨삭 시작` changes status to `reviewing` and locks the student copy.
- The teacher can save a draft, complete and return, reopen or delete.
- Every page uses the same language and timezone controls.
- Dates render in the selected IANA timezone.
- The selected timezone is remembered.
- Timezones automatically follow daylight-saving rules.

## Local demo versus production

The GitHub frontend currently uses browser `localStorage` as a demo data store.
That means student and teacher records are visible only in the same browser.

For real student-to-teacher use across different devices, connect the pages to
the included Wix backend web module and CMS collection.
