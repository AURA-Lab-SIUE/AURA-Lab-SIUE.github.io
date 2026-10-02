/* Inferential Check - AURA Lab
   Recompute the test from the numbers you are about to report, so the
   statistic, the degrees of freedom, the p value and the effect size in your
   write-up are the ones your own data produce.

   Runs in the page. Nothing is uploaded. */

var NL = String.fromCharCode(10);
var TAB = String.fromCharCode(9);

/* ---------- distributions ---------- */

function logGamma(x) {
  var c = [76.18009172947146, -86.50532032941677, 24.01409824083091,
           -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  var y = x, tmp = x + 5.5, ser = 1.000000000190015, j;
  tmp -= (x + 0.5) * Math.log(tmp);
  for (j = 0; j < 6; j++) ser += c[j] / ++y;
  return -tmp + Math.log(2.5066282746310005 * ser / x);
}

/* regularized lower incomplete gamma P(a, x) */
function gammaP(a, x) {
  if (x < 0 || a <= 0) return NaN;
  if (x === 0) return 0;
  if (x < a + 1) {
    var ap = a, sum = 1 / a, del = sum, n;
    for (n = 0; n < 500; n++) {
      ap++; del *= x / ap; sum += del;
      if (Math.abs(del) < Math.abs(sum) * 1e-14) break;
    }
    return sum * Math.exp(-x + a * Math.log(x) - logGamma(a));
  }
  /* continued fraction for Q(a, x) */
  var tiny = 1e-300;
  var b = x + 1 - a, c = 1 / tiny, d = 1 / b, h = d, i, an;
  for (i = 1; i < 500; i++) {
    an = -i * (i - a);
    b += 2;
    d = an * d + b; if (Math.abs(d) < tiny) d = tiny;
    c = b + an / c; if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d;
    var delta = d * c;
    h *= delta;
    if (Math.abs(delta - 1) < 1e-14) break;
  }
  var q = Math.exp(-x + a * Math.log(x) - logGamma(a)) * h;
  return 1 - q;
}

/* regularized incomplete beta I_x(a, b) */
function betaI(x, a, b) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  var lbeta = logGamma(a + b) - logGamma(a) - logGamma(b) +
              a * Math.log(x) + b * Math.log(1 - x);
  if (x < (a + 1) / (a + b + 2)) return Math.exp(lbeta) * betaCF(x, a, b) / a;
  return 1 - Math.exp(lbeta) * betaCF(1 - x, b, a) / b;
}

function betaCF(x, a, b) {
  var tiny = 1e-300, qab = a + b, qap = a + 1, qam = a - 1;
  var c = 1, d = 1 - qab * x / qap, m, m2, aa, del;
  if (Math.abs(d) < tiny) d = tiny;
  d = 1 / d;
  var h = d;
  for (m = 1; m <= 300; m++) {
    m2 = 2 * m;
    aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < tiny) d = tiny;
    c = 1 + aa / c; if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d; h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < tiny) d = tiny;
    c = 1 + aa / c; if (Math.abs(c) < tiny) c = tiny;
    d = 1 / d; del = d * c; h *= del;
    if (Math.abs(del - 1) < 1e-14) break;
  }
  return h;
}

function chiSquareP(x2, df) {
  if (!(df > 0) || x2 < 0) return NaN;
  return 1 - gammaP(df / 2, x2 / 2);
}

function tTwoTailedP(t, df) {
  if (!(df > 0)) return NaN;
  return betaI(df / (df + t * t), df / 2, 0.5);
}

/* ---------- parsing ---------- */

function parseTable(text) {
  var lines = String(text || '').split(String.fromCharCode(13, 10)).join(NL)
                .split(String.fromCharCode(13)).join(NL).split(NL);
  var rows = [], i;
  for (i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (line === '') continue;
    var cells = (line.indexOf(TAB) !== -1 ? line.split(TAB)
                : line.indexOf(',') !== -1 ? line.split(',')
                : line.split(/\s{2,}|\s+/)).map(function (c) { return c.trim(); });
    rows.push(cells);
  }
  return rows;
}

function isNum(s) { return s !== '' && isFinite(Number(String(s).replace(/,/g, ''))); }
function toNum(s) { return Number(String(s).replace(/,/g, '')); }

/* Turn a pasted crosstab into labels plus a numeric grid, tolerating a header
   row and a label column in any combination. */
function readCrosstab(text) {
  var rows = parseTable(text);
  if (rows.length < 2) return null;
  var hasHeader = rows[0].slice(1).every(function (c) { return !isNum(c); }) &&
                  rows[0].length > 1;
  var body = hasHeader ? rows.slice(1) : rows;
  var hasLabels = body.every(function (r) { return r.length > 1 && !isNum(r[0]); });
  var colNames = hasHeader
    ? rows[0].slice(hasLabels || !isNum(rows[0][0]) ? 1 : 0)
    : null;
  var rowNames = [], grid = [], i;
  for (i = 0; i < body.length; i++) {
    var r = body[i];
    var cells = hasLabels ? r.slice(1) : r;
    if (!cells.length || !cells.every(isNum)) return null;
    rowNames.push(hasLabels ? r[0] : 'row ' + (i + 1));
    grid.push(cells.map(toNum));
  }
  var width = grid[0].length;
  if (!grid.every(function (g) { return g.length === width; })) return null;
  if (!colNames || colNames.length !== width) {
    colNames = [];
    for (i = 0; i < width; i++) colNames.push('col ' + (i + 1));
  }
  return { rowNames: rowNames, colNames: colNames, grid: grid };
}

/* ---------- tests ---------- */

function chiSquare(tab) {
  var grid = tab.grid, R = grid.length, C = grid[0].length, i, j;
  var rowT = [], colT = [], n = 0;
  for (i = 0; i < R; i++) {
    rowT[i] = 0;
    for (j = 0; j < C; j++) { rowT[i] += grid[i][j]; n += grid[i][j]; }
  }
  for (j = 0; j < C; j++) { colT[j] = 0; for (i = 0; i < R; i++) colT[j] += grid[i][j]; }

  var notes = [], expected = [], x2 = 0, small = 0, anyZeroMargin = false;
  for (i = 0; i < R; i++) {
    expected[i] = [];
    for (j = 0; j < C; j++) {
      var e = rowT[i] * colT[j] / n;
      expected[i][j] = e;
      if (e === 0) { anyZeroMargin = true; continue; }
      if (e < 5) small++;
      x2 += Math.pow(grid[i][j] - e, 2) / e;
    }
  }
  var df = (R - 1) * (C - 1);
  var p = chiSquareP(x2, df);
  var cells = R * C;
  var v = n > 0 ? Math.sqrt(x2 / (n * Math.min(R - 1, C - 1))) : NaN;

  if (grid.some(function (r) { return r.some(function (c) { return c < 0 || c !== Math.round(c); }); }))
    notes.push({ level: 'fail', msg: 'Chi-square takes whole counts, not percentages, means, or decimals. Enter the number of cases in each cell.' });
  if (anyZeroMargin)
    notes.push({ level: 'fail', msg: 'A whole row or column is empty, so the table has fewer categories than it looks. Drop it and recount the degrees of freedom.' });
  if (small)
    notes.push({ level: small / cells > 0.2 ? 'fail' : 'warn',
      msg: small + ' of ' + cells + ' cells have an expected count below 5. The usual rule is that no more than 20 percent may, so collapse categories or report Fisher’s exact test instead.' });
  if (n < 20)
    notes.push({ level: 'warn', msg: 'Only ' + n + ' cases in the table. Chi-square is an approximation and it is poor at this size.' });
  if (df === 1 && n < 40)
    notes.push({ level: 'warn', msg: 'A 2 by 2 table with ' + n + ' cases. Many reviewers expect a continuity correction or an exact test below 40.' });

  return {
    kind: 'chi-square', n: n, x2: x2, df: df, p: p, v: v,
    rowNames: tab.rowNames, colNames: tab.colNames, grid: grid, expected: expected,
    notes: notes,
    apa: 'χ²(' + df + ', N = ' + n + ') = ' + x2.toFixed(2) + ', ' + pText(p) +
         ', Cramer’s V = ' + noZero(v)
  };
}

function tTest(g1, g2, opts) {
  opts = opts || {};
  var welch = opts.welch !== false;
  var n1 = g1.n, n2 = g2.n;
  var v1 = g1.sd * g1.sd, v2 = g2.sd * g2.sd;
  var diff = g1.mean - g2.mean;
  var t, df;
  if (welch) {
    var se = Math.sqrt(v1 / n1 + v2 / n2);
    t = diff / se;
    df = Math.pow(v1 / n1 + v2 / n2, 2) /
         (Math.pow(v1 / n1, 2) / (n1 - 1) + Math.pow(v2 / n2, 2) / (n2 - 1));
  } else {
    var sp2 = ((n1 - 1) * v1 + (n2 - 1) * v2) / (n1 + n2 - 2);
    t = diff / Math.sqrt(sp2 * (1 / n1 + 1 / n2));
    df = n1 + n2 - 2;
  }
  var p = tTwoTailedP(t, df);
  var sPooled = Math.sqrt(((n1 - 1) * v1 + (n2 - 1) * v2) / (n1 + n2 - 2));
  var d = diff / sPooled;

  var notes = [];
  if (n1 < 2 || n2 < 2)
    notes.push({ level: 'fail', msg: 'Each group needs at least two cases.' });
  if (n1 < 15 || n2 < 15)
    notes.push({ level: 'warn', msg: 'A group with fewer than 15 cases leans on the normality assumption. Look at the distribution before reporting this.' });
  var ratio = Math.max(v1, v2) / Math.min(v1, v2);
  if (isFinite(ratio) && ratio > 4)
    notes.push({ level: 'warn', msg: 'The variances differ by a factor of ' + ratio.toFixed(1) + '. Report the Welch test, which this page uses by default, and say so.' });
  if (Math.abs(d) < 0.2 && p < 0.05)
    notes.push({ level: 'warn', msg: 'Significant with d = ' + d.toFixed(2) + ', which is a trivial difference. Significance here is a statement about sample size, so write the effect size into the sentence.' });
  if (p >= 0.05 && Math.abs(d) >= 0.5)
    notes.push({ level: 'warn', msg: 'Not significant, but d = ' + d.toFixed(2) + '. The study may be underpowered rather than the groups equal, so do not write this up as no difference.' });

  return {
    kind: 't-test', welch: welch, t: t, df: df, p: p, d: d, diff: diff,
    g1: g1, g2: g2, notes: notes,
    apa: 't(' + df.toFixed(welch ? 1 : 0) + ') = ' + t.toFixed(2) + ', ' + pText(p) +
         ', d = ' + d.toFixed(2)
  };
}

function describe(values) {
  var n = values.length, i, sum = 0;
  for (i = 0; i < n; i++) sum += values[i];
  var mean = sum / n, ss = 0;
  for (i = 0; i < n; i++) ss += Math.pow(values[i] - mean, 2);
  return { n: n, mean: mean, sd: n > 1 ? Math.sqrt(ss / (n - 1)) : 0 };
}

/* Two columns: a group label and a numeric value, header row optional. */
function readTwoGroups(text) {
  var rows = parseTable(text);
  if (!rows.length) return null;
  if (rows[0].length < 2) return null;
  var start = isNum(rows[0][1]) ? 0 : 1;
  var groups = {}, order = [], i;
  for (i = start; i < rows.length; i++) {
    var g = rows[i][0], v = rows[i][1];
    if (!isNum(v)) continue;
    if (!groups[g]) { groups[g] = []; order.push(g); }
    groups[g].push(toNum(v));
  }
  if (order.length !== 2) return { error: order.length + ' group(s) found: ' + order.join(', ') + '. This test compares exactly two.' };
  return {
    names: order,
    g1: describe(groups[order[0]]),
    g2: describe(groups[order[1]])
  };
}

// APA drops the leading zero on a statistic that cannot exceed one.
function noZero(x) { return isNaN(x) ? 'not defined' : x.toFixed(2).replace(/^0/, ''); }

function pText(p) {
  if (isNaN(p)) return 'p not defined';
  if (p < 0.001) return 'p < .001';
  return 'p = ' + p.toFixed(3).replace(/^0/, '');
}

var ICStats = {
  chiSquareP: chiSquareP, tTwoTailedP: tTwoTailedP, readCrosstab: readCrosstab,
  chiSquare: chiSquare, tTest: tTest, readTwoGroups: readTwoGroups,
  describe: describe, pText: pText, parseTable: parseTable, noZero: noZero
};
if (typeof window !== 'undefined') window.ICStats = ICStats;

if (typeof module !== 'undefined') {
  module.exports = {
    chiSquareP: chiSquareP, tTwoTailedP: tTwoTailedP, readCrosstab: readCrosstab,
    chiSquare: chiSquare, tTest: tTest, readTwoGroups: readTwoGroups,
    describe: describe, pText: pText, parseTable: parseTable, noZero: noZero
  };
}
