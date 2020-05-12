import _ from 'lodash'
import rk45 from './rk45'

function makeExponentialFunction(xVal, yVal, scale, yMin) {
    let yDiff = yVal - yMin
    return x => yDiff * Math.exp((scale * (x - xVal)) / yDiff) + yMin
}

function makeLinearFunction(intercept, slope) {
    return x => intercept + slope * x
}

function makeInverseSquareFunction(A, B, C, D) {
    return function(x) {
        // x_min = B / C
        let num = B - C * x
        return A / num / num - D
    }
}

function getCutoffFn(fn, xMax) {
    let yMax = fn(xMax)
    return function(x) {
        if (x > xMax) {
            return yMax
        }
        let y = fn(x)
        if (y > yMax) {
            return yMax
        }
        return y
    }
}

class DynaPopModel {
    constructor(params) {
        this.param = _.assign({}, params)
        this.var = {}
        this.solution = {}
        this.auxVar = {}
        this.dVar = {}
        this.times = []
        this.fn = {}
        this.dt = 1
        this.yCutoff = 1e10
    }

    getGuiParams() {
        // return [{key: <string>, value: <float-string>}]
    }

    importGuiParams(guiParams) {
        for (let param of guiParams) {
            if ('key' in param && 'value' in param) {
                this.param[param.key] = parseFloat(param.value)
            }
        }
    }

    getCharts() {
        // return [{key: <string>, value: <float-string>}]
    }

    /**
     * To be overriden
     */
    initializeVars() {
        // set vars[key] values
    }

    resetSolutions() {
        for (let solnValues of _.values(this.solution)) {
            solnValues.length = 0
        }
    }

    getVec() {
        let result = []
        for (let k of this.varKeys) {
            result.push(this.var[k])
        }
        return result
    }

    setVec(vec) {
        for (let i = 0; i < vec.length; i += 1) {
            this.var[this.varKeys[i]] = vec[i]
        }
    }

    getDVec(vec) {
        this.setVec(vec)
        this.calcAuxVars()
        this.calcDVars()
        let result = []
        for (let k of this.varKeys) {
            result.push(this.dVar[k])
        }
        return result
    }

    calcAuxVars() {}

    calcDVars() {}

    // integrateDtWithEuler() {
    //     let vec = this.getVec()
    //     let dVec = this.getDVec(vec)
    //     let newVec = []
    //     for (let i = 0; i < vec.length; i += 1) {
    //         newVec.push(vec[i] + dVec[i] * this.dt)
    //     }
    //     this.setVec(newVec)
    //     this.calcAuxVars()
    // }

    integrateDtWithRungeKutta() {
        this.integrator = new rk45.System()
        this.integrator.setStart(0.0) // Initial start time, t=0.
        this.integrator.setStop(this.dt) // Time at which we want a solution, t=2.
        this.integrator.setInitX(this.getVec()) // y(0) -- value of y when t=0.
        this.integrator.setFn(v => this.getDVec(v)) // Differential equation we're solving.
        this.integrator.solve()
        this.status = this.integrator.getStatus()
        this.setVec(this.integrator.newX)
        this.calcAuxVars()
    }

    pushToSolution(d) {
        for (let key of _.keys(d)) {
            if (!(key in this.solution)) {
                this.solution[key] = []
            }
            if (isFinite(d[key])) {
                this.solution[key].push(d[key])
            } else {
                this.solution[key].push(null)
            }
        }

    }

    preRunCheck() {
    }

    run() {
        this.initializeVars()
        this.calcAuxVars()
        this.calcDVars()
        this.resetSolutions()
        this.times = _.range(0, this.param.time, this.dt)
        this.varKeys = _.keys(this.dVar)
        this.preRunCheck()
        for (let time of this.times) {
            this.integrateDtWithRungeKutta(time, this.dt)
            this.pushToSolution(this.var)
            this.pushToSolution(this.auxVar)
            if (_.some(_.values(this.var), y => y > this.yCutoff)) {
                break
            }
        }
    }
}

export {
    DynaPopModel,
    makeExponentialFunction,
    makeLinearFunction,
    makeInverseSquareFunction,
    getCutoffFn,
}
