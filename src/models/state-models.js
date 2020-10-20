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
        this.title = 'Turchin Demographic Fiscal Model'
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
        this.auxVar.carryingCapacityFunction = this.fn.carryCapacityFromStateRevenue(
            s
        )
        this.auxVar.surplus =
            this.param.maxSurplus *
            (1 - this.var.population / this.auxVar.carryingCapacityFunction)
    }

    calcDVars() {
        this.dVar.population =
            this.param.populationGrowthRate *
            this.var.population *
            this.auxVar.surplus
        this.dVar.revenue =
            this.param.tax * this.var.population * this.auxVar.surplus -
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
                markdown: `
Demographic models examine the endogenous evolution of a state, based on different key factors.
This particular model is Peter Turchin's Demographic Fiscal State Model and provides a simple model of how a state can
improve the carrying capacity of its environment, which augments the population, but also precipitates a sudden decline.
 
First, a state can organize a population to produce more food, which improves the growth rate of the population. This is
represented by the surplus:

$$\\frac{d}{dt}(population) = populationGrowthRate \\times population \\times surplus $$

The model makes simple assumptions about how the surplus relates to 
the carrying capacity and state revenue. In general the model shows how a state follows a simple growth and sudden decline simply due to internal dynamics
                `,
                title: 'People',
                id: 'people-chart',
                keys: ['population', 'carryingCapacityFunction'],
                xlabel: 'year',
            },
            {
                markdown: `
First we postulate a simple function of how revenue
improves the carrying capacity. It is a simple monotoically
increasing function that saturates to a given carrying
capacity, modeling the fact that there is an upper limit 
to how much the carrying capacity can be improved

$$ carryingCapacityFunction = 1 + capacityDiff \\times \\left( \\frac{revenue}{ revenueAtHalfCapacity + revenue}  \\right)$$
`,
                title: 'Carrying Capacity Function',
                id: 'carry-capacity-chart',
                fn: 'carryCapacityFromStateRevenue',
                xlims: [0, 100],
                ymin: 0,
                xlabel: 'Revenue',
                ylabel: 'Carrying Capacity',
            },
            {
                markdown: `
We define an expression for the surplus such that a 
surplus will be produced if the population is
below the carrying capacity, but if the 
population rises above the carrying capacity, crops will 
fail and the surplus will go negative. 

The surplus evolves over time as:

$$surplus = maxSurplus \\times \\left(  1 - \\frac{ population } { carryingCapacityFunction } \\right) $$
                `,
                title: 'Surplus',
                id: 'surplus-chart',
                keys: ['surplus'],
                xlabel: 'year',
            },
            {
                markdown: `
For the state to improve the carrying capacity, it must have
sufficient revenue collected from the population. This revenue
is defined as a fraction of the surplus produced by the population. As
well, the state is assume to spend some of the revenue on 
the population, and this is the expenditure.

$$\\frac{d}{dt}(revenue) = tax \\times population \\times surplus - expenditurePerCapita * population$$
                `,
                title: 'Revenue',
                id: 'revenue-chart',
                keys: ['revenue'],
                xlabel: 'year',
            },
        ]
    }
}

export { StateModel }
