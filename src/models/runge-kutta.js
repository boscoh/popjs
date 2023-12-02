/**
 * Rewrite of the library https://github.com/giannotr/runge-kutta-js
 * with a cleaner interface
 */

const _scalarMult = (scalar, vector) => vector.map(x => scalar * x)

const _vectorAdd = (a, b) => a.map((x, i) => x + b[i])

const UndependentVariableError = new Error(
    'The destination of the independent variable has to be greater than its start'
)

const StepSizeDivisibilityError = new Error(
    'The range has to be an divisible by the step size'
)

/**
 * @param {function} f is the multi-variate derivative f(y, v)
 * @param {number} h is the time step size in the integrator
 * @param {number} t is the current time
 * @param {array[number]} y is the initial value of v, vector of multi-variate values
 */
function integrateRungeKuttaStep(f, h, t, y) {
    const k1 = f(t, y)
    const k2 = f(t + 0.5 * h, _vectorAdd(y, _scalarMult(0.5 * h, k1)))
    const k3 = f(t + 0.5 * h, _vectorAdd(y, _scalarMult(0.5 * h, k2)))
    const k4 = f(t + h, _vectorAdd(y, _scalarMult(h, k3)))

    let yNext = []
    for (let k = 0; k < y.length; k++) {
        yNext.push(y[k] + (h * (k1[k] + 2 * k2[k] + 2 * k3[k] + k4[k])) / 6)
    }

    return yNext
}

/**
 * Integrates using Runge-Kutta a multi-vector time function given the derivative
 * f(t, x) for a set of vectors x over time t
 *
 * @param {function} equation - the effective derivative of f(t, v) -> number
 * @param {array[number]} initialCondition - initial value of v, a vector of numbers
 * @param {[number, number]} range - begin/end of t to integrate
 * @param {number} stepSize - time increments for integration
 */
function runRungeKutta(equation, initialCondition, range, stepSize) {
    const [start, end] = range

    if (end <= start) {
        throw UndependentVariableError
    }

    const nStep = (end - start) / stepSize

    if (!Number.isInteger(nStep)) {
        throw StepSizeDivisibilityError
    }

    let t = start
    let iStep = 0
    let y = initialCondition
    let yList = [y]
    while (iStep < nStep) {
        y = integrateRungeKuttaStep(equation, stepSize, t, y)
        yList.push(y)
        t += stepSize
        iStep++
    }
    return yList
}

export { runRungeKutta, integrateRungeKuttaStep }
