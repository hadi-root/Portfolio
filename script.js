/* =========================================================
   HADI PORTFOLIO
   Main JavaScript
========================================================= */

"use strict";


/* =========================================================
   DOM READY
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

  initLoader();
  initNavigation();
  initScrollEffects();
  initRevealAnimations();
  initSmoothScrolling();

});


/* =========================================================
   LOADER
========================================================= */

function initLoader() {

  const loader =
    document.getElementById("loader");

  if (!loader) {
    document.body.classList.remove("loading");
    return;
  }


  const finishLoading = () => {

    loader.classList.add("loaded");

    document.body.classList.remove("loading");

    setTimeout(() => {

      loader.remove();

    }, 800);

  };


  const windowLoaded = new Promise((resolve) => {

    if (document.readyState === "complete") {
      resolve();
    } else {
      window.addEventListener("load", resolve, { once: true });
    }

  });


  // Waits for the Firestore content to be injected into the page
  // (see firebase-content.js) so visitors never see a flash of
  // stale/placeholder text. Falls back after 4s in case Firestore
  // is slow or unreachable, so the loader never hangs forever.
  const contentReady = new Promise((resolve) => {

    window.addEventListener(
      "portfolio-content-ready",
      resolve,
      { once: true }
    );

    setTimeout(resolve, 4000);

  });


  Promise.all([windowLoaded, contentReady]).then(() => {
    setTimeout(finishLoading, 400);
  });

}


/* =========================================================
   MOBILE NAVIGATION
========================================================= */

function initNavigation() {

  const menuBtn =
    document.getElementById("menuBtn");

  const navLinks =
    document.getElementById("navLinks");

  if (!menuBtn || !navLinks) {
    return;
  }


  const closeMenu = () => {

    navLinks.classList.remove("open");

    menuBtn.setAttribute(
      "aria-expanded",
      "false"
    );

    menuBtn.setAttribute(
      "aria-label",
      "Open navigation menu"
    );

    menuBtn.textContent = "☰";

  };


  const openMenu = () => {

    navLinks.classList.add("open");

    menuBtn.setAttribute(
      "aria-expanded",
      "true"
    );

    menuBtn.setAttribute(
      "aria-label",
      "Close navigation menu"
    );

    menuBtn.textContent = "✕";

  };


  menuBtn.addEventListener(
    "click",
    () => {

      const isOpen =
        navLinks.classList.contains("open");

      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }

    }
  );


  navLinks
    .querySelectorAll("a")
    .forEach(link => {

      link.addEventListener(
        "click",
        closeMenu
      );

    });


  document.addEventListener(
    "click",
    event => {

      const clickedInsideNav =
        navLinks.contains(event.target);

      const clickedButton =
        menuBtn.contains(event.target);

      if (
        !clickedInsideNav &&
        !clickedButton
      ) {
        closeMenu();
      }

    }
  );


  window.addEventListener(
    "resize",
    () => {

      if (window.innerWidth > 700) {
        closeMenu();
      }

    }
  );

}


/* =========================================================
   HEADER SCROLL EFFECT
========================================================= */

function initScrollEffects() {

  const header =
    document.getElementById("header");

  if (!header) {
    return;
  }


  const updateHeader = () => {

    if (window.scrollY > 35) {

      header.classList.add(
        "scrolled"
      );

    } else {

      header.classList.remove(
        "scrolled"
      );

    }

  };


  updateHeader();


  window.addEventListener(
    "scroll",
    updateHeader,
    {
      passive: true
    }
  );

}


/* =========================================================
   REVEAL ANIMATIONS
========================================================= */

function initRevealAnimations() {

  const elements =
    document.querySelectorAll(".reveal");

  if (!elements.length) {
    return;
  }


  if (
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
  ) {

    elements.forEach(element => {
      element.classList.add("visible");
    });

    return;
  }


  const observer =
    new IntersectionObserver(
      entries => {

        entries.forEach(entry => {

          if (
            entry.isIntersecting
          ) {

            entry.target.classList.add(
              "visible"
            );

            observer.unobserve(
              entry.target
            );

          }

        });

      },
      {
        threshold: 0.12,
        rootMargin:
          "0px 0px -50px 0px"
      }
    );


  elements.forEach(
    element => {
      observer.observe(element);
    }
  );

}


/* =========================================================
   SMOOTH INTERNAL NAVIGATION
========================================================= */

function initSmoothScrolling() {

  const links =
    document.querySelectorAll(
      'a[href^="#"]'
    );


  links.forEach(link => {

    link.addEventListener(
      "click",
      event => {

        const href =
          link.getAttribute("href");

        if (
          !href ||
          href === "#"
        ) {
          return;
        }


        const target =
          document.querySelector(href);

        if (!target) {
          return;
        }


        event.preventDefault();


        const header =
          document.getElementById("header");


        const headerHeight =
          header
            ? header.offsetHeight
            : 0;


        const targetPosition =
          target.getBoundingClientRect().top +
          window.scrollY -
          headerHeight;


        window.scrollTo({
          top: Math.max(
            targetPosition,
            0
          ),
          behavior: "smooth"
        });


        if (
          window.history &&
          window.history.replaceState
        ) {

          window.history.replaceState(
            null,
            "",
            href
          );

        }

      }
    );

  });

}


/* =========================================================
   PROJECT CARD MICRO INTERACTION
========================================================= */

document.addEventListener(
  "mousemove",
  event => {

    if (
      window.innerWidth < 800
    ) {
      return;
    }


    const cards =
      document.querySelectorAll(
        ".project-card"
      );


    cards.forEach(card => {

      if (
        !card.matches(":hover")
      ) {
        return;
      }


      const rect =
        card.getBoundingClientRect();


      const x =
        event.clientX -
        rect.left;


      const y =
        event.clientY -
        rect.top;


      const rotateX =
        ((y / rect.height) - 0.5) * -2;


      const rotateY =
        ((x / rect.width) - 0.5) * 2;


      card.style.transform =
        `translateY(-7px)
         perspective(900px)
         rotateX(${rotateX}deg)
         rotateY(${rotateY}deg)`;

    });

  }
);


/* =========================================================
   RESET PROJECT CARD TRANSFORM
========================================================= */

document
  .querySelectorAll(".project-card")
  .forEach(card => {

    card.addEventListener(
      "mouseleave",
      () => {

        card.style.transform =
          "";

      }
    );

  });


/* =========================================================
   KEYBOARD ESCAPE
========================================================= */

document.addEventListener(
  "keydown",
  event => {

    if (
      event.key !== "Escape"
    ) {
      return;
    }


    const navLinks =
      document.getElementById(
        "navLinks"
      );

    const menuBtn =
      document.getElementById(
        "menuBtn"
      );


    if (
      navLinks &&
      menuBtn
    ) {

      navLinks.classList.remove(
        "open"
      );

      menuBtn.setAttribute(
        "aria-expanded",
        "false"
      );

      menuBtn.setAttribute(
        "aria-label",
        "Open navigation menu"
      );

      menuBtn.textContent = "☰";

    }

  }
);


/* =========================================================
   CONSOLE BRANDING
========================================================= */

console.log(
  "%cHADI",
  "font-size:32px;font-weight:900;"
);

console.log(
  "%cAI-Powered Web Designer & Developer",
  "font-size:14px;color:#42a5ff;"
);

console.log(
  "%cBuilding digital experiences.",
  "font-size:12px;color:#888;"
);
