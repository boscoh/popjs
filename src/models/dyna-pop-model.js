import _ from 'lodash'
//https://github.com/giannotr/runge-kutta-js
import rungeKutta from 'runge-kutta'

function makeExponentialFunction(xVal, yVal, scale, yMin) {
    let yDiff = yVal - yMin
    return x => yDiff * Math.exp((scale * (x - xVal)) / yDiff) + yMin
}

function makeLinearFunction(slope, xZero) {
    return x => slope * (x - xZero)
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

    fillGuiParam(param) {
        if (!_.has(param, 'label')) {
            param.label = _.startCase(param.key)
        }
        if (_.has(param, 'max') && !_.has(param, 'interval')) {
            let exp = _.floor(Math.log10(param.max))
            param.interval = Math.pow(10, exp - 2)
        }
        param.value = this.param[param.key]
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
    initializeRun() {
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

    preRunCheck() {}

    runWithEuler() {
        for (let i = 0; i < this.times.length; i += 1) {
            this.calcAuxVars()
            this.calcDVars()
            for (let k of this.varKeys) {
                this.var[k] = this.var[k] + this.dVar[k] * this.dt
            }
            this.calcAuxVars()
            this.pushToSolution(this.var)
            this.pushToSolution(this.auxVar)
            if (_.some(_.values(this.var), y => y > this.yCutoff)) {
                break
            }
        }
    }

    runRungeKutta() {
        const maxTime = Math.round(_.max(this.times) / this.dt) * this.dt
        const output = rungeKutta(
            (t, y) => this.getDVec(y),
            this.getVec(),
            [0, maxTime],
            this.dt
        )
        for (let vec of output) {
            this.setVec(vec)
            this.calcAuxVars()
            this.pushToSolution(this.var)
            this.pushToSolution(this.auxVar)
        }
    }

    run() {
        this.initializeRun()
        this.calcAuxVars()
        this.calcDVars()
        this.resetSolutions()
        this.times = _.range(0, this.param.time, this.dt)
        this.varKeys = _.keys(this.dVar)
        this.preRunCheck()
        this.runRungeKutta()
    }
}

export {
    DynaPopModel,
    makeExponentialFunction,
    makeLinearFunction,
    makeInverseSquareFunction,
    getCutoffFn,
}