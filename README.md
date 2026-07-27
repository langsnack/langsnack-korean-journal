# Langsnack Korean Journal

A responsive, aesthetic Korean journal prototype for Langsnack.

## Included

- Korean writing area
- Starter, Beginner, Intermediate and Advanced levels
- Korean topic generator
- Korean prompt generator
- Korean grammar generator
- Local draft saving
- Writing streak
- Monthly activity calendar
- Achievements
- Previous entry history
- Package-based review availability
- Teacher submission via Formspree or email

## Setup

Open `index.html` in a browser.

In the `CONFIG` object near the bottom of `index.html`, change:

```js
const CONFIG = {
  teacherEmail: "YOUR_EMAIL@example.com",
  packageEndDate: "2026-12-31",
  formspreeEndpoint: ""
};
```

### Email option

Replace `YOUR_EMAIL@example.com` with your email address. The student's email app will open with the journal already filled in.

### Formspree option

Create a Formspree form and paste its endpoint into `formspreeEndpoint`. This submits directly without opening the student's email app.

Example:

```js
formspreeEndpoint: "https://formspree.io/f/xxxxxxxx"
```

## Important for the paid version

This prototype stores entries in the student's browser using `localStorage`. For a real paid public product, connect it to:

- Wix Members or another authentication system
- A database such as Supabase or Firebase
- A secure teacher dashboard
- Server-side package expiry checks
- Proper payment and access control

The current package end date is only a front-end demonstration and can be edited by anyone with browser developer tools.


## Version 2 additions

- Mobile-first sticky Save and Submit controls
- Larger touch targets and improved phone layout
- Student-selectable time zone
- Time-zone-aware dates, streaks and entry dates
- Fillable circular monthly streak calendar
- Circular month completion indicator
- 17 achievements with progress bars
- Achievement progress and unlock count
