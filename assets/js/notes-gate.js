// Soft password gate for /notes pages.
//
// HOW IT WORKS
//   1. Pages flagged with <... data-protected> start hidden via CSS.
//   2. This script checks sessionStorage for a "you're already unlocked" flag.
//   3. If not unlocked, it shows the gate form. On correct password, it sets the
//      flag and reveals the content. Password is checked against the SHA-256 hash
//      stored below.
//
// HOW TO CHANGE THE PASSWORD
//   Generate a new SHA-256 hash for your password and paste it below:
//     - macOS / Linux:  echo -n "your-password" | shasum -a 256
//     - In the browser console:
//         crypto.subtle.digest('SHA-256', new TextEncoder().encode('your-password'))
//           .then(b => console.log([...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')))
//
// CAVEAT
//   This is a SOFT GATE, not real encryption. The note HTML still ships to the
//   browser (just hidden via CSS), so anyone determined enough can read source.
//   Use this to keep recruiters / Google off the section, not to hide secrets.
//   For real encryption see StatiCrypt: https://github.com/robinmoisson/staticrypt
//
// Current password: nazgul-psh
(function () {
  var STORAGE_KEY  = 'prit-notes-auth-v1';
  var PASSWORD_HASH = '53ec3e5e6a695d005fc83fad3db669add6aa5b1ba3656a44094278342bf11db7';

  function bytesToHex(buf) {
    return Array.from(new Uint8Array(buf))
      .map(function (b) { return b.toString(16).padStart(2, '0'); })
      .join('');
  }

  async function sha256Hex(str) {
    var data = new TextEncoder().encode(str);
    var hash = await crypto.subtle.digest('SHA-256', data);
    return bytesToHex(hash);
  }

  function isAuthed() {
    try { return sessionStorage.getItem(STORAGE_KEY) === 'ok'; }
    catch (_) { return false; }
  }

  function reveal() {
    var protectedEls = document.querySelectorAll('[data-protected]');
    var gate = document.querySelector('.notes-gate');
    protectedEls.forEach(function (el) { el.removeAttribute('hidden'); });
    if (gate) gate.setAttribute('hidden', '');
  }

  function showGate() {
    var gate = document.querySelector('.notes-gate');
    if (!gate) return;
    gate.removeAttribute('hidden');
    var input = gate.querySelector('.notes-gate__input');
    if (input) setTimeout(function () { input.focus(); }, 30);
  }

  function logout() {
    try { sessionStorage.removeItem(STORAGE_KEY); } catch (_) {}
    location.reload();
  }

  function bindLogout() {
    var btn = document.querySelector('[data-notes-logout]');
    if (btn) btn.addEventListener('click', function (e) {
      e.preventDefault();
      logout();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    var hasProtected = !!document.querySelector('[data-protected]');
    if (!hasProtected) return;

    if (isAuthed()) {
      reveal();
      bindLogout();
      return;
    }

    showGate();

    var form  = document.querySelector('.notes-gate__form');
    var input = document.querySelector('.notes-gate__input');
    var error = document.querySelector('.notes-gate__error');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (error) error.setAttribute('hidden', '');
      var pw = input.value;
      try {
        var hash = await sha256Hex(pw);
        if (hash === PASSWORD_HASH) {
          try { sessionStorage.setItem(STORAGE_KEY, 'ok'); } catch (_) {}
          reveal();
          bindLogout();
        } else {
          if (error) error.removeAttribute('hidden');
          input.value = '';
          input.focus();
        }
      } catch (err) {
        if (error) {
          error.textContent = 'Could not check password in this browser.';
          error.removeAttribute('hidden');
        }
      }
    });
  });
})();
