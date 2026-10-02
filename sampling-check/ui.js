/* Sampling Check - page wiring. The arithmetic lives in sampling.js. */

(function () {
  var ESCMAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ESCMAP[c]; }); }
  function val(id) { return document.getElementById(id).value; }
  function n2(x) { return (x === null || isNaN(x)) ? 'not defined' : Number(x).toFixed(2); }
  function noZero(x) { return isNaN(x) ? 'not defined' : Number(x).toFixed(2).replace(/^0/, ''); }

  function notesHtml(notes) {
    if (!notes || !notes.length) return '';
    var h = '<ul class="findings">';
    notes.forEach(function (n) { h += '<li class="' + n.level + '">' + esc(n.msg) + '</li>'; });
    return h + '</ul>';
  }

  function statsHtml(pairs) {
    var h = '<table class="stats"><tbody>';
    pairs.forEach(function (p) {
      h += '<tr><th scope="row">' + p[0] + '</th><td>' + p[1] + '</td></tr>';
    });
    return h + '</tbody></table>';
  }

  document.addEventListener('DOMContentLoaded', function () {
    var C = window.SamplingCore;

    function run() {
      var t = C.timeBudget({
        secondsPerUnit: val('secondsPerUnit'), variables: val('variables'),
        hours: val('hours'), coders: val('coders')
      });
      document.getElementById('out-time').innerHTML = t
        ? statsHtml([
            ['Seconds per unit, all variables', t.perUnit.toFixed(1)],
            ['Units the hours support', '<strong>' + t.units + '</strong>'],
            ['Before the reliability reserve', t.gross]
          ]) + notesHtml(t.notes)
        : '';

      var r = C.reliabilitySample({ corpus: val('corpus'), rarest: val('rarest') });
      document.getElementById('out-rel').innerHTML = r
        ? statsHtml([
            ['Units in the fresh reliability sample', '<strong>' + r.n + '</strong>'],
            ['Share of the corpus', r.pct.toFixed(1) + '%']
          ]) + notesHtml(r.notes)
        : '';

      var d = C.detectable({ n: val('n'), alpha: val('alpha'), power: val('power'), df: val('df') });
      document.getElementById('out-power').innerHTML = d
        ? statsHtml([
            ['Smallest detectable d, two groups of ' + d.perGroup, n2(d.d)],
            ['Smallest detectable Cram&eacute;r&rsquo;s V, df ' + d.df, noZero(d.w)],
            ['Units needed for a medium d of .50', d.nForMedium],
            ['Units needed for a medium V of .30', d.nForW3]
          ]) + notesHtml(d.notes)
        : '';
    }

    [].slice.call(document.querySelectorAll('input, select'))
      .forEach(function (el) {
        el.addEventListener('input', run);
        el.addEventListener('change', run);
      });
    run();
  });
}());
