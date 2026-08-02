# Langsnack Notebook V6 — Direct Review Email

This version does **not** use Wix Automations.

The flow is:

Student submits  
→ Wix CMS saves the writing  
→ Nicole completes the review  
→ backend code calls `triggeredEmails.emailMember()`  
→ Wix emails the student

There is no Automation Builder, automation payload, Velo code trigger, or automation trigger ID.

A Wix **Triggered Email template** still has an **Email ID**. The backend needs this ID to know which email design to send.

---

## 1. Delete or deactivate the unfinished automation

Go to:

Wix Dashboard → Automations

Delete or leave these inactive:

- New Notebook Submission
- Notebook Review Completed

They are no longer used.

You can also uninstall these packages if you installed them only for this project:

- `@wix/automations`
- `@wix/essentials`

The new backend uses Wix's built-in `wix-crm-backend` module.

---

## 2. Open Triggered Emails

In Wix, go to:

Developer Tools → Triggered Emails

This is separate from Automations.

Click:

`+ New Campaign`

Create an email for **site members**.

Suggested name:

`Langsnack Review Ready`

---

## 3. Design the email

Suggested subject:

`Your Langsnack writing feedback is ready`

Suggested message:

Hi [studentName],

Your writing feedback is ready.

Log in to Langsnack Notebook and open My Work to read Nicole's correction, explanation, and discussion thread.

Review completed: [completedAt]

View your feedback:
[feedbackUrl]

Thank you for your patience.

Nicole  
Langsnack

### Add these variables exactly

Use **Add Variable** inside the Wix email editor:

- `studentName`
- `completedAt`
- `feedbackUrl`
- `submissionId`

Suggested fallback values:

- studentName → `there`
- completedAt → `just now`
- feedbackUrl → `https://www.langsnack.com/journal`
- submissionId → leave blank or use `your submission`

For the button URL, use the `feedbackUrl` variable if Wix allows a variable as the link. Otherwise, link the button directly to:

`https://www.langsnack.com/journal`

---

## 4. Publish the Triggered Email

The email must be **published**, not saved only as a draft.

Add sender details:

- Sender name: `Nicole from Langsnack`
- Reply-to: your preferred Langsnack email

An authenticated domain email is better for deliverability than a Gmail address.

---

## 5. Copy the Email ID

After publishing, choose:

`Email site members`

Wix displays a code snippet similar to:

```js
triggeredEmails.emailMember(
  "yourEmailId",
  memberId,
  {
    variables: {
      studentName: "Student",
      completedAt: "2026년 8월 2일",
      feedbackUrl: "https://www.langsnack.com/journal",
      submissionId: "abc123"
    }
  }
);
```

Copy the first value:

```js
"yourEmailId"
```

That is the **Triggered Email ID**, not an Automation trigger ID.

---

## 6. Update the backend file

Open your Wix backend file:

`backend/notebook-notifications.web.js`

Replace:

```js
const REVIEW_READY_EMAIL_ID = "PASTE_REVIEW_READY_EMAIL_ID";
```

with your real ID:

```js
const REVIEW_READY_EMAIL_ID = "your-real-email-id";
```

Keep the quotation marks.

---

## 7. Replace the Wix files

Use these V6 files:

- `backend-notebook-notifications.web.js`
- `WIX_TEACHER_DASHBOARD_PAGE_CODE.js`
- `WIX_STUDENT_JOURNAL_PAGE_CODE.js`

The student page code no longer tries to email Nicole after every submission.

---

## 8. Publish and test

Triggered Emails and Wix Members should be tested on the **published site**, not only in Preview.

Test with a real test member:

1. Log in through the published Wix Journal page.
2. Submit a writing.
3. Confirm the CMS record contains a `memberId`.
4. Open the private Wix Teacher Dashboard.
5. Start the review.
6. Add a correction and teacher note.
7. Click Complete / Return to student.
8. Check the test member's inbox and spam folder.

If the review saves but no email arrives:

- confirm the Triggered Email is published
- confirm the Email ID is correct
- confirm the CMS record has `memberId`
- confirm the student is a Wix site member
- confirm the Wix site itself is published
- check the browser and Wix logs for an email error

---

## Files that do not need changing

No changes are required to:

- `index.html`
- `shared.css`
- `shared.js`
- `history.html`
- `saved.html`
- `submit.html`
- `submission.html`
- `teacher-dashboard.html`
- CMS collection fields

Only the Wix notification/page-code layer changes.
