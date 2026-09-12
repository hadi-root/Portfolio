/* =========================================================
   HADI PORTFOLIO — PUBLIC CONTENT LOADER
   Reads data saved from the admin dashboard (Firestore)
   and injects it into the live site. Read-only: no login
   required, no writes happen from this file.
========================================================= */

import { initializeApp }
  from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";

import {
  getFirestore,
  doc,
  getDoc
}
from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyBUBGAWZ7sdQ8rnyMN9uhng9P6InAjnzYs",
  authDomain: "hadi-portfolio-236ef.firebaseapp.com",
  projectId: "hadi-portfolio-236ef",
  storageBucket: "hadi-portfolio-236ef.firebasestorage.app",
  messagingSenderId: "417673820671",
  appId: "1:417673820671:web:f798cf24a9394135b44fca"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const $ = (id) => document.getElementById(id);


/* =========================================================
   HELPERS
========================================================= */

function setText(id, value) {
  const element = $(id);
  if (element && value) {
    element.textContent = value;
  }
}

function splitList(value) {
  return String(value || "")
    .split(",")
    .map(item => item.trim())
    .filter(Boolean);
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function initials(name) {
  const words = String(name || "").trim().split(/\s+/).filter(Boolean);

  if (!words.length) return "•";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return (words[0][0] + words[1][0]).toUpperCase();
}


/* =========================================================
   SKILLS
========================================================= */

function renderSkills(containerId, value) {
  const container = $(containerId);
  const items = splitList(value);

  // If admin hasn't saved this yet, leave the existing fallback content alone.
  if (!container || !items.length) return;

  container.innerHTML = items
    .map(skill => `<span class="skill">${escapeHTML(skill)}</span>`)
    .join("");
}


/* =========================================================
   PROJECTS
========================================================= */

function renderProjects(items) {
  const grid = $("projectsGrid");
  const countLabel = $("projectsCount");

  // If no projects saved yet, keep the existing static cards as a fallback.
  if (!Array.isArray(items) || !items.length) return;

  if (grid) {
    grid.innerHTML = items.map((project, index) => {

      const tags = splitList(project.tags);
      const number = String(index + 1).padStart(2, "0");

      const liveBtn = project.live
        ? `<a href="${escapeHTML(project.live)}" target="_blank" rel="noopener noreferrer" class="project-btn live" aria-label="Open ${escapeHTML(project.name)} live website">◉ Live Website</a>`
        : "";

      const githubBtn = project.github
        ? `<a href="${escapeHTML(project.github)}" target="_blank" rel="noopener noreferrer" class="project-btn" aria-label="Open ${escapeHTML(project.name)} GitHub repository">&lt;/&gt; GitHub</a>`
        : "";

      return `
        <article class="project-card reveal">
          <div class="project-glow"></div>

          <div class="project-top">
            <span class="project-number">PROJECT / ${number}</span>
            <span class="project-arrow">↗</span>
          </div>

          <div class="project-content">
            <div class="project-icon">${escapeHTML(initials(project.name))}</div>
            <h3 class="project-title">${escapeHTML(project.name || "Untitled Project")}</h3>
            <p class="project-description">${escapeHTML(project.description || "")}</p>

            <div class="project-tags">
              ${tags.map(tag => `<span class="project-tag">${escapeHTML(tag)}</span>`).join("")}
            </div>
          </div>

          <div class="project-actions">
            ${liveBtn}
            ${githubBtn}
          </div>
        </article>
      `;
    }).join("");
  }

  if (countLabel) {
    const count = String(items.length).padStart(2, "0");
    countLabel.textContent = `${count} Project${items.length === 1 ? "" : "s"}`;
  }
}


/* =========================================================
   CONTACT
========================================================= */

function renderContact(contact) {
  if (!contact) return;

  if (contact.email) {
    setText("contactEmailText", contact.email);
    const link = $("contactEmailLink");
    if (link) link.href = `mailto:${contact.email}`;
  }

  if (contact.github) {
    setText("contactGithubText", contact.github.replace(/^https?:\/\//, ""));
    const link = $("contactGithubLink");
    if (link) link.href = contact.github;
  }

  if (contact.instagram) {
    const handle = contact.instagram.replace(/\/$/, "").split("/").pop();
    setText("contactInstagramText", handle ? `@${handle}` : contact.instagram);
    const link = $("contactInstagramLink");
    if (link) link.href = contact.instagram;
  }

  if (contact.rootHub) {
    const handle = contact.rootHub.replace(/\/$/, "").split("/").pop();
    setText("contactRootHubText", handle ? `@${handle}` : contact.rootHub);
    const link = $("contactRootHubLink");
    if (link) link.href = contact.rootHub;
  }
}


/* =========================================================
   LOAD
========================================================= */

async function loadSection(section) {
  try {
    const snapshot = await getDoc(doc(db, "portfolio", section));
    return snapshot.exists() ? snapshot.data() : null;
  } catch (error) {
    console.error(`Could not load "${section}" from Firestore:`, error);
    return null;
  }
}

async function loadPublicContent() {

  const [about, skills, contact, projects] = await Promise.all([
    loadSection("about"),
    loadSection("skills"),
    loadSection("contact"),
    loadSection("projects")
  ]);

  if (about) {
    setText("dataAboutIntro", about.intro);
    setText("dataAboutDescription", about.description);
    setText("dataAboutWorkflow", about.workflow);
  }

  if (skills) {
    renderSkills("skillsWeb", skills.web);
    renderSkills("skillsDesign", skills.design);
    renderSkills("skillsTools", skills.tools);
  }

  renderContact(contact);
  renderProjects(projects?.items);

  // Tell script.js the real content is in place, so the loader
  // screen can safely be dismissed without a flash of old content.
  window.dispatchEvent(new Event("portfolio-content-ready"));
}

loadPublicContent();
