/* Codebook Check - AURA Lab @ SIUE
   Everything runs in this page. No upload, no network request, no account.
   Parses a codebook written from the V2V template and reports what the
   assignment asks for that the draft does not yet have. It checks STRUCTURE.
   It cannot tell you whether a definition is a good definition. */

var NL = String.fromCharCode(10);
var BOLDCOLON = /^[*:\s]+/;
var LEVELS = ['nominal', 'ordinal', 'interval', 'ratio'];
var PLACEHOLDER = /<[^<>\n]{1,60}>/;
var CATCHALL = /unclassifiable|uncodable|other|none of the above|not applicable/i;
var STOP = ['that','this','with','from','what','when','does','their','they',
            'counts','none','above','criteria','settle','question'];

function sectionBody(md, titleStart) {
  // Plain line scanning on purpose: dynamic RegExp needs escaped strings and
  // escapes do not survive every authoring path reliably.
  var lines = md.split(NL), start = -1, i;
  for (i = 0; i < lines.length; i++) {
    var L = lines[i].trim();
    if (L.indexOf('## ') === 0 &&
        L.slice(3).trim().toLowerCase().indexOf(titleStart.toLowerCase()) === 0) { start = i; break; }
  }
  if (start === -1) return null;
  var body = [];
  for (i = start + 1; i < lines.length; i++) {
    if (lines[i].trim().indexOf('## ') === 0) break;
    body.push(lines[i]);
  }
  return body.join(NL);
}

function tableRows(block) {
  if (!block) return [];
  var rows = [];
  block.split('\n').forEach(function (line) {
    var t = line.trim();
    if (t.charAt(0) !== '|') return;
    var cells = t.split('|').slice(1, -1).map(function (c) { return c.trim(); });
    if (!cells.length) return;
    if (cells.every(function (c) { return /^:?-{2,}:?$/.test(c); })) return;
    rows.push(cells);
  });
  return rows;
}

function isEmptyish(s) {
  if (!s) return true;
  var t = String(s).replace(/[*_`>]/g, '').trim();
  return t === '' || PLACEHOLDER.test(t) || t.length < 3;
}

function parseVariables(md) {
  var vars = [], re = /^###\s*Variable\s*\d*\s*:?\s*(.*)$([\s\S]*?)(?=^###\s|^##\s|$(?![\s\S]))/gmi, m;
  while ((m = re.exec(md)) !== null) {
    var body = m[2];
    var field = function (label) {
      var ls = body.split(NL), k, low = label.toLowerCase();
      for (k = 0; k < ls.length; k++) {
        var lower = ls[k].toLowerCase(), at = lower.indexOf(low);
        if (at === -1) continue;
        return ls[k].slice(at + label.length).replace(BOLDCOLON, '').trim();
      }
      return '';
    };
    var rows = tableRows(body);
    var header = rows.length ? rows[0].map(function (c) { return c.toLowerCase(); }) : [];
    var dataRows = header.indexOf('category') !== -1 ? rows.slice(1) : rows;
    vars.push({
      name: m[1].trim(),
      conceptual: field('Conceptual definition'),
      operational: field('Operational definition'),
      level: field('Level of measurement'),
      manifest: field('Manifest or latent'),
      categories: dataRows.filter(function (r) { return r[0] && !isEmptyish(r[0]); })
                          .map(function (r) { return { label: r[0], desc: r[1] || '' }; })
    });
  }
  return vars;
}

function wordSet(s) {
  var out = {};
  String(s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).forEach(function (w) {
    if (w.length > 3 && STOP.indexOf(w) === -1) out[w] = 1;
  });
  return Object.keys(out);
}

function overlapPairs(cats) {
  var out = [];
  for (var i = 0; i < cats.length; i++) {
    for (var j = i + 1; j < cats.length; j++) {
      var a = cats[i], b = cats[j];
      if (CATCHALL.test(a.label) || CATCHALL.test(b.label)) continue;
      var la = wordSet(a.label), lb = wordSet(b.label);
      var subset = la.length && lb.length &&
        (la.every(function (w) { return lb.indexOf(w) !== -1; }) ||
         lb.every(function (w) { return la.indexOf(w) !== -1; }));
      var da = wordSet(a.desc), db = wordSet(b.desc);
      var inter = da.filter(function (w) { return db.indexOf(w) !== -1; }).length;
      var uni = {}; da.concat(db).forEach(function (w) { uni[w] = 1; });
      var jac = Object.keys(uni).length ? inter / Object.keys(uni).length : 0;
      if (subset || (da.length >= 3 && db.length >= 3 && jac >= 0.5)) {
        out.push([a.label, b.label, subset ? 'one label contains the other'
          : 'the descriptions share most of their distinctive words']);
      }
    }
  }
  return out;
}

function check(md) {
  var findings = [], vars = parseVariables(md);
  function add(level, where, msg) { findings.push({ level: level, where: where, msg: msg }); }

  if (/Delete this block before you commit/i.test(md))
    add('fail', 'Template', 'The template instruction block is still here. Delete it before you submit.');

  var unit = sectionBody(md, '1. Unit of analysis');
  if (unit === null) add('fail', 'Unit of analysis', 'No Unit of analysis section found.');
  else {
    var quoted = unit.split('\n').filter(function (l) { return l.trim().charAt(0) === '>'; })
                     .join(' ').replace(/>/g, '');
    if (isEmptyish(quoted))
      add('fail', 'Unit of analysis', 'The unit of analysis is still the placeholder or is empty. One coded case has to be named unambiguously.');
  }

  if (vars.length === 0) add('fail', 'Variables', 'No variable blocks found. Each one starts with a Variable heading.');
  if (vars.length > 0 && vars.length < 3)
    add('fail', 'Variables', 'Only ' + vars.length + ' variable(s). Three is the floor for a workable study.');

  vars.forEach(function (v, i) {
    var who = (v.name && !isEmptyish(v.name)) ? 'Variable ' + (i + 1) + ', ' + v.name : 'Variable ' + (i + 1);
    if (isEmptyish(v.name)) add('fail', who, 'The variable has no name, or the placeholder is still there.');
    if (isEmptyish(v.conceptual)) add('fail', who, 'No conceptual definition.');
    if (isEmptyish(v.operational)) add('fail', who, 'No operational definition. This is what the coder actually does to produce a value.');
    var lv = String(v.level || '').toLowerCase();
    if (isEmptyish(v.level)) add('fail', who, 'No level of measurement declared.');
    else if (!LEVELS.some(function (L) { return lv.indexOf(L) !== -1; }))
      add('fail', who, 'Level of measurement reads: ' + v.level + '. It has to be nominal, ordinal, interval or ratio.');
    if (isEmptyish(v.manifest)) add('warn', who, 'Manifest or latent is not stated. It decides how much judgment the coder is being asked for.');

    var real = v.categories.filter(function (c) { return !CATCHALL.test(c.label); });
    if (v.categories.length === 0) add('fail', who, 'No category table.');
    else {
      if (real.length < 2) add('fail', who, 'Fewer than two substantive categories.');
      if (!v.categories.some(function (c) { return CATCHALL.test(c.label); }))
        add('fail', who, 'No catch-all category. Without one the scheme is not exhaustive, so some case cannot be coded.');
      var nodesc = v.categories.filter(function (c) { return !CATCHALL.test(c.label) && isEmptyish(c.desc); });
      if (nodesc.length)
        add('fail', who, nodesc.length + ' category rows have no description: ' +
            nodesc.map(function (c) { return c.label; }).join(', ') + '. A label is not a rule.');
      overlapPairs(v.categories).forEach(function (p) {
        add('warn', who, 'Possible overlap between ' + p[0] + ' and ' + p[1] + ': ' + p[2] +
            '. Check whether a case could honestly fit both, and add a precedence rule if so.');
      });
    }
  });

  var rules = sectionBody(md, '3. Decision rules');
  var ruleItems = rules ? (rules.match(/^\s*\d+\.\s+.*$/gm) || []).filter(function (r) {
    return !isEmptyish(r.replace(/^\s*\d+\.\s*/, ''));
  }) : [];
  if (rules === null) add('fail', 'Decision rules', 'No Decision rules section found.');
  else if (ruleItems.length === 0) add('fail', 'Decision rules', 'No decision rules written yet. Every ambiguous case from your observation log becomes a rule here.');
  else if (vars.length && ruleItems.length < vars.length)
    add('warn', 'Decision rules', ruleItems.length + ' rules for ' + vars.length +
        ' variables. Thin, though not wrong if your categories really do sort themselves.');

  var ex = sectionBody(md, '4. Examples');
  var exRows = tableRows(ex).filter(function (r) { return r[0] && !isEmptyish(r[0]) && !/^case$/i.test(r[0]); });
  if (ex === null) add('fail', 'Examples', 'No Examples section found.');
  else if (exRows.length === 0) add('fail', 'Examples', 'No examples. Coders need prototypical cases to train on.');
  else {
    var allCats = [], covered = {};
    vars.forEach(function (v) {
      v.categories.forEach(function (c) { if (!CATCHALL.test(c.label)) allCats.push(c.label.toLowerCase()); });
    });
    exRows.forEach(function (r) { covered[String(r[2] || '').toLowerCase().trim()] = 1; });
    var missing = allCats.filter(function (c, k) { return c && !covered[c] && allCats.indexOf(c) === k; });
    if (missing.length)
      add('warn', 'Examples', 'No example for: ' + missing.join(', ') + '. The assignment asks for two or three per category.');
  }

  if (PLACEHOLDER.test(md))
    add('warn', 'Placeholders', 'Angle-bracket placeholders from the template are still in the file.');

  return { findings: findings, vars: vars };
}

var ESCMAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;' };
function esc(s) { return String(s).replace(/[&<>]/g, function (c) { return ESCMAP[c]; }); }

function render(md) {
  var out = document.getElementById('results');
  var sum = document.getElementById('summary');
  if (!md.trim()) { out.innerHTML = ''; sum.textContent = ''; return; }
  var r = check(md);
  var fails = r.findings.filter(function (f) { return f.level === 'fail'; });
  var warns = r.findings.filter(function (f) { return f.level === 'warn'; });
  sum.textContent = (fails.length === 0 && warns.length === 0)
    ? 'Nothing to flag. ' + r.vars.length + ' variables parsed. This checks structure, not whether your definitions are good ones.'
    : fails.length + ' missing, ' + warns.length + ' worth a look. ' + r.vars.length + ' variables parsed.';
  function group(arr, cls, title) {
    if (!arr.length) return '';
    return '<h2 class="g ' + cls + '">' + title + '</h2><ul class="findings">' +
      arr.map(function (f) {
        return '<li class="' + cls + '"><span class="where">' + esc(f.where) + '</span> ' + esc(f.msg) + '</li>';
      }).join('') + '</ul>';
  }
  out.innerHTML = group(fails, 'fail', 'Missing') + group(warns, 'warn', 'Worth a look') +
    ((fails.length === 0 && warns.length === 0) ? '<p class="ok">No structural problems found.</p>' : '');
}

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', function () {
    var ta = document.getElementById('src');
    ta.addEventListener('input', function () { render(ta.value); });
    document.getElementById('file').addEventListener('change', function (e) {
      var f = e.target.files[0]; if (!f) return;
      var rd = new FileReader();
      rd.onload = function () { ta.value = rd.result; render(ta.value); ta.focus(); };
      rd.readAsText(f);
    });
    document.getElementById('clear').addEventListener('click', function () {
      ta.value = ''; render(''); ta.focus();
    });
  });
}
if (typeof module !== 'undefined') { module.exports = { check: check, parseVariables: parseVariables }; }
