# Wix setup for real student-to-teacher use

## 1. Create a CMS collection

Collection ID:

`JournalSubmissions`

Recommended fields:

| Field | Type |
|---|---|
| memberId | Text |
| studentName | Text |
| studentEmail | Text |
| studentHtml | Rich text or Text |
| studentPlain | Text |
| studentNote | Text |
| teacherHtml | Rich text or Text |
| teacherNote | Text |
| status | Text |
| submittedAt | Date and time |
| studentUpdatedAt | Date and time |
| reviewStartedAt | Date and time |
| teacherUpdatedAt | Date and time |
| completedAt | Date and time |

Use backend functions to protect teacher fields. Do not give ordinary members permission to update `teacherHtml`, `teacherNote`, or `status`.

## 2. Email notification to Nicole

The easiest no-code route is Wix Automations:

1. Open the Wix dashboard.
2. Go to **Automations**.
3. Create a new automation.
4. Choose the CMS trigger **Item added**.
5. Select the `JournalSubmissions` collection.
6. Add the action **Send an email**.
7. Set the recipient to Nicole/site owner, not the submitting contact.
8. Include dynamic fields such as student name, email, submitted time and submission ID.
9. Turn off “trigger once per person” so repeat submissions still notify you.

This sends you an email whenever a new collection item is created.

Suggested subject:

`New Korean journal submission: {{studentName}}`

Suggested email body:

`{{studentName}} submitted a new Korean journal for review.`
`Submission ID: {{_id}}`
`Submitted: {{submittedAt}}`
`Status: {{status}}`

## 3. Student editing rule

Allow editing only while:

`status === "pending"`

As soon as the teacher clicks **첨삭 시작**, change it to:

`reviewing`

The student page then becomes read-only. This prevents the original changing while you are correcting it.

## 4. Teacher dashboard security

The teacher dashboard must be placed on a members-only page restricted to your administrator role.

Students must never receive direct collection permissions that expose other students’ records.

## 5. Returning completed work

When the teacher clicks **첨삭 완료 및 학생에게 보내기**:

- save `teacherHtml`
- save `teacherNote`
- set status to `completed`
- set `completedAt`
- optionally use a second Wix Automation or Triggered Email to notify that specific student

## Included backend example

See:

`backend-journal-submissions.web.js`

It shows the collection insert, student pending-edit check and student history query.
