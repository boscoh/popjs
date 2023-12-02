import _ from 'lodash'
import md from 'markdown-it'
import mk from 'markdown-it-katex'
import dedent from 'dedent'
import { integrateRungeKuttaStep } from './runge-kutta'

function makeExponentialFunction(xVal, yVal, scale, yMin) {
    let yDiff = yVal - yMin
    return (x) => yDiff * Math.exp((scale * (x - xVal)) / yDiff) + yMin
}

function makeLinearFunction(slope, xZero) {
    return (x) => slope * (x - xZero)
}

function makeApproachFn(yInit, yFinal, xMidpoint) {
    const yDiff = yFinal - yInit
    return function (x) {
        if (x < 0) {
            return yInit
        }
        return yInit + yDiff * (x / (xMidpoint + x))
    }
}

function makeInverseSquareFunction(A, B, C, D) {
    return function (x) {
        // x_min = B / C
        let num = B - C * x
        return A / num / num - D
    }
}

function getCutoffFn(fn, xMax) {
    let yMax = fn(xMax)
    return function (x) {
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

const colors = [
    '#4ABDAC', // fresh
    '#FC4A1A', // vermilion
    '#F78733', // sunshine
    '#037584', // starry night
    '#007849', // iris
    '#FAA43A', // orange
    '#60BD68', // green
    '#F17CB0', // pink
    '#B2912F', // brown
    '#B276B2', // purple
    '#DECF3F', // yellow
    '#F15854', // red
    '#C08283', // pale gold
    '#dcd0c0', // silk
    '#E37222', // tangerine
]

const seenNames = []

function getColor(name) {
    let i = seenNames.indexOf(name)
    if (i < 0) {
        seenNames.push(name)
        i = seenNames.length - 1
    }
    return colors[i % colors.length]
}

class PopModel {
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
        this.integrateMethod = 'runWithRungeKutta'
    }

    fillParam(param) {
        if (!_.has(param, 'label')) {
            param.label = _.startCase(param.key)
            if (_.endsWith(param.label, 'Per Cent')) {
                param.label = param.label.replace('Per Cent', '')
                param.label += ' %'
            }
        }
        if (_.has(param, 'max') && !_.has(param, 'interval')) {
            let exp = _.floor(Math.log10(param.max))
            param.interval = Math.pow(10, exp - 2)
        }
        param.value = this.param[param.key]
        param.inputValue = param.value
    }

    /**
     * To be overriden
     */
    getInitialParams() {
        // return [{key: <string>, value: <float-string>}]
    }

    getDefaultGuiParams() {
        let guiParams = []
        for (let key in this.param) {
            if (key === 'dt') {
                continue
            }
            let val = this.param[key]
            if (val > 0) {
                val = 5 * val
            } else if (val === 0) {
                val = 1
            }
            guiParams.push({ key, max: val })
        }
        return guiParams
    }
    getParams() {
        let params = this.getInitialParams()
        for (let param of params) {
            this.fillParam(param)
        }
        return params
    }

    setParams(params) {
        for (let param of params) {
            if ('key' in param && 'value' in param) {
                this.param[param.key] = parseFloat(param.value)
            }
        }
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

    /**
     * To be overriden
     */
    calcAuxVars() {}

    /**
     * To be overriden
     */
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

    /**
     * To be overriden
     */
    preRunCheck() {}

    runWithEuler() {
        for (let i = 0; i < this.times.length; i += 1) {
            this.calcAuxVars()
            this.calcDVars()
            for (let k of this.varKeys) {
                this.var[k] += this.dVar[k] * this.dt
            }
            this.pushToSolution(this.var)
            this.pushToSolution(this.auxVar)
            if (_.some(_.values(this.var), (y) => y > this.yCutoff)) {
                break
            }
        }
    }

    runWithRungeKutta() {
        const f = (t, y) => this.getDVec(y)
        const maxTime = _.max(this.times)
        let t = 0
        let y = this.getVec()
        while (t <= maxTime) {
            y = integrateRungeKuttaStep(f, this.dt, t, y)
            this.setVec(y)
            this.calcAuxVars()
            this.pushToSolution(this.var)
            this.pushToSolution(this.auxVar)
            if (_.some(_.values(this.var), (y) => y > this.yCutoff)) {
                break
            }
            t += this.dt
        }
    }

    run() {
        this.initializeRun()
        this.varKeys = _.keys(this.var)
        this.calcAuxVars()
        this.calcDVars()
        this.resetSolutions()
        this.times = _.range(0, this.param.time, this.dt)
        this.preRunCheck()
        if (this.integrateMethod === 'runWithEuler') {
            this.runWithEuler()
        } else {
            this.runWithRungeKutta()
        }
    }

    /**
     * To be overriden
     */
    getCharts() {
        // return [{key: <string>, value: <float-string>}]
    }

    getChartJsTemplates() {
        let charts = this.getCharts()
        for (let chart of charts) {
            if (chart.markdown) {
                let parser = md()
                parser.use(mk, { insert_fonts_css: false })
                chart.html = parser.render(dedent(chart.markdown))
            }
            chart.options = {
                plugins: {
                    title: {
                        fontStyle: 'normal',
                        display: true,
                        text: _.get(chart, 'title', ''),
                    },
                    legend: {
                        display: true,
                        position: 'right',
                        labels: { usePointStyle: true },
                    },
                    tooltip: {
                        enabled: true,
                        mode: 'index',
                        intersect: false,
                        usePointStyle: true,
                        callbacks: {
                            title(context) {
                                console.log(context)
                                let label = context[0].label
                                return _.get(chart, 'xlabel', '') + ' ' + label
                            },
                            label(context) {
                                let label = context.dataset.label || ''
                                if (label) {
                                    label += ': '
                                }
                                let y = context.parsed.y
                                if (y !== null) {
                                    if (y > 10) {
                                        label += y.toFixed(0)
                                    } else {
                                        label += y.toFixed(2)
                                    }
                                }
                                return label
                            },
                        },
                    },
                    interaction: {
                        mode: 'nearest',
                        intersect: true,
                    },
                },
                maintainAspectRatio: false,
                scales: {
                    x: {
                        display: true,
                        type: 'linear',
                        title: {
                            display: true,
                            text: _.get(chart, 'xlabel', ''),
                        },
                    },
                    y: {
                        display: true,
                        type: 'linear',
                        title: {
                            display: true,
                            text: _.get(chart, 'ylabel', ''),
                        },
                    },
                },
            }
            let yAxis = chart.options.scales.y
            if ('ymin' in chart) {
                yAxis.min = chart.ymin
            }
            if ('ymax' in chart) {
                yAxis.max = chart.ymax
            }
            chart.colorByKey = {}
            for (let key of _.get(chart, 'keys', [])) {
                chart.colorByKey[key] = getColor(key)
            }
            if (chart.fn) {
                chart.colorByKey[chart.fn] = getColor(chart.fn)
            }
        }
        return charts
    }

    buildDataset(name, xValues, yValues, color) {
        const data = []
        if (xValues && yValues) {
            for (let i = 0; i < xValues.length; i += 1) {
                data.push({
                    x: xValues[i],
                    y: yValues[i],
                })
            }
        }
        return {
            label: _.startCase(name),
            data: data,
            fill: false,
            backgroundColor: color,
            borderColor: color,
            showLine: true,
            pointStyle: 'line',
            pointRadius: 0,
            borderWidth: 2,
        }
    }

    updateChartJsData(charts) {
        console.log('run')
        this.run()
        console.log('run finished')

        console.log('update charts')
        for (let chart of charts) {
            let data
            if (chart.fn) {
                const xlims = chart.xlims
                const xmin = xlims[0]
                const xmax = xlims[1]
                const xstep = (xmax - xmin) / 100
                const x = _.range(xmin, xmax, xstep)
                const y = _.map(x, this.fn[chart.fn])
                const color = chart.colorByKey[chart.fn]
                data = {
                    datasets: [this.buildDataset(chart.fn, x, y, color)],
                }
            } else {
                let datasets = []
                for (let key of _.get(chart, 'keys', [])) {
                    let xValues = []
                    let yValues = []
                    if (_.has(this.solution, key)) {
                        xValues = this.times
                        yValues = this.solution[key]
                    }
                    const color = chart.colorByKey[key]
                    datasets.push(
                        this.buildDataset(key, xValues, yValues, color)
                    )
                }
                data = { datasets }
            }
            chart.data = data
        }
    }
}

export {
    PopModel,
    makeExponentialFunction,
    makeLinearFunction,
    makeInverseSquareFunction,
    getCutoffFn,
    makeApproachFn,
}
