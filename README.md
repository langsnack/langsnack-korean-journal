
# Langsnack Full Timezone Upgrade

This upgrade changes the short timezone list into a complete IANA timezone selector.

## What it does

- Loads every IANA timezone supported by the student's browser
- Detects the student's current timezone automatically
- Groups zones by region
- Displays the current UTC offset
- Sorts zones by current UTC offset
- Handles daylight-saving time automatically
- Saves the selected timezone in localStorage
- Keeps `Asia/Seoul` as a safe fallback
- Works without calling an external timezone API

## Installation

### 1. Add an identifier to your existing timezone `<select>`

Use either:

```html
<select id="timezoneSelect"></select>
```

or:

```html
<select data-timezone-select></select>
```

The script also detects these existing IDs:

- `timezone`
- `timeZone`
- `timezoneSelect`
- `time-zone`

### 2. Upload `timezone-picker.js`

Place it in the same GitHub folder as `index.html`.

### 3. Load it near the bottom of `index.html`

Add this immediately before `</body>`:

```html
<script src="timezone-picker.js"></script>
```

Load it before any code that relies on the selected timezone, or listen for the custom event shown below.

## Reading the selected timezone

```javascript
const selectedTimeZone =
  localStorage.getItem("langsnackTimeZone") ||
  Intl.DateTimeFormat().resolvedOptions().timeZone ||
  "Asia/Seoul";
```

## Reacting when the timezone changes

```javascript
window.addEventListener("langsnack:timezone-change", (event) => {
  const selectedTimeZone = event.detail.timeZone;

  // Re-render the Korean date, calendar, streak and entry dates here.
  renderDate(selectedTimeZone);
  renderCalendar(selectedTimeZone);
  renderEntries(selectedTimeZone);
});
```

## Important

Store timezone **names**, such as:

```text
Asia/Seoul
America/New_York
Europe/London
Australia/Sydney
```

Do not store only fixed offsets such as `UTC+09:00`.

IANA names automatically follow local daylight-saving rules. For example,
New York changes between UTC−05:00 and UTC−04:00 depending on the date.
