/* Shared theme sync for the standalone lab tools. Follows the main site's
   saved theme (localStorage 'theme', same origin), defaults dark to match the
   site, and injects a small floating toggle. Load blocking in <head> so the
   theme is applied before first paint (no flash). */
(function () {
  function get() { try { return localStorage.getItem('theme') || 'dark'; } catch (e) { return 'dark'; } }
  function apply(t) {
    document.documentElement.setAttribute('data-theme', t);
    try { document.documentElement.style.colorScheme = (t === 'dark' ? 'dark' : 'light'); } catch (e) {}
  }
  apply(get());
  document.addEventListener('DOMContentLoaded', function () {
    if (document.getElementById('tool-theme-toggle')) return;
    var b = document.createElement('button');
    b.id = 'tool-theme-toggle';
    b.type = 'button';
    b.setAttribute('aria-label', 'Toggle dark mode');
    b.title = 'Toggle theme';
    b.textContent = '◑';
    b.style.cssText = 'position:fixed;bottom:16px;right:16px;z-index:99999;width:36px;height:36px;'
      + 'border-radius:999px;border:1px solid rgba(128,128,128,.45);background:rgba(128,128,128,.14);'
      + 'color:inherit;cursor:pointer;font-size:15px;line-height:1;display:flex;align-items:center;'
      + 'justify-content:center;backdrop-filter:blur(4px);';
    b.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      apply(next);
      try { localStorage.setItem('theme', next); } catch (e) {}
    });
    document.body.appendChild(b);
  });
})();
