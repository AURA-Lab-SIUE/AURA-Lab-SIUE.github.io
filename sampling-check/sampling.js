/* Sampling Check - AURA Lab
   Three questions a content-analysis sampling plan has to answer: how much
   can you actually code in the time you have, how big the reliability sample
   needs to be, and how large a difference your sample could detect.

   Runs in the page. Nothing is uploaded. */

/* ---------- normal quantile, Acklam's rational approximation ---------- */

function qnorm(p) {
  if (p <= 0 || p >= 1) return NaN;
  var a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02,
           1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
  var b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02,
           6.680131188771972e+01, -1.328068155288572e+01];
  var c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00,
           -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
  var d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00,
           3.754408661907416e+00];
  var pLow = 0.02425, q, r;
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
           ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1);
  }
  if (p > 1 - pLow) return -qnorm(1 - p);
  q = p - 0.5; r = q * q;
  return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q /
         (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}

/* ---------- 1. time budget ---------- */

function timeBudget(input) {
  var secondsPerUnit = Number(input.secondsPerUnit);
  var variables = Number(input.variables) || 1;
  var hours = Number(input.hours);
  var coders = Number(input.coders) || 1;
  var notes = [];
  if (!(secondsPerUnit > 0) || !(hours > 0)) return null;

  /* Each extra variable costs less than the first: the coder reads the unit
     once. A 60 percent marginal cost is the working assumption, stated so a
     student can argue with it rather than inherit it. */
  var perUnit = secondsPerUnit * (1 + 0.6 * (variables - 1));
  var budget = hours * 3600;
  var gross = Math.floor(budget / perUnit);
  /* Reliability work is real work: a second pass over the reliability sample,
     plus the discussion, is not free. */
  var units = Math.floor(gross * 0.8);

  if (units < 100) notes.push({ level: 'warn', msg: 'Under 100 units is a small content analysis. Either find more hours, cut a variable, or narrow the research question so a smaller corpus still answers it.' });
  if (variables > 6) notes.push({ level: 'warn', msg: variables + ' variables is a lot to hold in a coder’s head. Each one also needs its own reliability figure.' });
  if (secondsPerUnit < 5) notes.push({ level: 'warn', msg: 'Under 5 seconds a unit assumes the coding is almost mechanical. Time yourself on 20 real units before planning on it.' });
  if (coders > 1) notes.push({ level: 'warn', msg: 'With ' + coders + ' coders the figure below is the shared total. It only holds if every coder has been trained on the same codebook.' });

  return {
    perUnit: perUnit, units: units * coders, gross: gross * coders,
    hours: hours, notes: notes
  };
}

/* ---------- 2. reliability sample ---------- */

function reliabilitySample(input) {
  var corpus = Number(input.corpus);
  var rarest = Number(input.rarest) / 100;
  var notes = [];
  if (!(corpus > 0)) return null;

  var tenPct = Math.ceil(corpus * 0.1);
  var floor = 50;
  var n = Math.max(floor, Math.min(tenPct, 300));
  /* Enough units for the rarest code to appear about ten times. */
  var forRare = (rarest > 0 && rarest < 1) ? Math.ceil(10 / rarest) : null;
  if (forRare && forRare > n) {
    n = Math.min(forRare, corpus);
    notes.push({ level: 'warn', msg: 'A code appearing in ' + (rarest * 100).toFixed(1) + ' percent of units needs about ' + forRare + ' units before it turns up often enough to measure agreement on. That, not the 10 percent rule, is what sets the number here.' });
  }
  if (n > corpus) { n = corpus; notes.push({ level: 'fail', msg: 'The reliability sample would have to be larger than the corpus. The corpus is too small for a rare code, so collapse it into a broader category.' }); }
  if (n / corpus > 0.5)
    notes.push({ level: 'fail', msg: 'The reliability sample would be ' + Math.round(100 * n / corpus) + ' percent of the corpus, which is not a sample. Either the corpus is too small for a category this rare, or the category has to be collapsed into a broader one.' });
  notes.push({ level: 'warn', msg: 'This is the FRESH reliability sample, drawn after training. The units the coders already discussed cannot be reported as reliability.' });

  return { n: n, corpus: corpus, pct: 100 * n / corpus, notes: notes };
}

/* ---------- 3. what the sample can detect ---------- */

var CHI_LAMBDA = { 1: 7.849, 2: 9.635, 3: 10.903, 4: 11.935, 5: 12.828, 6: 13.626 };

function detectable(input) {
  var n = Number(input.n);
  var alpha = Number(input.alpha) || 0.05;
  var power = Number(input.power) || 0.8;
  var df = Math.round(Number(input.df) || 1);
  var notes = [];
  if (!(n > 3)) return null;

  var za = qnorm(1 - alpha / 2), zb = qnorm(power);
  /* Two groups of equal size out of n total. */
  var perGroup = Math.floor(n / 2);
  var d = perGroup > 1 ? (za + zb) * Math.sqrt(2 / perGroup) : NaN;
  var nForMedium = Math.ceil(2 * 2 * Math.pow(za + zb, 2) / Math.pow(0.5, 2));

  var lambda = CHI_LAMBDA[df] || CHI_LAMBDA[6];
  var w = Math.sqrt(lambda / n);
  var nForW3 = Math.ceil(lambda / (0.3 * 0.3));

  if (d > 0.8) notes.push({ level: 'warn', msg: 'With ' + n + ' cases split into two groups, only a large difference (d above ' + d.toFixed(2) + ') would reach significance. A null result from this sample is weak evidence of no difference, and the write-up has to say so.' });
  if (w > 0.5) notes.push({ level: 'warn', msg: 'For the crosstab, only a large association (Cramer’s V above ' + w.toFixed(2) + ') would reach significance at this size.' });
  notes.push({ level: 'warn', msg: 'These are the smallest effects this sample could detect, not the effects you will find. Decide the sample before you see the data, and report this figure as a limitation either way.' });

  return {
    n: n, perGroup: perGroup, alpha: alpha, power: power, df: df,
    d: d, w: w, nForMedium: nForMedium, nForW3: nForW3, notes: notes
  };
}

var SamplingCore = {
  qnorm: qnorm, timeBudget: timeBudget,
  reliabilitySample: reliabilitySample, detectable: detectable
};
if (typeof window !== 'undefined') window.SamplingCore = SamplingCore;
if (typeof module !== 'undefined') module.exports = SamplingCore;
