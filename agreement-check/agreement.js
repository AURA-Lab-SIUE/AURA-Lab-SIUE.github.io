/* Agreement Check - AURA Lab
   Two columns of codes in, reliability out: percent agreement, Cohen's kappa,
   Krippendorff's alpha for nominal data, a confusion matrix, and the list of
   units the two columns disagree on, which is what the coders actually sit
   down and discuss.

   Runs in the page. Nothing is uploaded. */

var NL = String.fromCharCode(10);
var SEP = String.fromCharCode(0);
var TAB = String.fromCharCode(9);

/* ---------- delimited text ---------- */

function parseDelimited(text) {
  var t = String(text || '').split(String.fromCharCode(13, 10)).join(NL)
                            .split(String.fromCharCode(13)).join(NL);
  if (!t.trim()) return [];
  var delim = pickDelimiter(t);
  var rows = [], row = [], field = '', quoted = false, i;
  for (i = 0; i < t.length; i++) {
    var c = t.charAt(i);
    if (quoted) {
      if (c === '"') {
        if (t.charAt(i + 1) === '"') { field += '"'; i++; }
        else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === delim) { row.push(field); field = ''; }
    else if (c === NL) { row.push(field); rows.push(row); row = []; field = ''; }
    else field += c;
  }
  row.push(field);
  rows.push(row);
  return rows.filter(function (r) {
    return r.some(function (f) { return String(f).trim() !== ''; });
  }).map(function (r) {
    return r.map(function (f) { return String(f).trim(); });
  });
}

function pickDelimiter(t) {
  var first = t.split(NL)[0] || '';
  var tabs = first.split(TAB).length - 1;
  var commas = first.split(',').length - 1;
  var semis = first.split(';').length - 1;
  if (tabs > 0 && tabs >= commas && tabs >= semis) return TAB;
  if (semis > commas) return ';';
  return ',';
}

/* ---------- reliability ---------- */

function pairUp(rows, idCol, aCol, bCol) {
  var out = { pairs: [], skipped: 0 };
  var i;
  for (i = 1; i < rows.length; i++) {
    var r = rows[i];
    var a = (r[aCol] || '').trim(), b = (r[bCol] || '').trim();
    if (a === '' || b === '') { out.skipped++; continue; }
    out.pairs.push({
      id: idCol === -1 ? String(i) : ((r[idCol] || '').trim() || String(i)),
      a: a, b: b
    });
  }
  return out;
}

function tally(pairs) {
  var cats = {}, matrix = {}, agree = 0, i;
  for (i = 0; i < pairs.length; i++) {
    var p = pairs[i];
    cats[p.a] = true; cats[p.b] = true;
    var k = p.a + SEP + p.b;
    matrix[k] = (matrix[k] || 0) + 1;
    if (p.a === p.b) agree++;
  }
  return { cats: Object.keys(cats).sort(), matrix: matrix, agree: agree, n: pairs.length };
}

function cell(t, a, b) { return t.matrix[a + SEP + b] || 0; }

function cohensKappa(t) {
  var n = t.n;
  if (!n) return null;
  var po = t.agree / n, pe = 0, i, j;
  for (i = 0; i < t.cats.length; i++) {
    var c = t.cats[i], rowSum = 0, colSum = 0;
    for (j = 0; j < t.cats.length; j++) {
      rowSum += cell(t, c, t.cats[j]);
      colSum += cell(t, t.cats[j], c);
    }
    pe += (rowSum / n) * (colSum / n);
  }
  if (pe === 1) return { po: po, pe: pe, kappa: null };
  return { po: po, pe: pe, kappa: (po - pe) / (1 - pe) };
}

/* Krippendorff's alpha, nominal level, from the coincidence matrix. With two
   coders and no missing codes this is the standard two-observer case. */
function krippendorffAlpha(pairs) {
  var n = pairs.length;
  if (n < 2) return null;
  var co = {}, totals = {}, i, j;
  for (i = 0; i < n; i++) {
    var a = pairs[i].a, b = pairs[i].b;
    co[a + SEP + b] = (co[a + SEP + b] || 0) + 1;
    co[b + SEP + a] = (co[b + SEP + a] || 0) + 1;
    totals[a] = (totals[a] || 0) + 1;
    totals[b] = (totals[b] || 0) + 1;
  }
  var cats = Object.keys(totals);
  var nTotal = 2 * n;
  var disagreeObs = 0;
  for (i = 0; i < cats.length; i++)
    for (j = 0; j < cats.length; j++)
      if (i !== j) disagreeObs += co[cats[i] + SEP + cats[j]] || 0;
  var observed = disagreeObs / nTotal;
  var expected = 0;
  for (i = 0; i < cats.length; i++)
    for (j = 0; j < cats.length; j++)
      if (i !== j) expected += totals[cats[i]] * totals[cats[j]];
  expected = expected / (nTotal * (nTotal - 1));
  if (expected === 0) return null;
  return 1 - (observed / expected);
}

function landisKoch(k) {
  if (k === null || isNaN(k)) return 'not defined';
  if (k < 0) return 'worse than chance';
  if (k < 0.21) return 'slight';
  if (k < 0.41) return 'fair';
  if (k < 0.61) return 'moderate';
  if (k < 0.81) return 'substantial';
  return 'almost perfect';
}

function disagreements(pairs) {
  var byPair = {}, i;
  for (i = 0; i < pairs.length; i++) {
    var p = pairs[i];
    if (p.a === p.b) continue;
    var key = p.a + ' vs ' + p.b;
    if (!byPair[key]) byPair[key] = { label: key, count: 0, ids: [] };
    byPair[key].count++;
    if (byPair[key].ids.length < 8) byPair[key].ids.push(p.id);
  }
  return Object.keys(byPair).map(function (k) { return byPair[k]; })
    .sort(function (x, y) { return y.count - x.count; });
}

function analyze(rows, idCol, aCol, bCol, opts) {
  opts = opts || {};
  var mode = opts.mode === 'stability' ? 'stability' : 'two-coders';
  var paired = pairUp(rows, idCol, aCol, bCol);
  var t = tally(paired.pairs);
  var ck = cohensKappa(t);
  var alpha = krippendorffAlpha(paired.pairs);
  var notes = [];

  if (t.n === 0)
    notes.push({ level: 'fail', msg: 'No unit carries a code in both columns, so there is nothing to compare.' });
  if (paired.skipped)
    notes.push({ level: 'warn', msg: paired.skipped + ' row(s) were skipped because one of the two columns was blank. A blank is not a code, so decide whether those units belong in the sample.' });
  if (t.n > 0 && t.n < 50)
    notes.push({ level: 'warn', msg: 'Only ' + t.n + ' units compared. The assignment asks for at least 50 in the reliability sample, and 100 or more when a code is rare.' });
  if (t.cats.length === 1)
    notes.push({ level: 'fail', msg: 'Both columns use a single category, so agreement is guaranteed and kappa is undefined. Report percent agreement and say why.' });
  if (ck && ck.kappa !== null && ck.pe > 0.9)
    notes.push({ level: 'warn', msg: 'One category covers almost every unit, so agreement expected by chance is ' + pct(ck.pe) + '. Kappa is harsh under a skewed distribution, so report the base rates next to it.' });
  if (ck && ck.kappa !== null && ck.kappa < 0.7)
    notes.push({ level: 'fail', msg: 'Kappa is below the 0.70 threshold (Landis & Koch, 1977). Discuss every disagreement, add a decision rule for each, then code a fresh sample.' });
  if (mode === 'stability' && t.n > 0)
    notes.push({ level: 'warn', msg: 'This is intracoder stability, one coder at two times. It is a floor, not intercoder reliability, and it cannot be reported in place of it.' });

  var rare = t.cats.filter(function (c) {
    var m = 0, j;
    for (j = 0; j < t.cats.length; j++) m += cell(t, c, t.cats[j]) + cell(t, t.cats[j], c);
    return m > 0 && t.n > 0 && m / (2 * t.n) < 0.05;
  });
  if (rare.length)
    notes.push({ level: 'warn', msg: 'Rare in this sample, under 5 percent of all codes: ' + rare.join(', ') + '. A rare code can read as high agreement on almost no evidence.' });

  return {
    mode: mode, n: t.n, skipped: paired.skipped, cats: t.cats,
    agree: t.agree, percent: t.n ? t.agree / t.n : 0,
    kappa: ck ? ck.kappa : null, pe: ck ? ck.pe : null,
    label: ck ? landisKoch(ck.kappa) : 'not defined',
    alpha: alpha, matrix: t, notes: notes,
    disagreements: disagreements(paired.pairs)
  };
}

function pct(x) { return (100 * x).toFixed(1) + '%'; }
function num(x) { return (x === null || isNaN(x)) ? 'not defined' : x.toFixed(3); }

/* ---------- page ---------- */

var ESCMAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ESCMAP[c]; }); }

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', function () {
    var ta = document.getElementById('src');
    var file = document.getElementById('file');
    var clear = document.getElementById('clear');
    var pick = document.getElementById('pick');
    var out = document.getElementById('results');
    var summary = document.getElementById('summary');
    var selId = document.getElementById('col-id');
    var selA = document.getElementById('col-a');
    var selB = document.getElementById('col-b');
    var mode = document.getElementById('mode');
    var rows = [];

    function looksLikeId(h) { return /^(id|unit|unit id|unit_id|case|case_id|row|message_id|post_id)$/i.test(h); }

    function fillSelects() {
      var head = rows[0] || [];
      var opts = head.map(function (h, i) {
        return '<option value="' + i + '">' + esc(h || ('column ' + (i + 1))) + '</option>';
      }).join('');
      selId.innerHTML = '<option value="-1">row number</option>' + opts;
      selA.innerHTML = opts;
      selB.innerHTML = opts;
      var guessId = -1, coders = [];
      head.forEach(function (h, i) {
        if (guessId === -1 && looksLikeId(h)) guessId = i;
        if (/cod|rater|pass|round|time|llm|manual/i.test(h)) coders.push(i);
      });
      selId.value = String(guessId);
      selA.value = String(coders.length > 1 ? coders[0] : (head.length > 1 ? 1 : 0));
      selB.value = String(coders.length > 1 ? coders[1] : (head.length > 2 ? 2 : head.length - 1));
      pick.hidden = false;
    }

    function render() {
      if (rows.length < 2) {
        pick.hidden = true; summary.textContent = ''; out.innerHTML = '';
        return;
      }
      var r = analyze(rows, parseInt(selId.value, 10), parseInt(selA.value, 10),
                      parseInt(selB.value, 10), { mode: mode.value });
      summary.textContent = r.n
        ? r.n + ' units compared, ' + r.agree + ' agreed.'
        : 'Nothing to compare yet.';

      var h = '';
      if (r.n) {
        h += '<table class="stats"><caption class="sr-only">Reliability statistics</caption><tbody>';
        h += '<tr><th scope="row">Percent agreement</th><td>' + pct(r.percent) + '</td></tr>';
        h += '<tr><th scope="row">Cohen&rsquo;s kappa</th><td>' + num(r.kappa) +
             ' <span class="muted">(' + esc(r.label) + ')</span></td></tr>';
        h += '<tr><th scope="row">Krippendorff&rsquo;s alpha, nominal</th><td>' + num(r.alpha) + '</td></tr>';
        h += '<tr><th scope="row">Agreement expected by chance</th><td>' +
             (r.pe === null ? 'not defined' : pct(r.pe)) + '</td></tr>';
        h += '</tbody></table>';
      }

      if (r.notes.length) {
        h += '<h2 class="g">What to do about it</h2><ul class="findings">';
        r.notes.forEach(function (n) { h += '<li class="' + n.level + '">' + esc(n.msg) + '</li>'; });
        h += '</ul>';
      }

      if (r.n && r.cats.length) {
        h += '<h2 class="g">Where the two columns split</h2>';
        h += '<div class="scroll"><table class="matrix"><caption>Rows are the first column, columns the second.</caption><thead><tr><td></td>';
        r.cats.forEach(function (c) { h += '<th scope="col">' + esc(c) + '</th>'; });
        h += '</tr></thead><tbody>';
        r.cats.forEach(function (a) {
          h += '<tr><th scope="row">' + esc(a) + '</th>';
          r.cats.forEach(function (b) {
            var v = cell(r.matrix, a, b);
            h += '<td class="' + (a === b ? 'diag' : (v ? 'off' : '')) + '">' + v + '</td>';
          });
          h += '</tr>';
        });
        h += '</tbody></table></div>';
      }

      if (r.disagreements.length) {
        h += '<h2 class="g">Take these to the discussion</h2><ul class="findings">';
        r.disagreements.forEach(function (d) {
          h += '<li class="warn"><span class="where">' + esc(d.label) + ' &middot; ' + d.count +
               '</span>units ' + esc(d.ids.join(', ')) +
               (d.count > d.ids.length ? ' and ' + (d.count - d.ids.length) + ' more' : '') + '</li>';
        });
        h += '</ul>';
      } else if (r.n) {
        h += '<p class="ok">No disagreements in this sample.</p>';
      }
      out.innerHTML = h;
    }

    function load(text) { rows = parseDelimited(text); if (rows.length) fillSelects(); render(); }

    ta.addEventListener('input', function () { load(ta.value); });
    [selId, selA, selB, mode].forEach(function (el) { el.addEventListener('change', render); });
    file.addEventListener('change', function () {
      var f = file.files && file.files[0];
      if (!f) return;
      var fr = new FileReader();
      fr.onload = function () { ta.value = String(fr.result); load(ta.value); };
      fr.readAsText(f);
    });
    clear.addEventListener('click', function () { ta.value = ''; rows = []; render(); ta.focus(); });
  });
}

if (typeof module !== 'undefined') {
  module.exports = { parseDelimited: parseDelimited, analyze: analyze, tally: tally,
                     cohensKappa: cohensKappa, krippendorffAlpha: krippendorffAlpha };
}
