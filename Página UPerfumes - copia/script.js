/* =========================================================================
   UPerfumes — script.js
   Sin carrito, sin lógica de compra: solo interacciones de presentación.
   1. Menú móvil (abrir/cerrar)
   2. Encabezado que se vuelve sólido al hacer scroll
   3. Marcador de posición automático para fotos que aún no existen
   4. Filtro de catálogo por familia olfativa
   5. Revelado de la cuadrícula al entrar en pantalla (una sola vez)
   6. Contador animado de las cifras de la colección
   ========================================================================= */
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------------------------------------------------------------------
     1. Menú móvil
     --------------------------------------------------------------------- */
  var navToggle = document.getElementById("navToggle");
  var siteNav = document.getElementById("siteNav");

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = siteNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute(
        "aria-label",
        isOpen ? "Cerrar menú" : "Abrir menú"
      );
    });

    // Cierra el menú al elegir una sección (útil en móvil)
    siteNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        siteNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Abrir menú");
      });
    });
  }

  /* ---------------------------------------------------------------------
     2. Encabezado sólido al hacer scroll
     --------------------------------------------------------------------- */
  var header = document.getElementById("siteHeader");
  if (header) {
    var updateHeader = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 40);
    };
    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
  }

  /* ---------------------------------------------------------------------
     3. Marcador de posición automático para imágenes faltantes
     --------------------------------------------------------------------- 
     Cada <img> del catálogo apunta a una ruta sugerida (por ejemplo
     "images/dior-sauvage-edt.jpg"). Si ese archivo no existe todavía,
     el navegador dispara el evento "error" y aquí mostramos el recuadro
     con las instrucciones en su lugar. En cuanto subas la foto con el
     nombre correcto, esto deja de aplicarse automáticamente.
  */
  document
    .querySelectorAll(".perfume-card__image img")
    .forEach(function (img) {
      var wrapper = img.closest(".perfume-card__image");
      if (!wrapper) return;

      img.addEventListener("error", function () {
        img.classList.add("img-missing");
        wrapper.classList.add("is-missing");
      });

      // Si por algún motivo la imagen ya estaba en caché con error
      if (img.complete && img.naturalWidth === 0) {
        img.classList.add("img-missing");
        wrapper.classList.add("is-missing");
      }
    });

  /* ---------------------------------------------------------------------
     4. Filtro de catálogo por familia olfativa
     --------------------------------------------------------------------- */
  var filters = document.getElementById("filters");
  var grid = document.getElementById("perfumeGrid");
  var emptyMsg = document.getElementById("filtersEmpty");

  if (filters && grid) {
    var chips = filters.querySelectorAll(".filter-chip");
    var cards = grid.querySelectorAll(".perfume-card");

    filters.addEventListener("click", function (e) {
      var chip = e.target.closest(".filter-chip");
      if (!chip) return;

      chips.forEach(function (c) {
        c.classList.remove("is-active");
        c.setAttribute("aria-selected", "false");
      });
      chip.classList.add("is-active");
      chip.setAttribute("aria-selected", "true");

      var family = chip.getAttribute("data-filter");
      var visibleCount = 0;

      cards.forEach(function (card) {
        var matches = family === "todos" || card.dataset.family === family;
        card.classList.toggle("is-filtered-out", !matches);
        if (matches) visibleCount++;
      });

      if (emptyMsg) emptyMsg.hidden = visibleCount !== 0;
    });
  }

  /* ---------------------------------------------------------------------
     5. Revelado de la cuadrícula al entrar en pantalla (una sola vez)
     --------------------------------------------------------------------- */
  if (grid) {
    var gridCards = grid.querySelectorAll(".perfume-card");
    gridCards.forEach(function (card, i) {
      card.style.setProperty("--i", i % 6); // agrupa el stagger en tandas
    });

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      grid.classList.add("is-visible");
    } else {
      var gridObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              grid.classList.add("is-visible");
              gridObserver.disconnect();
            }
          });
        },
        { threshold: 0.08 }
      );
      gridObserver.observe(grid);
    }
  }

  /* ---------------------------------------------------------------------
     6. Contador animado de las cifras de la colección
     --------------------------------------------------------------------- */
  var statNumbers = document.querySelectorAll(".stat-number");

  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;

    if (prefersReducedMotion) {
      el.textContent = target;
      return;
    }

    var start = 0;
    var duration = 900;
    var startTime = null;

    function step(timestamp) {
      if (startTime === null) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease-out cúbico
      el.textContent = Math.round(start + (target - start) * eased);
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if (statNumbers.length) {
    if (!("IntersectionObserver" in window)) {
      statNumbers.forEach(animateCount);
    } else {
      var statsObserver = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      statNumbers.forEach(function (el) {
        statsObserver.observe(el);
      });
    }
  }

  /* ---------------------------------------------------------------------
     7. Botón "bajar al catálogo" del hero
     --------------------------------------------------------------------- */
  var scrollCue = document.getElementById("scrollCue");
  if (scrollCue) {
    scrollCue.addEventListener("click", function () {
      var target = document.getElementById("coleccion");
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  }
})();
