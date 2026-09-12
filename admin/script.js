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

function fillField(id, value = "") {
  const element = $(id);

  if (element) {
    element.value = value;
  }
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

    if (about) {

      fillField("aboutIntro", about.intro);

      fillField(
        "aboutDescription",
        about.description
      );

      fillField(
        "aboutTools",
        about.workflow
      );
    }


    const skills = await loadSection("skills");

    if (skills) {

      fillField("skillWeb", skills.web);

      fillField(
        "skillDesign",
        skills.design
      );

      fillField(
        "skillTools",
        skills.tools
      );
    }


    const services = await loadSection("services");

    if (services) {

      fillField(
        "service1Title",
        services.service1?.title
      );

      fillField(
        "service1Description",
        services.service1?.description
      );

      fillField(
        "service2Title",
        services.service2?.title
      );

      fillField(
        "service2Description",
        services.service2?.description
      );

      fillField(
        "service3Title",
        services.service3?.title
      );

      fillField(
        "service3Description",
        services.service3?.description
      );
    }


    const contact = await loadSection("contact");

    if (contact) {

      fillField(
        "contactEmail",
        contact.email
      );

      fillField(
        "contactGithub",
        contact.github
      );

      fillField(
        "contactInstagram",
        contact.instagram
      );

      fillField(
        "contactRootHub",
        contact.rootHub
      );
    }


    const projects = await loadSection("projects");

    state.projects =
      Array.isArray(projects?.items)
        ? projects.items
        : [];

    renderProjects();

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
    .querySelector('[data-section="about"]')
    .addEventListener("click", async () => {

      setStatus("Saving...");

      try {

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
    .querySelector('[data-section="skills"]')
    .addEventListener("click", async () => {

      setStatus("Saving...");

      try {

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
    .querySelector('[data-section="services"]')
    .addEventListener("click", async () => {

      setStatus("Saving...");

      try {

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
    .querySelector('[data-section="contact"]')
    .addEventListener("click", async () => {

      setStatus("Saving...");

      try {

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
