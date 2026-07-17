/* SIUE Mass Communications — shared behavior (mc.js)
   - Mobile department-nav toggle
   - Back-to-top
   - Accessible hero: muted looping video with a keyboard-operable Pause/Play
     control, and prefers-reduced-motion support (starts paused).
   Requires the Vimeo Player API (player.js) on pages that have a hero video. */
(function () {
  'use strict';

  function ready(fn){ if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn); }

  ready(function () {
    /* 1. Mobile department menu toggle */
    var toggle = document.querySelector('.dept-toggle');
    var nav = document.getElementById('deptnav');
    if (toggle && nav) {
      toggle.addEventListener('click', function () {
        var open = nav.classList.toggle('open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    /* 2. Back-to-top */
    var toTop = document.querySelector('.to-top');
    if (toTop) {
      window.addEventListener('scroll', function () {
        if (window.scrollY > 700) toTop.classList.add('show');
        else toTop.classList.remove('show');
      }, { passive: true });
    }

    /* Belt-and-suspenders: remove the SIUE arc-menu dismiss control if the CSS hide is overridden. */
    var stray = document.getElementById('dismiss');
    if (stray) stray.style.display = 'none';

    /* 3. Accessible hero video control (Vimeo Player API) — every page's hero. */
    var iframe = document.querySelector('.hero-media iframe');
    var btn = document.querySelector('.hero-pause');
    if (iframe && btn && window.Vimeo && window.Vimeo.Player) {
      var player = new window.Vimeo.Player(iframe);
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var playing = !reduce;

      function render() {
        btn.setAttribute('aria-pressed', playing ? 'true' : 'false');
        var label = btn.querySelector('.label');
        var ico = btn.querySelector('.ico');
        if (label) label.textContent = playing ? 'Pause background video' : 'Play background video';
        if (ico) ico.textContent = playing ? '❚❚' : '▶';
      }
      if (reduce) { player.pause().catch(function(){}); }
      render();

      btn.addEventListener('click', function () {
        if (playing) { player.pause().catch(function(){}); }
        else { player.play().catch(function(){}); }
        playing = !playing;
        render();
      });
    }
  });
})();
