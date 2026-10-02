/* Inferential Check - page wiring. The arithmetic lives in stats.js. */

(function () {
  var ESCMAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ESCMAP[c]; }); }
  function n2(x) { return (x === null || isNaN(x)) ? 'not defined' : Number(x).toFixed(2); }

  document.addEventListener('DOMContentLoaded', function () {
    var tabs = [].slice.call(document.querySelectorAll('[role="tab"]'));
    var panels = {
      crosstab: document.getElementById('panel-crosstab'),
      raw: document.getElementById('panel-raw'),
      summary: document.getElementById('panel-summary')
    };
    var out = document.getElementById('results');
    var summaryLine = document.getElementById('summary');

    function show(name) {
      tabs.forEach(function (t) {
        var on = t.getAttribute('data-panel') === name;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
      });
      Object.keys(panels).forEach(function (k) { panels[k].hidden = k !== name; });
      run();
    }

    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { show(t.getAttribute('data-panel')); });
      t.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        e.preventDefault();
        var next = tabs[(i + d + tabs.length) % tabs.length];
        next.focus();
        show(next.getAttribute('data-panel'));
      });
    });

    function current() {
      var t = tabs.filter(function (x) { return x.getAttribute('aria-selected') === 'true'; })[0];
      return t ? t.getAttribute('data-panel') : 'crosstab';
    }

    function notesHtml(notes) {
      if (!notes.length) return '';
      var h = '<h2 class="g">Read this before you report it</h2><ul class="findings">';
      notes.forEach(function (n) { h += '<li class="' + n.level + '">' + esc(n.msg) + '</li>'; });
      return h + '</ul>';
    }

    function apaHtml(line) {
      return '<h2 class="g">The sentence to check your write-up against</h2>' +
             '<p class="apa"><code>' + esc(line) + '</code></p>' +
             '<p class="note">Round as your style guide asks, and put the claim before the ' +
             'statistic. A number without a claim is not a finding.</p>';
    }

    function renderChi(r) {
      var h = '<table class="stats"><tbody>';
      h += '<tr><th scope="row">Chi-square</th><td>' + r.x2.toFixed(3) + '</td></tr>';
      h += '<tr><th scope="row">Degrees of freedom</th><td>' + r.df + '</td></tr>';
      h += '<tr><th scope="row">p</th><td>' + window.ICStats.pText(r.p) + '</td></tr>';
      h += '<tr><th scope="row">Cram&eacute;r&rsquo;s V</th><td>' + window.ICStats.noZero(r.v) +
           ' <span class="muted">(effect size)</span></td></tr>';
      h += '<tr><th scope="row">Cases</th><td>' + r.n + '</td></tr>';
      h += '</tbody></table>';
      h += notesHtml(r.notes);
      h += '<h2 class="g">Observed, with the expected count under it</h2><div class="scroll">';
      h += '<table class="matrix"><thead><tr><td></td>';
      r.colNames.forEach(function (c) { h += '<th scope="col">' + esc(c) + '</th>'; });
      h += '</tr></thead><tbody>';
      r.grid.forEach(function (row, i) {
        h += '<tr><th scope="row">' + esc(r.rowNames[i]) + '</th>';
        row.forEach(function (v, j) {
          var e = r.expected[i][j];
          h += '<td>' + v + '<span class="exp' + (e < 5 ? ' low' : '') + '">' + n2(e) + '</span></td>';
        });
        h += '</tr>';
      });
      h += '</tbody></table></div>';
      return h + apaHtml(r.apa);
    }

    function renderT(r, names) {
      var h = '<table class="stats"><tbody>';
      h += '<tr><th scope="row">t</th><td>' + r.t.toFixed(3) + '</td></tr>';
      h += '<tr><th scope="row">Degrees of freedom</th><td>' + r.df.toFixed(2) +
           ' <span class="muted">(Welch)</span></td></tr>';
      h += '<tr><th scope="row">p</th><td>' + window.ICStats.pText(r.p) + '</td></tr>';
      h += '<tr><th scope="row">Cohen&rsquo;s d</th><td>' + n2(r.d) +
           ' <span class="muted">(effect size)</span></td></tr>';
      h += '<tr><th scope="row">Difference in means</th><td>' + n2(r.diff) + '</td></tr>';
      h += '</tbody></table>';
      h += '<div class="scroll"><table class="matrix"><thead><tr><th scope="col">Group</th>' +
           '<th scope="col">n</th><th scope="col">Mean</th><th scope="col">SD</th></tr></thead><tbody>';
      [[names[0], r.g1], [names[1], r.g2]].forEach(function (pair) {
        h += '<tr><th scope="row">' + esc(pair[0]) + '</th><td>' + pair[1].n + '</td><td>' +
             n2(pair[1].mean) + '</td><td>' + n2(pair[1].sd) + '</td></tr>';
      });
      h += '</tbody></table></div>';
      h += notesHtml(r.notes);
      return h + apaHtml(r.apa);
    }

    function fail(msg) {
      summaryLine.textContent = '';
      out.innerHTML = '<ul class="findings"><li class="fail">' + esc(msg) + '</li></ul>';
    }

    function run() {
      var mode = current();
      var S = window.ICStats;

      if (mode === 'crosstab') {
        var text = document.getElementById('crosstab').value;
        if (!text.trim()) { summaryLine.textContent = ''; out.innerHTML = ''; return; }
        var tab = S.readCrosstab(text);
        if (!tab) return fail('That does not read as a table of counts yet. One row per category, counts separated by commas, tabs, or spaces, with optional labels in the first row and column.');
        var r = S.chiSquare(tab);
        summaryLine.textContent = tab.grid.length + ' by ' + tab.grid[0].length + ' table, ' + r.n + ' cases.';
        out.innerHTML = renderChi(r);
        return;
      }

      if (mode === 'raw') {
        var raw = document.getElementById('raw').value;
        if (!raw.trim()) { summaryLine.textContent = ''; out.innerHTML = ''; return; }
        var g = S.readTwoGroups(raw);
        if (!g) return fail('That does not read as two columns yet. Put the group label in the first column and the number in the second.');
        if (g.error) return fail(g.error);
        var rt = S.tTest(g.g1, g.g2);
        summaryLine.textContent = g.g1.n + ' and ' + g.g2.n + ' cases in ' + g.names.join(' and ') + '.';
        out.innerHTML = renderT(rt, g.names);
        return;
      }

      var f = {};
      ['n1', 'm1', 's1', 'n2', 'm2', 's2'].forEach(function (k) {
        f[k] = Number(document.getElementById(k).value);
      });
      var filled = ['n1', 'm1', 's1', 'n2', 'm2', 's2'].every(function (k) {
        return document.getElementById(k).value.trim() !== '' && isFinite(f[k]);
      });
      if (!filled) { summaryLine.textContent = ''; out.innerHTML = ''; return; }
      if (f.s1 < 0 || f.s2 < 0) return fail('A standard deviation cannot be negative.');
      if (f.n1 < 2 || f.n2 < 2) return fail('Each group needs at least two cases.');
      var rs = S.tTest({ n: f.n1, mean: f.m1, sd: f.s1 }, { n: f.n2, mean: f.m2, sd: f.s2 });
      summaryLine.textContent = f.n1 + ' and ' + f.n2 + ' cases.';
      out.innerHTML = renderT(rs, [
        document.getElementById('name1').value || 'Group 1',
        document.getElementById('name2').value || 'Group 2'
      ]);
    }

    [].slice.call(document.querySelectorAll('textarea, input[type="text"], input[type="number"]'))
      .forEach(function (el) { el.addEventListener('input', run); });

    document.getElementById('clear').addEventListener('click', function () {
      [].slice.call(document.querySelectorAll('textarea, input[type="text"], input[type="number"]'))
        .forEach(function (el) { el.value = ''; });
      run();
    });

    show('crosstab');
  });
}());
