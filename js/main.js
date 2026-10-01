/* =========================================================================
   Cleo Pond — static site behaviour
   - mobile nav toggle
   - scrollspy for active nav link (home page only)
   - "notify me" form — posts to the form's own action (a Kit/ConvertKit
     inline-form endpoint) via fetch, no page reload
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

  /* ── Notify form(s) ───────────────────────────────────────────────────── */
  // Any <form data-notify action="..." method="post"> with an
  // input[name="email_address"] is wired up the same way — there can be
  // more than one on a page (e.g. a comparison preview).
  document.querySelectorAll('[data-notify]').forEach(function (form) {
    var input = form.querySelector('input[name="email_address"]');
    var errorEl = form.querySelector('.notify__error');
    var submitBtn = form.querySelector('button[type="submit"]');

    if (!input) return;

    function showSuccess() {
      var success = document.createElement('div');
      success.className = 'notify__success';
      success.innerHTML =
        '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">' +
        '<path d="M 3 9 L 7 13 L 15 5" stroke="#1c1714" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>' +
        '</svg><p>Almost there — check your inbox to confirm your subscription.</p>';
      form.replaceWith(success);
    }

    function showError(message) {
      if (!errorEl) return;
      errorEl.textContent = message;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var value = (input.value || '').trim();

      if (value.indexOf('@') === -1 || value.indexOf('.') === -1) {
        showError('Please enter a valid email.');
        input.focus();
        return;
      }
      showError('');

      if (!form.action) {
        // No real endpoint wired up yet — nothing to submit to.
        showError('Signups aren’t connected yet — try again soon.');
        return;
      }

      if (submitBtn) submitBtn.disabled = true;

      fetch(form.action, {
        method: form.method || 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data && data.status === 'success') {
            showSuccess();
            return;
          }
          var message =
            (data && data.errors && data.errors.messages && data.errors.messages[0]) ||
            'Something went wrong — please try again.';
          showError(message);
          if (submitBtn) submitBtn.disabled = false;
        })
        .catch(function () {
          showError('Couldn’t reach the server — please try again.');
          if (submitBtn) submitBtn.disabled = false;
        });
    });

    input.addEventListener('input', function () {
      showError('');
    });
  });
})();
