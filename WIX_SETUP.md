# Wix production setup

## 1. Create the CMS collection

Collection ID:

`JournalSubmissions`

Create these fields:

| Field | Type |
|---|---|
| memberId | Text |
| studentName | Text |
| studentEmail | Text |
| studentHtml | Rich text or Text |
| studentPlain | Text |
| studentNote | Text |
| timeZone | Text |
| teacherHtml | Rich text or Text |
| teacherNote | Text |
| status | Text |
| submittedAt | Date and time |
| studentUpdatedAt | Date and time |
| reviewStartedAt | Date and time |
| teacherUpdatedAt | Date and time |
| completedAt | Date and time |

Use restrictive collection permissions. Students should not directly update
teacher fields or other students' records.

## 2. Add the backend web module

In Wix Velo create:

`backend/journal-submissions.web.js`

Paste in the included backend file.

The student methods use `Permissions.SiteMember`.
Teacher methods use `Permissions.Admin`.

## 3. Submission email to Nicole

In Wix Automations:

1. Create an automation.
2. Choose the CMS trigger `Item added`.
3. Select `JournalSubmissions`.
4. Add `Send an email`.
5. Send it to the site owner/Nicole.
6. Include student name, email, submission ID and submitted time.
7. Allow repeat triggers so the same student can submit more than once.

Suggested subject:

`New Korean journal submission: {{studentName}}`

## 4. Completed-review email to the student

Create another automation for an item update where status becomes `completed`,
or use a Wix triggered email after `completeReview()` succeeds.

## 5. Teacher dashboard security

Place the teacher dashboard on a page restricted to site admins or your
designated teacher role. Do not expose it as a normal public student page.

## 6. Current frontend adapter

The HTML package still uses localStorage for a working standalone demo.
The next production step is replacing the localStorage calls in `shared.js`
with calls to the Wix web methods.
