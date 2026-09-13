const state = {
  projects: []
};

const $ = (id) => document.getElementById(id);

function setStatus(text) {
  const status = $("saveStatus");
  if (status) status.textContent = text;
}

function showDashboard() {
  $("loginPage").classList.add("hidden");
  $("dashboardPage").classList.remove("hidden");
}

function showLogin() {
  $("dashboardPage").classList.add("hidden");
  $("loginPage").classList.remove("hidden");
}

async function loadSection(section) {
  const { db, doc, getDoc } = window.firebaseAdmin;

  const ref = doc(db, "portfolio", section);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) return null;

  return snapshot.data();
}

async function saveSection(section, data) {
  const { db, doc, setDoc } = window.firebaseAdmin;

  await setDoc(
    doc(db, "portfolio", section),
    data,
    { merge: true }
  );
}


/* =========================
   BACKUP / RESTORE

   Every time a section is saved, whatever was
   there BEFORE the save is copied into a separate
   "portfolioBackup" collection. "Restore Previous"
   pulls that backup into the form fields so you can
   review it before confirming with Save.
========================= */

async function loadBackup(section) {
  const { db, doc, getDoc } = window.firebaseAdmin;

  const ref = doc(db, "portfolioBackup", section);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) return null;

  return snapshot.data();
}

async function backupSection(section) {
  const current = await loadSection(section);

  // Nothing saved yet for this section — nothing to back up.
  if (!current) return;

  const { db, doc, setDoc } = window.firebaseAdmin;

  await setDoc(
    doc(db, "portfolioBackup", section),
    current
  );
}

function fillField(id, value = "") {
  const element = $(id);

  if (element) {
    element.value = value;
  }
}


/* =========================
   FIELD FILLERS
   (shared by initial load and Restore Previous)
========================= */

function fillAboutFields(data) {
  fillField("aboutIntro", data.intro);
  fillField("aboutDescription", data.description);
  fillField("aboutTools", data.workflow);
}

function fillSkillsFields(data) {
  fillField("skillWeb", data.web);
  fillField("skillDesign", data.design);
  fillField("skillTools", data.tools);
}

function fillServicesFields(data) {
  fillField("service1Title", data.service1?.title);
  fillField("service1Description", data.service1?.description);
  fillField("service2Title", data.service2?.title);
  fillField("service2Description", data.service2?.description);
  fillField("service3Title", data.service3?.title);
  fillField("service3Description", data.service3?.description);
}

function fillContactFields(data) {
  fillField("contactEmail", data.email);
  fillField("contactGithub", data.github);
  fillField("contactInstagram", data.instagram);
  fillField("contactRootHub", data.rootHub);
}

function fillProjectsFields(data) {
  state.projects = Array.isArray(data?.items) ? data.items : [];
  renderProjects();
}


function renderProjects() {
  const container = $("projectsContainer");

  if (!container) return;

  container.innerHTML = "";

  state.projects.forEach((project, index) => {

    const wrapper = document.createElement("div");

    wrapper.className = "project-admin";

    wrapper.innerHTML = `
      <div class="project-admin-header">
        <strong>Project ${String(index + 1).padStart(2, "0")}</strong>

        <button
          type="button"
          class="delete-project"
          data-index="${index}"
        >
          Delete
        </button>
      </div>

      <label>Project Name</label>

      <input
        class="project-name"
        type="text"
        value="${escapeHTML(project.name || "")}"
        placeholder="Project name"
      >

      <label>Description</label>

      <textarea
        class="project-description"
        rows="4"
        placeholder="Project description"
      >${escapeHTML(project.description || "")}</textarea>

      <label>Live Website</label>

      <input
        class="project-live"
        type="url"
        value="${escapeHTML(project.live || "")}"
        placeholder="https://example.com"
      >

      <label>GitHub</label>

      <input
        class="project-github"
        type="url"
        value="${escapeHTML(project.github || "")}"
        placeholder="https://github.com/..."
      >

      <label>Tags</label>

      <input
        class="project-tags"
        type="text"
        value="${escapeHTML(project.tags || "")}"
        placeholder="Web, UI, JavaScript"
      >
    `;

    container.appendChild(wrapper);
  });

  document
    .querySelectorAll(".delete-project")
    .forEach(button => {

      button.addEventListener("click", () => {

        const index = Number(button.dataset.index);

        state.projects.splice(index, 1);

        renderProjects();
      });
    });
}

function collectProjects() {
  const cards =
    document.querySelectorAll(".project-admin");

  return Array.from(cards).map(card => ({
    name:
      card.querySelector(".project-name")?.value.trim() || "",

    description:
      card.querySelector(".project-description")?.value.trim() || "",

    live:
      card.querySelector(".project-live")?.value.trim() || "",

    github:
      card.querySelector(".project-github")?.value.trim() || "",

    tags:
      card.querySelector(".project-tags")?.value.trim() || ""
  }));
}

function escapeHTML(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadDashboard() {

  setStatus("Loading...");

  try {

    const about = await loadSection("about");
    if (about) fillAboutFields(about);

    const skills = await loadSection("skills");
    if (skills) fillSkillsFields(skills);

    const services = await loadSection("services");
    if (services) fillServicesFields(services);

    const contact = await loadSection("contact");
    if (contact) fillContactFields(contact);

    const projects = await loadSection("projects");
    fillProjectsFields(projects);

    setStatus("Ready");

  } catch (error) {

    console.error(error);

    setStatus("Error");

    alert(
      "Could not load portfolio data. Check your Firebase configuration and Firestore rules."
    );
  }
}


/* =========================
   LOGIN
========================= */

function setupLogin() {

  $("loginForm").addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();

      const email =
        $("email").value.trim();

      const password =
        $("password").value;

      const message =
        $("loginMessage");

      message.textContent = "";

      try {

        await window.firebaseAdmin
          .signInWithEmailAndPassword(
            window.firebaseAdmin.auth,
            email,
            password
          );

      } catch (error) {

        console.error(error);

        message.textContent =
          "Invalid email or password.";
      }
    }
  );
}


/* =========================
   LOGOUT
========================= */

function setupLogout() {

  $("logoutBtn").addEventListener(
    "click",
    async () => {

      await window.firebaseAdmin.signOut(
        window.firebaseAdmin.auth
      );
    }
  );
}


/* =========================
   SAVE ABOUT
========================= */

function setupAboutSave() {

  document
    .querySelector('[data-section="about"].save-btn')
    .addEventListener("click", async () => {

      setStatus("Saving...");

      try {

        await backupSection("about");

        await saveSection("about", {

          intro:
            $("aboutIntro").value.trim(),

          description:
            $("aboutDescription").value.trim(),

          workflow:
            $("aboutTools").value.trim()
        });

        setStatus("About saved");

      } catch (error) {

        console.error(error);

        setStatus("Save failed");

        alert(
          "Could not save About."
        );
      }
    });
}


/* =========================
   SAVE SKILLS
========================= */

function setupSkillsSave() {

  document
    .querySelector('[data-section="skills"].save-btn')
    .addEventListener("click", async () => {

      setStatus("Saving...");

      try {

        await backupSection("skills");

        await saveSection("skills", {

          web:
            $("skillWeb").value.trim(),

          design:
            $("skillDesign").value.trim(),

          tools:
            $("skillTools").value.trim()
        });

        setStatus("Skills saved");

      } catch (error) {

        console.error(error);

        setStatus("Save failed");

        alert(
          "Could not save Skills."
        );
      }
    });
}


/* =========================
   SAVE SERVICES
========================= */

function setupServicesSave() {

  document
    .querySelector('[data-section="services"].save-btn')
    .addEventListener("click", async () => {

      setStatus("Saving...");

      try {

        await backupSection("services");

        await saveSection("services", {

          service1: {
            title:
              $("service1Title").value.trim(),

            description:
              $("service1Description")
                .value
                .trim()
          },

          service2: {
            title:
              $("service2Title").value.trim(),

            description:
              $("service2Description")
                .value
                .trim()
          },

          service3: {
            title:
              $("service3Title").value.trim(),

            description:
              $("service3Description")
                .value
                .trim()
          }

        });

        setStatus("Services saved");

      } catch (error) {

        console.error(error);

        setStatus("Save failed");

        alert(
          "Could not save Services."
        );
      }
    });
}


/* =========================
   SAVE CONTACT
========================= */

function setupContactSave() {

  document
    .querySelector('[data-section="contact"].save-btn')
    .addEventListener("click", async () => {

      setStatus("Saving...");

      try {

        await backupSection("contact");

        await saveSection("contact", {

          email:
            $("contactEmail").value.trim(),

          github:
            $("contactGithub").value.trim(),

          instagram:
            $("contactInstagram").value.trim(),

          rootHub:
            $("contactRootHub").value.trim()
        });

        setStatus("Contact saved");

      } catch (error) {

        console.error(error);

        setStatus("Save failed");

        alert(
          "Could not save Contact."
        );
      }
    });
}


/* =========================
   PROJECTS
========================= */

function setupProjects() {

  $("addProjectBtn")
    .addEventListener("click", () => {

      state.projects.push({

        name: "",

        description: "",

        live: "",

        github: "",

        tags: ""
      });

      renderProjects();
    });


  $("saveProjectsBtn")
    .addEventListener("click", async () => {

      setStatus("Saving...");

      try {

        await backupSection("projects");

        const projects =
          collectProjects();

        await saveSection("projects", {
          items: projects
        });

        state.projects = projects;

        setStatus("Projects saved");

      } catch (error) {

        console.error(error);

        setStatus("Save failed");

        alert(
          "Could not save Projects."
        );
      }
    });
}


/* =========================
   RESTORE PREVIOUS
========================= */

function setupRestore() {

  document
    .querySelectorAll(".restore-btn")
    .forEach(button => {

      button.addEventListener("click", async () => {

        const section = button.dataset.section;

        setStatus("Loading previous version...");

        try {

          const backup = await loadBackup(section);

          if (!backup) {

            alert(
              "No previous version saved yet. A backup is created automatically the next time you save this section."
            );

            setStatus("Ready");

            return;
          }

          if (section === "about") fillAboutFields(backup);
          else if (section === "skills") fillSkillsFields(backup);
          else if (section === "services") fillServicesFields(backup);
          else if (section === "contact") fillContactFields(backup);
          else if (section === "projects") fillProjectsFields(backup);

          setStatus("Previous version loaded — click Save to confirm");

        } catch (error) {

          console.error(error);

          setStatus("Restore failed");

          alert(
            "Could not load the previous version."
          );
        }
      });
    });
}


/* =========================
   FIREBASE READY
========================= */

window.addEventListener(
  "firebase-ready",
  () => {

    setupLogin();

    setupLogout();

    setupAboutSave();

    setupSkillsSave();

    setupServicesSave();

    setupContactSave();

    setupProjects();

    setupRestore();


    window.firebaseAdmin
      .onAuthStateChanged(
        window.firebaseAdmin.auth,
        async (user) => {

          if (user) {

            showDashboard();

            await loadDashboard();

          } else {

            showLogin();

          }
        }
      );
  }
);
