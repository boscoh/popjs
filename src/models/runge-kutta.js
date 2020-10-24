//https://github.com/giannotr/runge-kutta-js

const _scalarMult = (scalar, vector) => vector.map(x => scalar * x)

const _vectorAdd = (a, b) => a.map((x, i) => x + b[i])

const UndependentVariableError = new Error(
    'The destination of the undependent variable has to be greater than its start'
)

const StepSizeDivisibilityError = new Error(
    'The range has to be an divisible by the step size'
)

function integrateRungeKuttaStep (f, h, t, y) {
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

function runRungeKutta (equation, initialCondition, range, stepSize) {
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
