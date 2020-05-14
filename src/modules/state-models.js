import { DynaPopModel } from './dyna-pop-model'

class StateModel extends DynaPopModel {
    constructor() {
        const params = {
            time: 600,
            maxSurplus: 1,
            tax: 1,
            populationGrowthRate: 0.02,
            expenditurePerCapita: 0.25,
            stateRevenueAtHalfCapacity: 10,
            carryCapacityDiff: 3,
        }
        super(params)
        this.modelType = 'Turchin Demographic Fiscal Model'
        this.dt = 1
    }

    initializeRun() {
        this.fn.carryCapacityFromStateRevenue = revenue =>
            1 +
            this.param.carryCapacityDiff *
                (revenue / (this.param.stateRevenueAtHalfCapacity + revenue))
        this.var.population = 0.2
        this.var.revenue = 0
    }

    calcAuxVars() {
        let s = this.var.revenue > 0 ? this.var.revenue : 0
        this.auxVar.carryingCapacity = this.fn.carryCapacityFromStateRevenue(s)
        this.auxVar.surplus =
            this.param.maxSurplus *
            (1 - this.var.population / this.auxVar.carryingCapacity)
    }

    calcDVars() {
        this.dVar.population =
            this.param.populationGrowthRate * this.var.population * this.auxVar.surplus
        this.dVar.revenue =
            this.param.tax *
                this.var.population *
                this.auxVar.surplus -
            this.param.expenditurePerCapita * this.var.population
        if (this.var.revenue < 0 && this.dVar.revenue <= 0) {
            this.dVar.revenue = 0
            this.var.revenue = 0
        }
    }

    getGuiParams() {
        let guiParams = [
            { key: 'time', max: 1000 },
            {
                key: 'maxSurplus',
                max: 2,
            },
            {
                key: 'tax',
                max: 2,
            },
            {
                key: 'populationGrowthRate',
                max: 0.1,
            },
            {
                key: 'expenditurePerCapita',
                max: 1,
            },
            {
                key: 'stateRevenueAtHalfCapacity',
                max: 50,
            },
        ]
        for (let param of guiParams) {
            this.fillGuiParam(param)
        }
        return guiParams
    }

    getCharts() {
        return [
            {
                title: 'People',
                id: 'people-chart',
                keys: ['population', 'carryingCapacity'],
                xlabel: 'year',
                markdown:
`
$$\\frac{d}{dt}population = populationGrowthRate \\times population \\times surplus $$
`

            },
            {
                title: 'Surplus',
                id: 'surplus-chart',
                keys: ['surplus'],
                xlabel: 'year',
                markdown:
`
$$surplus = maxSurplus \\times \\left(  1 - \\frac{ population } { carryingCapacity } \\right) $$
`

            },
            {
                title: 'Revenue',
                id: 'revenue-chart',
                keys: ['revenue'],
                xlabel: 'year',
                markdown:
`
$$\\frac{d}{dt}revenue = tax \\times population \\times surplus - expenditurePerCapita * population$$
`
            },
            {
                title: 'Carrying Capacity Function',
                id: 'carry-capacity-chart',
                fn: 'carryCapacityFromStateRevenue',
                xlims: [0, 100],
                ymin: 0,
                xlabel: 'Revenue',
                ylabel: 'Carrying Capacity',
                markdown:
`
$$ carryingCapacity = 1 + capacityDiff \\times \\left( \\frac{revenue}{ revenueAtHalfCapacity + revenue}  \\right)$$
`
            },
        ]
    }
}

export { StateModel }
