// Demo Frontend for Kursanmeldung – ready to connect to Power Automate HTTP endpoints.

// ===== Configuration =====
const CONFIG = {
  DEMO_MODE: true, // true = no network calls, simulate responses
  API_COURSES_URL: "", // e.g. https://prod-.../courses
  API_SIGNUP_URL: "",  // e.g. https://prod-.../signup
};

// Demo course data (matches the recommended GET /courses payload)
const DEMO_COURSES = [
  {
    courseId: "A25-TEST-01",
    title: "Kurs A – Pilates",
    start: "2025-10-01T18:00:00Z",
    units: 10,
    durationMin: 90,
    capacity: 12,
    location: "Turnhalle",
    leaderName: "Max Muster",
    leaderEmail: "max.muster@example.com",
    prices: {
      mitglied: { VOLL: 120.0, HALB: 70.0 },
      nichtMitglied: { VOLL: 160.0, HALB: 95.0 }
    }
  },
  {
    courseId: "B25-TEST-01",
    title: "Kurs B – Rückenkurs",
    start: "2025-10-03T19:00:00Z",
    units: 8,
    durationMin: 60,
    capacity: 10,
    location: "Studio 1",
    leaderName: "Erika Beispiel",
    leaderEmail: "erika.beispiel@example.com",
    prices: {
      mitglied: { VOLL: 99.0, HALB: 59.0 },
      nichtMitglied: { VOLL: 139.0, HALB: 85.0 }
    }
  },
  {
    courseId: "C25-TEST-01",
    title: "Kurs C – Fitness",
    start: "2025-10-06T17:00:00Z",
    units: 12,
    durationMin: 45,
    capacity: 14,
    location: "Mehrzweckraum",
    leaderName: "Tom Trainer",
    leaderEmail: "tom.trainer@example.com",
    prices: {
      mitglied: { VOLL: 89.0, HALB: 55.0 },
      nichtMitglied: { VOLL: 129.0, HALB: 79.0 }
    }
  }
];

// ===== Utilities =====
const $ = (sel) => document.querySelector(sel);
const fmtEUR = (n) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(n);
const toDateStr = (iso) => {
  const d = new Date(iso);
  return d.toLocaleString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

function ibanNormalize(iban) { return String(iban || "").replace(/\s+/g, "").toUpperCase(); }

// Basic IBAN validation (mod-97 check)
function isValidIBAN(iban) {
  const s = ibanNormalize(iban);
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{10,30}$/.test(s)) return false;
  const rearranged = s.slice(4) + s.slice(0, 4);
  let numeric = "";
  for (const ch of rearranged) {
    if (/[A-Z]/.test(ch)) numeric += (ch.charCodeAt(0) - 55).toString();
    else numeric += ch;
  }
  let remainder = 0;
  for (let i = 0; i < numeric.length; i += 7) {
    const chunk = String(remainder) + numeric.substring(i, i + 7);
    remainder = Number(chunk) % 97;
  }
  return remainder === 1;
}

// ===== App State =====
let COURSES = [];
let selectedCourse = null;

// ===== Init =====
window.addEventListener("DOMContentLoaded", async () => {
  try {
    if (!CONFIG.DEMO_MODE && CONFIG.API_COURSES_URL) {
      const res = await fetch(CONFIG.API_COURSES_URL, { method: "GET" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      COURSES = await res.json();
    } else {
      COURSES = DEMO_COURSES;
    }
  } catch (e) {
    console.error("Konnte Kurse nicht laden, falle zurück auf Demo:", e);
    COURSES = DEMO_COURSES;
  }

  populateCourseSelect();
  bindEvents();
  updatePrice();
});

function populateCourseSelect() {
  const sel = $("#course");
  sel.innerHTML = "";
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "– bitte Kurs wählen –";
  sel.appendChild(placeholder);

  for (const c of COURSES) {
    const opt = document.createElement("option");
    opt.value = c.courseId;
    opt.textContent = `${c.title}`;
    sel.appendChild(opt);
  }
}

function bindEvents() {
  $("#course").addEventListener("change", () => {
    const cid = $("#course").value;
    selectedCourse = COURSES.find(c => c.courseId === cid) || null;
    renderCourseDetails();
    updatePrice();
  });

  document.querySelectorAll("input[name='membership']").forEach(el => el.addEventListener("change", updatePrice));
  document.querySelectorAll("input[name='extent']").forEach(el => el.addEventListener("change", updatePrice));

  $("#submitBtn").addEventListener("click", onSubmit);
  $("#resetBtn").addEventListener("click", onReset);
}

function renderCourseDetails() {
  const box = $("#courseDetails");
  if (!selectedCourse) { box.innerHTML = ""; return; }
  box.innerHTML = `
    <div><strong>Start:</strong> ${toDateStr(selectedCourse.start)} • <strong>Einheiten:</strong> ${selectedCourse.units} × ${selectedCourse.durationMin} Min</div>
    <div><strong>Ort:</strong> ${selectedCourse.location} • <strong>Leitung:</strong> ${selectedCourse.leaderName}</div>
  `;
}

function readMembership() {
  return document.querySelector("input[name='membership']:checked")?.value === "mitglied" ? "mitglied" : "nichtMitglied";
}
function readExtent() {
  return document.querySelector("input[name='extent']:checked")?.value || "VOLL";
}

function updatePrice() {
  const priceEl = $("#price");
  if (!selectedCourse) { priceEl.textContent = "–"; return; }
  const membership = readMembership(); // "mitglied" or "nichtMitglied"
  const extent = readExtent();         // "VOLL" or "HALB"
  const p = selectedCourse?.prices?.[membership]?.[extent];
  priceEl.textContent = (typeof p === "number") ? fmtEUR(p) : "–";
}

function showMessage(text, ok = false) {
  const msg = $("#message");
  msg
