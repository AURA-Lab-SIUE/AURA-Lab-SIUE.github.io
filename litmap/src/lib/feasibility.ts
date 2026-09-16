// The feasibility meter.
//
// Chapter 6 says to "narrow until it hurts a little, then narrow a bit more".
// Students do not argue with prose about scope. They argue with it constantly.
// They do not argue with a clock that reads 340 hours against 45 available.
//
// Every number below is the student's own estimate, and every step of the
// arithmetic is shown, because the point is not the total. The point is that
// they can see which input is the one making it impossible, and change that
// one rather than abandoning the project.
//
// Nothing here knows anything. It multiplies.

export interface FeasibilityInput {
  /** What one row is: a message, a post, a video, an article, a participant. */
  unitLabel: string
  /** How many units they intend to code. */
  units: number
  /** Minutes to code one unit, their estimate after a pilot if they have run one. */
  minutesPerUnit: number
  /** Coders. Two is the floor for a reliability check (Chapter 10). */
  coders: number
  /** Percent of the corpus double-coded for reliability, when coders > 1. */
  overlapPercent: number
  /** Hours already spent, or expected, building the codebook before coding. */
  setupHours: number
  /** Weeks left in the term. */
  weeksAvailable: number
  /** Hours per week they can actually give this, honestly. */
  hoursPerWeek: number
}

export const DEFAULT_FEASIBILITY: FeasibilityInput = {
  unitLabel: 'message',
  units: 0,
  minutesPerUnit: 1,
  coders: 2,
  overlapPercent: 20,
  setupHours: 8,
  weeksAvailable: 10,
  hoursPerWeek: 6,
}

export interface FeasibilityLine {
  label: string
  detail: string
  hours: number
}

export interface FeasibilityReport {
  lines: FeasibilityLine[]
  codingHours: number
  totalHours: number
  availableHours: number
  ratio: number
  verdict: 'empty' | 'comfortable' | 'tight' | 'over' | 'impossible'
  headline: string
  /** What single change would bring it inside the budget. */
  remedies: string[]
}

const round = (n: number) => Math.round(n * 10) / 10

export function computeFeasibility(input: FeasibilityInput): FeasibilityReport {
  const { unitLabel, units, minutesPerUnit, coders, overlapPercent, setupHours, weeksAvailable, hoursPerWeek } = input

  const availableHours = Math.max(0, weeksAvailable * hoursPerWeek)
  const unit = unitLabel.trim() || 'unit'
  const plural = units === 1 ? unit : `${unit}s`

  if (units <= 0 || minutesPerUnit <= 0) {
    return {
      lines: [],
      codingHours: 0,
      totalHours: setupHours,
      availableHours,
      ratio: 0,
      verdict: 'empty',
      headline: `Say how many ${plural} you plan to code and how long one takes, and this becomes a number.`,
      remedies: [],
    }
  }

  // One pass through the corpus by a single coder.
  const singlePass = (units * minutesPerUnit) / 60

  // Reliability is a double-coded SUBSET, not the whole corpus twice. Coding
  // everything twice is a choice some designs make; most do not, and a tool
  // that assumed it would tell students their project is twice as impossible
  // as it is.
  const overlapUnits = coders > 1 ? Math.ceil(units * (overlapPercent / 100)) : 0
  const overlapHours = (overlapUnits * minutesPerUnit) / 60

  // Disagreements have to be talked through. A third of the time it took to
  // code the overlap is a rough, stated convention, not a finding.
  const reconciliationHours = overlapHours / 3

  const lines: FeasibilityLine[] = [
    {
      label: 'Codebook and pilot',
      detail: 'Writing it, testing it on a handful of cases, fixing what breaks.',
      hours: setupHours,
    },
    {
      label: `Coding ${units.toLocaleString()} ${plural}`,
      detail: `${units.toLocaleString()} × ${minutesPerUnit} min`,
      hours: singlePass,
    },
  ]
  if (coders > 1) {
    lines.push({
      label: `Double-coding ${overlapPercent}% for reliability`,
      detail: `${overlapUnits.toLocaleString()} ${overlapUnits === 1 ? unit : `${unit}s`} coded a second time`,
      hours: overlapHours,
    })
    lines.push({
      label: 'Reconciling disagreements',
      detail: 'Talking through where the two coders differed',
      hours: reconciliationHours,
    })
  }

  const codingHours = singlePass + overlapHours + reconciliationHours
  const totalHours = codingHours + setupHours
  const ratio = availableHours > 0 ? totalHours / availableHours : Infinity

  let verdict: FeasibilityReport['verdict']
  if (ratio <= 0.6) verdict = 'comfortable'
  else if (ratio <= 1) verdict = 'tight'
  else if (ratio <= 2) verdict = 'over'
  else verdict = 'impossible'

  const headline =
    verdict === 'comfortable'
      ? `About ${round(totalHours)} hours against the ${round(availableHours)} you have. That fits, with room for the analysis and the writing.`
      : verdict === 'tight'
        ? `About ${round(totalHours)} hours against the ${round(availableHours)} you have. It fits, but only just, and nothing has gone wrong yet.`
        : verdict === 'over'
          ? `About ${round(totalHours)} hours against the ${round(availableHours)} you have. This does not fit.`
          : `About ${round(totalHours)} hours against the ${round(availableHours)} you have. This is not a semester project.`

  // What one change would bring it inside budget. Each is solved for
  // independently, so the student can pick the one they are willing to give up.
  const remedies: string[] = []
  if (ratio > 1) {
    // Aim under the ceiling, not at it. A plan that consumes every available
    // hour has no room for the analysis, the writing, or anything going wrong,
    // and float precision was landing the "fits" suggestion at ratio 1.0000001.
    const HEADROOM = 0.95
    const budgetForCoding = Math.max(0, availableHours * HEADROOM - setupHours)
    const overlapFactor = coders > 1 ? (overlapPercent / 100) * (1 + 1 / 3) : 0
    const perUnitHours = (minutesPerUnit / 60) * (1 + overlapFactor)
    const maxUnits = Math.floor(budgetForCoding / perUnitHours)
    if (maxUnits > 0) {
      remedies.push(
        `Code ${maxUnits.toLocaleString()} ${maxUnits === 1 ? unit : `${unit}s`} instead of ${units.toLocaleString()}. Sampling is a design decision, not a defeat.`
      )
    }
    const maxMinutes = units > 0 ? budgetForCoding / (units * ((1 + overlapFactor) / 60)) : 0
    if (maxMinutes >= 0.25 && maxMinutes < minutesPerUnit) {
      remedies.push(
        `Get coding down to ${round(maxMinutes)} minutes per ${unit}, from ${minutesPerUnit}. Usually that means fewer variables in the codebook.`
      )
    }
    const neededWeeklyHours = hoursPerWeek > 0 ? totalHours / weeksAvailable : 0
    if (neededWeeklyHours <= 20 && neededWeeklyHours > hoursPerWeek) {
      remedies.push(
        `Give it ${round(neededWeeklyHours)} hours a week rather than ${hoursPerWeek}. Be honest about whether that is real.`
      )
    }
    if (coders > 1 && overlapPercent > 10) {
      remedies.push(`Double-code 10% rather than ${overlapPercent}%, which is still a defensible reliability subsample.`)
    }
  }

  return { lines, codingHours, totalHours, availableHours, ratio, verdict, headline, remedies }
}
