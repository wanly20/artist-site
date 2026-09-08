/* =========================================================================
   Cleo Pond — static site behaviour
   - mobile nav toggle
   - scrollspy for active nav link (home page only)
   - "notify me" form (client-side only, no backend yet)
   ========================================================================= */

(function () {
  'use strict';

  /* ── Mobile nav ──────────────────────────────────────────────────────── */
  var nav = document.querySelector('.nav');
  var burger = document.querySelector('.nav__burger');

  if (nav && burger) {
    burger.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      var open = nav.classList.contains('is-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // close the mobile menu after tapping a link
    nav.querySelectorAll('.nav__mobile a').forEach(function (link) {
      link.addEventListener('click', function () {
        nav.classList.remove('is-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ── Scrollspy (only runs if there are in-page sections) ──────────────── */
  var spied = document.querySelectorAll('main[data-spy] section[id]');

  if (spied.length && 'IntersectionObserver' in window) {
    var linkFor = {};
    document.querySelectorAll('.nav__link[data-section]').forEach(function (l) {
      linkFor[l.getAttribute('data-section')] = l;
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.id;
          Object.keys(linkFor).forEach(function (key) {
            linkFor[key].classList.toggle('is-active', key === id);
          });
        });
      },
      { threshold: 0.4 }
    );

    spied.forEach(function (section) {
      observer.observe(section);
    });
  }

  /* ── Notify form ─────────────────────────────────────────────────────── */
  var form = document.querySelector('[data-notify]');

  if (form) {
    var input = form.querySelector('input[type="email"]');
    var errorEl = form.querySelector('.notify__error');
    var wrapper = form.parentElement;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var value = (input.value || '').trim();

      if (value.indexOf('@') === -1 || value.indexOf('.') === -1) {
        if (errorEl) errorEl.textContent = 'Please enter a valid email.';
        input.focus();
        return;
      }
      if (errorEl) errorEl.textContent = '';

      // No backend yet — swap the form for a confirmation message.
      var success = document.createElement('div');
      success.className = 'notify__success';
      success.innerHTML =
        '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">' +
        '<path d="M 3 9 L 7 13 L 15 5" stroke="#1c1714" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</svg><p>You’re on the list! I’ll be in touch.</p>';
      form.replaceWith(success);
      // (Later: POST `value` to a mailing-list endpoint here.)
    });

    if (input && errorEl) {
      input.addEventListener('input', function () {
        errorEl.textContent = '';
      });
    }
  }
})();
