import { bisectionStep, bisectionInfo } from './bisection.js'
import { newtonStep, newtonInfo } from './newton.js'
import { secantStep, secantInfo } from './secant.js'
import { regulaFalsiStep, regulaFalsiInfo } from './regulaFalsi.js'
import { hornerNewtonStep, hornerInfo } from './hornerDeflation.js'

export const ALGORITHMS = {
  bisection: { ...bisectionInfo, step: bisectionStep },
  newton:    { ...newtonInfo,    step: newtonStep },
  secant:    { ...secantInfo,    step: secantStep },
  regulafalsi: { ...regulaFalsiInfo, step: regulaFalsiStep },
  horner: { ...hornerInfo, step: hornerNewtonStep },
}

export const PRESET_FUNCTIONS = [
  { label: 'x³ − x − 2',    expr: 'x^3 - x - 2',     defaultA: 1,   defaultB: 2,   defaultX0: 1.5, defaultX1: 2 },
  { label: 'cos(x) − x',     expr: 'cos(x) - x',       defaultA: 0,   defaultB: 1.5, defaultX0: 0.7, defaultX1: 1 },
  { label: 'x² − 4',         expr: 'x^2 - 4',          defaultA: 1,   defaultB: 3,   defaultX0: 3,   defaultX1: 2.5 },
  { label: 'eˣ − 3',         expr: 'e^x - 3',          defaultA: 0,   defaultB: 2,   defaultX0: 1,   defaultX1: 1.5 },
  { label: 'sin(x)',          expr: 'sin(x)',            defaultA: 2.5, defaultB: 4,   defaultX0: 3,   defaultX1: 3.5 },
  { label: 'x³ − 2x − 5',   expr: 'x^3 - 2*x - 5',   defaultA: 2,   defaultB: 3,   defaultX0: 2.5, defaultX1: 3 },
  { label: 'ln(x) − 1',      expr: 'log(x) - 1',       defaultA: 2,   defaultB: 4,   defaultX0: 3,   defaultX1: 2.5 },
  { label: 'x·eˣ − 1',       expr: 'x * e^x - 1',      defaultA: 0,   defaultB: 1,   defaultX0: 0.5, defaultX1: 0.8 },
]
