import _ from 'lodash'
import { makeExponentialFunction, DynaPopModel } from './dyna-pop-model'

class EconModel extends DynaPopModel {
    constructor() {
        const params = {
            time: 300,
            initialEmployedFraction: 0.9,
            productivityExponent: 0.015,
            populationExponent: 0.035,
            depreciationRate: 0.02,
            capitalAccelerator: 2,
            baseInterestRate: 0.05,
            interestRateMultiplier: 0.0,
        }
        super(params)
        this.defaultParams = _.cloneDeep(this.param)
        this.modelType = 'Keen PropertyModel'
        this.dt = 0.1
        this.fn.wageChange = makeExponentialFunction(0.95, 0.0, 0.5, -0.01)
        this.fn.investmentChange = makeExponentialFunction(0.05, 0.05, 1.75, 0)
    }

    initializeVars() {
        this.var.wage = 0.95
        this.var.productivity = 1
        this.var.population = 50
        this.var.debt = 0
        this.var.output =
            this.param.initialEmployedFraction *
            this.var.population *
            this.var.productivity
    }

    calcAuxVars() {
        this.auxVar.labor = this.var.output / this.var.productivity
        this.auxVar.laborFraction = this.auxVar.labor / this.var.population

        this.auxVar.wages = this.var.wage * this.auxVar.labor
        this.auxVar.debtRatio = this.var.debt / this.var.output
        this.auxVar.interestRate =
            this.param.baseInterestRate +
            this.param.interestRateMultiplier * this.auxVar.debtRatio
        this.auxVar.bank = this.auxVar.interestRate * this.var.debt
        this.auxVar.profit =
            this.var.output - this.auxVar.wages - this.auxVar.bank

        this.auxVar.wageShare = this.auxVar.wages / this.var.output
        this.auxVar.bankShare = this.auxVar.bank / this.var.output
        this.auxVar.profitShare =
            1 - this.auxVar.wageShare - this.auxVar.bankShare

        this.auxVar.capital = this.var.output * this.param.capitalAccelerator
        this.auxVar.profitRate = this.auxVar.profit / this.auxVar.capital
        this.auxVar.investmentChange = this.fn.investmentChange(
            this.auxVar.profitRate
        )
        this.auxVar.investment = this.auxVar.investmentChange * this.var.output
        this.auxVar.borrow = this.auxVar.investment - this.auxVar.profit

        this.auxVar.wageChange = this.fn.wageChange(this.auxVar.laborFraction)
    }

    calcDVars() {
        this.dVar.output =
            this.var.output *
            (this.auxVar.investmentChange / this.param.capitalAccelerator -
                this.param.depreciationRate)
        this.dVar.wage = this.auxVar.wageChange * this.var.wage
        this.dVar.productivity =
            this.param.productivityExponent * this.var.productivity
        this.dVar.population =
            this.param.populationExponent * this.var.population
        this.dVar.debt = this.auxVar.borrow
    }

    getGuiParams() {
        let guiParams = [
            {key: 'time', value: 100, max: 300, interval: 1},
            {
                key: 'initialEmployedFraction',
                value: 0.9,
                max: 1.0,
                interval: 0.01,
            },
            {
                key: 'productivityExponent',
                value: 0.015,
                max: 0.1,
                interval: 0.001,
            },
            {
                key: 'populationExponent',
                value: 0.035,
                max: 0.2,
                interval: 0.005,
            },
            {
                key: 'capitalAccelerator',
                value: 3,
                max: 10,
                interval: 0.1
            },
            {
                key: 'depreciationRate',
                value: 0.02,
                max: 0.1,
                interval: 0.001
            },
            {
                key: 'baseInterestRate',
                value: 0.04,
                max: 0.2,
                interval: 0.01
            },
            {
                key: 'interestRateMultiplier',
                value: 0.0,
                max: 0.2,
                interval: 0.01,
            },
        ]

        for (let param of guiParams) {
            if (!_.has(param, 'label')) {
                param.label = _.startCase(param.key)
            }
        }

        return guiParams
    }

    getCharts() {
        return [
            {
                title: 'INCOME',
                divTag: 'output-chart',
                keys: ['wages', 'profit', 'bank', 'output'],
                xlabel: 'year',
            },
            {
                title: 'CAPITAL',
                divTag: 'debt-chart',
                keys: ['debt', 'capital', 'output'],
                xlabel: 'year',
            },
            {
                title: 'SHARE',
                divTag: 'share-chart',
                keys: ['wageShare', 'profitShare', 'bankShare'],
                xlabel: 'year',
            },
            {
                title: 'POPULATION',
                divTag: 'pop-chart',
                keys: ['population', 'labor'],
                xlabel: 'year',
            },
            {
                title: 'WAGE CHANGE',
                divTag: 'wage-chart',
                keys: ['wage', 'wageChange'],
                xlabel: 'year',
            },
            {
                title: 'INVESTMENT',
                divTag: 'investment-chart',
                keys: ['profit', 'investment', 'borrow'],
                xlabel: 'year',
            },
            {
                title: 'WAGE-FUNCTION',
                divTag: 'wagefn-chart',
                keys: ['wageChange'],
                xlabel: 'Employed Fraction',
            },
            {
                title: 'INVESTMENT-FUNCTION',
                divTag: 'investfn-chart',
                keys: ['investmentChange'],
                xlabel: 'Profit Rate',
            },
        ]
    }
}

export { EconModel }
