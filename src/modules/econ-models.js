import _ from 'lodash'

// function makeLinearFunction(intercept, slope) {
//   return x => intercept + slope * x
// }

function makeExponentialFunction(xVal, yVal, scale, yMin) {
  let yDiff = yVal - yMin
  return x => yDiff * Math.exp((scale * (x - xVal)) / yDiff) + yMin
}

class Model {
  constructor(params) {
    this.param = _.assign({}, params)
    this.var = {}
    this.solution = {}
    this.lastVar = {}
    this.initializeVars()
    this.dVars = {}
    this.times = []
    this.dt = 1
  }

  /**
   * To be overriden
   */
  initializeVars() {
    // set vars[key] values
  }

  /**
   * To be overriden
   */
  update(time, dt) {
    // update this.var[key], access this.lastVar[key]
  }

  resetSolutions() {
    for (let solnValues of _.values(this.solution)) {
      solnValues.length = 0
    }
  }

  integrate() {
    for (let time of this.times) {
      for (let key of _.keys(this.var)) {
        if (key in this.solution) {
          this.lastVar[key] = _.last(this.solution[key])
        } else if (key in this.var) {
          this.lastVar[key] = this.var[key]
        } else {
          this.lastVar[key] = 0
        }
      }
      this.update(time, this.dt)
      for (let key of _.keys(this.var)) {
        if (!(key in this.solution)) {
          this.solution[key] = []
        }
        if (isFinite(this.var[key])) {
          this.solution[key].push(this.var[key])
        } else {
          this.solution[key].push(null)
        }
      }
    }
  }

  importGuiParams(guiParams) {
    console.log('importGuiParams', this.param, this.defaultParams)
    this.param = _.cloneDeep(this.defaultParams)
    for (let param of guiParams) {
      this.param[param.key] = parseFloat(param.value)
    }
  }

  run() {
    this.initializeVars()
    this.resetSolutions()
    this.dt = this.param.dt
    this.times = _.range(0, this.param.time, this.dt)
    this.integrate()
  }
}

class EconModel extends Model {
  constructor() {
    const params = {
      dt: 0.02,
      time: 300,
      initialEmployedFraction: 0.9,
      productivityExponent: 0.015,
      populationExponent: 0.035,
      depreciationRate: 0.02,
      capitalAccelerator: 2,
      initialInterestRate: 0.05,
      interestRateMultiplier: 0.0,
      wageLinearC: 4.8,
      wageLinearD: 5,
      wX: 0.95,
      wY: 0.0,
      wS: 0.5,
      wYMin: -0.01,
      pX: 0.05,
      pY: 0.05,
      pS: 1.75,
      pYMin: 0
    }
    super(params)

    this.defaultParams = _.cloneDeep(this.param)

    this.modelType = 'Keen Model'

    this.dt = 0.1

    this.guiParams = [
      {
        key: 'dt',
        value: 0.02,
        max: 0.1,
        min: 0.001,
        interval: 0.001,
        decimal: 3,
        label: 'Time interval'
      },
      {
        key: 'time',
        value: 20,
        max: 300,
        interval: 1,
        decimal: 0,
        label: 'Time'
      },
      {
        key: 'initialEmployedFraction',
        value: 0.9,
        max: 1.0,
        interval: 0.01,
        decimal: 2,
        label: 'Initial Fraction Employed'
      },
      {
        key: 'productivityExponent',
        value: 0.015,
        max: 0.1,
        interval: 0.001,
        decimal: 3,
        label: 'Productivity Constant'
      },
      {
        key: 'populationExponent',
        value: 0.035,
        max: 0.2,
        interval: 0.005,
        decimal: 3,
        label: 'Growth Rate'
      },
      {
        key: 'capitalAccelerator',
        value: 3,
        max: 10,
        interval: 0.1,
        decimal: 1,
        label: 'Capital Accelerator'
      },
      {
        key: 'depreciationRate',
        value: 0.02,
        max: 0.1,
        interval: 0.001,
        decimal: 3,
        label: 'Depreciation Rate'
      },
      {
        key: 'initialInterestRate',
        value: 0.04,
        max: 0.2,
        interval: 0.01,
        decimal: 2,
        label: 'Base Interest Rate'
      },
      {
        key: 'interestRateMultiplier',
        value: 0.0,
        max: 0.2,
        interval: 0.01,
        decimal: 2,
        label: 'Interest Multiplier'
      }
    ]

    for (let param of this.guiParams) {
      if (!_.has(param, 'label')) {
        param.label = param.key
      }
    }

    this.charts = [
      {
        title: 'INCOME',
        divTag: 'output-chart',
        keys: ['output', 'bank', 'wages', 'profit'],
        xlabel: 'time (days)'
      },
      {
        title: 'CAPITAL',
        divTag: 'debt-chart',
        keys: ['debt', 'capital', 'output'],
        xlabel: 'time (days)'
      },
      {
        title: 'SHARE',
        divTag: 'share-chart',
        keys: ['wageShare', 'profitShare', 'bankShare'],
        xlabel: 'time (days)'
      },
      {
        title: 'POPULATION',
        divTag: 'pop-chart',
        keys: ['population', 'employed'],
        xlabel: 'time (days)'
      },
      {
        title: 'WAGE CHANGE',
        divTag: 'wage-chart',
        keys: ['wage', 'wageChange'],
        xlabel: 'time (days)'
      },
      {
        title: 'INVESTMENT',
        divTag: 'investment-chart',
        keys: ['profit', 'investment', 'borrow'],
        xlabel: 'time (days)'
      },
      {
        title: 'WAGE-FUNCTION',
        divTag: 'wagefn-chart',
        keys: ['wageChange'],
        xlabel: 'Employed Fraction'
      },
      {
        title: 'INVESTMENT-FUNCTION',
        divTag: 'investfn-chart',
        keys: ['investmentChange'],
        xlabel: 'Profit Rate'
      }
    ]
  }

  initializeVars() {
    this.dt = this.param.dt

    // build functions
    this.fns = {}

    // this.fns.wageChangeFn = makeLinearFunction(
    //   -this.param.wageLinearC, this.param.wageLinearD)

    let fn0 = makeExponentialFunction(
      this.param.wX,
      this.param.wY,
      this.param.wS,
      this.param.wYMin
    )

    let A = 0.0000641
    let B = 1
    let C = 1
    let D = 0.0400641
    let fn1 = function(x) {
      let num = B - C * x
      return A / num / num - D
    }

    this.fns.wageChangeFn = function(x) {
      let xMax = 1.05
      let fn = fn0
      let yMax = fn(xMax)
      if (x > xMax) {
        return yMax
      }
      let y = fn(x)
      if (y > yMax) {
        return yMax
      }
      return y
    }

    let E = 0.0175
    let F = 0.53
    let G = 6
    let H = 0.065
    let fn2 = function(x) {
      let num = F - G * x
      return E / num / num - H
    }

    let fn3 = makeExponentialFunction(
      this.param.pX,
      this.param.pY,
      this.param.pS,
      this.param.pYMin
    )

    this.fns.investmentChangeFn = function(x) {
      let xMax = 0.1
      let fn = fn2
      let yMax = fn(xMax)
      if (x > xMax) {
        return yMax
      }
      let y = fn(x)
      if (y > yMax) {
        return yMax
      }
      return y
    }

    this.var.productivity = 1
    this.var.population = 100

    this.var.debt = 0.0
    this.var.bank = 0.0

    this.var.wageShare = 0.95

    // need to determine this.var.capital as independent variable
    this.var.employedFraction = this.param.initialEmployedFraction
    this.var.employed = this.var.employedFraction * this.var.population
    this.var.output = this.var.employed * this.var.productivity
    this.var.capital = this.param.capitalAccelerator * this.var.output

    this.var.wages = this.var.wageShare * this.var.output

    this.var.bankShare = this.var.bank / this.var.output
    this.var.debtRatio = this.var.debt / this.var.output

    this.var.debtRatio = this.var.debt / this.var.output
    this.var.interestRate =
      this.param.initialInterestRate +
      this.param.interestRateMultiplier * this.var.debtRatio

    this.var.profitShare = 1 - this.var.wageShare - this.var.bankShare

    this.var.profitRate =
      this.var.profitShare / this.param.capitalAccelerator
    this.var.investmentChange = this.fns.investmentChangeFn(
      this.var.profitRate
    )

    this.var.wage = this.var.wages / this.var.employed
    this.var.profit = this.var.profitShare * this.var.output

    this.var.employedFraction = this.var.employed / this.var.population
    this.var.wageChange = this.fns.wageChangeFn(this.var.employedFraction)
  }

  calcVars() {
    // this.var.capital is independent variable
    this.var.output = this.var.capital / this.param.capitalAccelerator
    this.var.employed = this.var.output / this.var.productivity
    this.var.bank = this.var.interestRate * this.var.debt

    this.var.debtRatio = this.var.debt / this.var.output
    this.var.interestRate =
      this.param.initialInterestRate +
      this.param.interestRateMultiplier * this.var.debtRatio

    this.var.wages = this.var.employed * this.var.wage
    this.var.profit = this.var.output - this.var.wages - this.var.bank

    this.var.wageShare = this.var.wages / this.var.output
    this.var.bankShare = this.var.bank / this.var.output
    this.var.profitShare = 1 - this.var.wageShare - this.var.bankShare

    this.var.profitRate = this.var.profit / this.var.capital
    this.var.investmentChange = this.fns.investmentChangeFn(
      this.var.profitRate
    )
    this.var.investment = this.var.investmentChange * this.var.output
    // this.var.investment = this.var.profit
    this.var.borrow = this.var.investment - this.var.profit

    this.var.employedFraction = this.var.employed / this.var.population
    this.var.wageChange = this.fns.wageChangeFn(this.var.employedFraction)
  }

  update(t) {
    this.calcVars()

    this.dVars.productivity =
      this.param.productivityExponent * this.var.productivity

    this.dVars.population =
      this.param.populationExponent * this.var.population

    this.dVars.wage = this.var.wageChange * this.var.wage

    this.dVars.debt = this.var.debt * this.var.interestRate + this.var.borrow

    this.dVars.capital =
      this.var.investment - this.param.depreciationRate * this.var.capital

    for (let key of _.keys(this.dVars)) {
      this.var[key] += this.dVars[key] * this.dt
    }

    this.calcVars()
  }
}

export { EconModel }
