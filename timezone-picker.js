
/**
 * Langsnack full timezone selector
 *
 * Uses the browser's current IANA timezone database through:
 * Intl.supportedValuesOf("timeZone")
 *
 * Compatible element IDs:
 *   #timezone
 *   #timeZone
 *   #timezoneSelect
 *   #time-zone
 *
 * Or add: data-timezone-select
 */
(() => {
  "use strict";

  const STORAGE_KEY = "langsnackTimeZone";
  const SELECTORS = [
    "[data-timezone-select]",
    "#timezone",
    "#timeZone",
    "#timezoneSelect",
    "#time-zone"
  ];

  // Used only in older browsers that do not support Intl.supportedValuesOf().
  // This fallback covers the main inhabited IANA zones learners are likely to use.
  const FALLBACK_TIMEZONES = [
    "Africa/Abidjan","Africa/Accra","Africa/Addis_Ababa","Africa/Algiers",
    "Africa/Cairo","Africa/Casablanca","Africa/Dar_es_Salaam","Africa/Harare",
    "Africa/Johannesburg","Africa/Kampala","Africa/Khartoum","Africa/Lagos",
    "Africa/Maputo","Africa/Nairobi","Africa/Tripoli","Africa/Tunis",
    "America/Adak","America/Anchorage","America/Argentina/Buenos_Aires",
    "America/Asuncion","America/Barbados","America/Bogota","America/Caracas",
    "America/Chicago","America/Costa_Rica","America/Denver","America/Detroit",
    "America/Edmonton","America/El_Salvador","America/Guatemala","America/Halifax",
    "America/Havana","America/Indiana/Indianapolis","America/Jamaica",
    "America/La_Paz","America/Lima","America/Los_Angeles","America/Manaus",
    "America/Mexico_City","America/Monterrey","America/Montevideo",
    "America/New_York","America/Panama","America/Phoenix","America/Port_of_Spain",
    "America/Puerto_Rico","America/Regina","America/Santiago","America/Santo_Domingo",
    "America/Sao_Paulo","America/St_Johns","America/Tegucigalpa","America/Tijuana",
    "America/Toronto","America/Vancouver","America/Winnipeg",
    "Asia/Almaty","Asia/Amman","Asia/Baghdad","Asia/Bahrain","Asia/Baku",
    "Asia/Bangkok","Asia/Beirut","Asia/Brunei","Asia/Colombo","Asia/Dhaka",
    "Asia/Dubai","Asia/Hong_Kong","Asia/Ho_Chi_Minh","Asia/Jakarta",
    "Asia/Jerusalem","Asia/Kabul","Asia/Karachi","Asia/Kathmandu","Asia/Kolkata",
    "Asia/Kuala_Lumpur","Asia/Kuwait","Asia/Macau","Asia/Manila","Asia/Muscat",
    "Asia/Phnom_Penh","Asia/Qatar","Asia/Riyadh","Asia/Seoul","Asia/Shanghai",
    "Asia/Singapore","Asia/Taipei","Asia/Tashkent","Asia/Tbilisi","Asia/Tehran",
    "Asia/Tokyo","Asia/Ulaanbaatar","Asia/Vientiane","Asia/Yangon",
    "Atlantic/Azores","Atlantic/Bermuda","Atlantic/Canary","Atlantic/Reykjavik",
    "Australia/Adelaide","Australia/Brisbane","Australia/Darwin","Australia/Hobart",
    "Australia/Melbourne","Australia/Perth","Australia/Sydney",
    "Europe/Amsterdam","Europe/Athens","Europe/Belgrade","Europe/Berlin",
    "Europe/Brussels","Europe/Bucharest","Europe/Budapest","Europe/Copenhagen",
    "Europe/Dublin","Europe/Helsinki","Europe/Istanbul","Europe/Kyiv",
    "Europe/Lisbon","Europe/London","Europe/Madrid","Europe/Moscow",
    "Europe/Oslo","Europe/Paris","Europe/Prague","Europe/Riga","Europe/Rome",
    "Europe/Sofia","Europe/Stockholm","Europe/Tallinn","Europe/Vienna",
    "Europe/Vilnius","Europe/Warsaw","Europe/Zurich",
    "Indian/Maldives","Indian/Mauritius","Indian/Reunion",
    "Pacific/Auckland","Pacific/Chatham","Pacific/Fiji","Pacific/Guam",
    "Pacific/Honolulu","Pacific/Noumea","Pacific/Port_Moresby","Pacific/Tahiti",
    "Pacific/Tongatapu","UTC"
  ];

  const REGION_ORDER = [
    "Automatic",
    "Asia",
    "Australia",
    "Europe",
    "Africa",
    "America",
    "Pacific",
    "Atlantic",
    "Indian",
    "Antarctica",
    "Arctic",
    "Other"
  ];

  function getSelect() {
    for (const selector of SELECTORS) {
      const element = document.querySelector(selector);
      if (element instanceof HTMLSelectElement) return element;
    }
    return null;
  }

  function getBrowserTimeZone() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || "Asia/Seoul";
    } catch {
      return "Asia/Seoul";
    }
  }

  function getAllTimeZones() {
    try {
      if (typeof Intl.supportedValuesOf === "function") {
        return Intl.supportedValuesOf("timeZone");
      }
    } catch {
      // Continue to fallback.
    }

    return FALLBACK_TIMEZONES;
  }

  function getRegion(zone) {
    if (zone === "UTC" || zone.startsWith("Etc/")) return "Other";
    const region = zone.split("/")[0];
    return REGION_ORDER.includes(region) ? region : "Other";
  }

  function getOffsetMinutes(zone, date = new Date()) {
    try {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: zone,
        hour12: false,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }).formatToParts(date);

      const values = {};
      for (const part of parts) {
        if (part.type !== "literal") values[part.type] = Number(part.value);
      }

      // Some engines format midnight as hour 24.
      if (values.hour === 24) values.hour = 0;

      const asUTC = Date.UTC(
        values.year,
        values.month - 1,
        values.day,
        values.hour,
        values.minute,
        values.second
      );

      return Math.round((asUTC - date.getTime()) / 60000);
    } catch {
      return 0;
    }
  }

  function formatOffset(minutes) {
    const sign = minutes >= 0 ? "+" : "-";
    const absolute = Math.abs(minutes);
    const hours = String(Math.floor(absolute / 60)).padStart(2, "0");
    const mins = String(absolute % 60).padStart(2, "0");
    return `UTC${sign}${hours}:${mins}`;
  }

  function friendlyName(zone) {
    if (zone === "UTC") return "UTC";
    const pieces = zone.split("/");
    const city = pieces[pieces.length - 1].replaceAll("_", " ");
    const area = pieces.slice(0, -1).join(" / ").replaceAll("_", " ");
    return area ? `${city} — ${area}` : city;
  }

  function optionLabel(zone, now) {
    return `${formatOffset(getOffsetMinutes(zone, now))} · ${friendlyName(zone)}`;
  }

  function sortZones(zones, now) {
    return [...new Set(zones)].sort((a, b) => {
      const offsetDifference = getOffsetMinutes(a, now) - getOffsetMinutes(b, now);
      if (offsetDifference !== 0) return offsetDifference;
      return friendlyName(a).localeCompare(friendlyName(b), "en");
    });
  }

  function populateTimeZones(select) {
    const now = new Date();
    const detectedZone = getBrowserTimeZone();
    const storedZone = localStorage.getItem(STORAGE_KEY);
    const existingValue = select.value;

    const zones = getAllTimeZones();
    if (!zones.includes("UTC")) zones.push("UTC");
    if (!zones.includes(detectedZone)) zones.push(detectedZone);

    select.innerHTML = "";

    const automaticGroup = document.createElement("optgroup");
    automaticGroup.label = "Automatic";

    const automaticOption = document.createElement("option");
    automaticOption.value = detectedZone;
    automaticOption.textContent = `Detected: ${optionLabel(detectedZone, now)}`;
    automaticOption.dataset.automatic = "true";
    automaticGroup.appendChild(automaticOption);
    select.appendChild(automaticGroup);

    const grouped = {};
    for (const zone of zones) {
      const region = getRegion(zone);
      (grouped[region] ||= []).push(zone);
    }

    for (const region of REGION_ORDER.slice(1)) {
      const regionZones = grouped[region];
      if (!regionZones?.length) continue;

      const group = document.createElement("optgroup");
      group.label = region;

      for (const zone of sortZones(regionZones, now)) {
        const option = document.createElement("option");
        option.value = zone;
        option.textContent = optionLabel(zone, now);
        group.appendChild(option);
      }

      select.appendChild(group);
    }

    const preferred = [storedZone, existingValue, detectedZone, "Asia/Seoul"]
      .find(zone => zone && [...select.options].some(option => option.value === zone));

    select.value = preferred || detectedZone;
    localStorage.setItem(STORAGE_KEY, select.value);

    // Make the selected timezone available to existing journal code.
    window.langsnackTimeZone = select.value;

    select.addEventListener("change", () => {
      localStorage.setItem(STORAGE_KEY, select.value);
      window.langsnackTimeZone = select.value;

      window.dispatchEvent(new CustomEvent("langsnack:timezone-change", {
        detail: { timeZone: select.value }
      }));
    });
  }

  function init() {
    const select = getSelect();

    if (!select) {
      console.warn(
        "Langsnack timezone selector not found. " +
        "Add id=\"timezoneSelect\" or data-timezone-select to the <select>."
      );
      return;
    }

    populateTimeZones(select);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
