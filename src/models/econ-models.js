import {
    makeExponentialFunction,
    PopModel,
    makeLinearFunction,
} from './pop-model'

class EconModel extends PopModel {
    constructor() {
        const params = {
            time: 200,
            productivityGrowthRate: 0.015,
            populationGrowthRate: 0.02,
            capitalAccelerator: 3,
            depreciationRate: 0.06,
            initialWage: 0.85,
            initialLaborFraction: 0.61,
            interestRate: 0.04,
        }
        super(params)
        this.title = 'Keen-Minsky Financial Instability Model'
        this.yCutoff = 1e6
        this.dt = 0.05

        this.fn.wageFn = makeExponentialFunction(0.95, 0.0, 0.5, -0.01)
        this.fn.investFn = makeExponentialFunction(0.05, 0.05, 1.75, 0)

        this.fn.wageFn = makeLinearFunction(4, 0.6)
        this.fn.investFn = makeLinearFunction(10, 0.03)
    }

    initializeRun() {
        this.var.wage = this.param.initialWage
        this.var.productivity = 1
        this.var.population = 100
        this.var.laborFraction = this.param.initialLaborFraction
        this.var.output =
            this.var.laborFraction * this.var.population * this.var.productivity
        this.var.laborShare = this.var.wage / this.var.productivity
        this.var.debtRatio = 0
    }

    calcAuxVars() {
        this.auxVar.labor = this.var.laborFraction * this.var.population
        this.auxVar.wageDelta = this.fn.wageFn(this.var.laborFraction)
        this.auxVar.laborWages = this.var.wage * this.auxVar.labor

        this.auxVar.capital = this.var.output * this.param.capitalAccelerator

        this.auxVar.bankShare = this.param.interestRate * this.var.debtRatio
        this.auxVar.capitalShare =
            1 - this.var.laborShare - this.auxVar.bankShare
        this.auxVar.profitRate =
            this.auxVar.capitalShare / this.param.capitalAccelerator

        this.auxVar.investDelta = this.fn.investFn(this.auxVar.profitRate)
        this.auxVar.realGrowthRate =
            this.auxVar.investDelta / this.param.capitalAccelerator -
            this.param.depreciationRate

        this.auxVar.debt = this.var.debtRatio * this.var.output
        this.auxVar.bankIncome = this.auxVar.bankShare * this.var.output
        this.auxVar.capitalProfit = this.auxVar.capitalShare * this.var.output

        this.auxVar.investment = this.auxVar.investDelta * this.var.output
        this.auxVar.borrow = this.auxVar.investment - this.auxVar.capitalProfit
    }

    calcDVars() {
        this.dVar.wage = this.auxVar.wageDelta * this.var.wage

        this.dVar.productivity =
            this.param.productivityGrowthRate * this.var.productivity

        this.dVar.population =
            this.param.populationGrowthRate * this.var.population

        this.dVar.laborFraction =
            this.var.laborFraction *
            (this.auxVar.realGrowthRate -
                this.param.productivityGrowthRate -
                this.param.populationGrowthRate)

        this.dVar.output = this.var.output * this.auxVar.realGrowthRate

        this.dVar.laborShare =
            this.var.laborShare *
            (this.auxVar.wageDelta - this.param.productivityGrowthRate)

        this.dVar.debtRatio =
            this.auxVar.investDelta -
            this.auxVar.capitalShare -
            this.var.debtRatio * this.auxVar.realGrowthRate
    }

    getGuiParams() {
        let guiParams = [
            { key: 'time', max: 500 },
            {
                key: 'initialLaborFraction',
                max: 1.0,
            },
            {
                key: 'productivityGrowthRate',
                max: 0.1,
            },
            {
                key: 'populationGrowthRate',
                max: 0.2,
            },
            {
                key: 'capitalAccelerator',
                max: 10,
            },
            {
                key: 'depreciationRate',
                max: 0.1,
            },
            {
                key: 'interestRate',
                max: 0.2,
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
                title: 'Test',
                id: 'test-chart1',
                keys: ['laborShare', 'capitalShare', 'bankShare'],
                xlabel: 'year',
            },
            {
                markdown: `
The Keen-Minksy model, developed by [Steve Keen](https://keenomics.s3.amazonaws.com/debtdeflation_media/papers/PaperPrePublicationProof.pdf), 
models the economy by converting basic macroeconomic identities into a set of
coupled differential equations.

It uses the economic arguments of the Goodwin Business cycle and
 the Minsky financial instability hypothesis to generate analytic forms that 
 model the action of capitalists and bankers.

This is a powerful model that uses very clear and well-founded assumptions
to demonstrate how economies fall into natural business cycles, and
how economies can collapse from runaway debt.

The source code to this implementation of the model can be found [here](https://github.com/boscoh/popjs/blob/master/src/modules/econ-models.js).

### The Actors in the Economy

In this model, there are three actors - labor, capital and bank, and all
three affect the output of the total economy. The relationship 
between output, labor and capital are intertwined by these standard macro relationships 

$$output = labor \\times productivity$$
$$capital = output \\times capitalAccelerator$$
$$\\frac{d}{dt}(capital) = investment - depreciationRate \\times capital$$

However further equations are needed to represent how investment relates to
the banking sector. 

Skipping ahead, the model generates the evolution of the incomes
 of labor (wages), capital (profit) and bank (interest), based purely
 on endogenous self-interacting dynamics.
  
                `,
                title: 'Income of the 3 classes',
                id: 'output-chart',
                keys: ['laborWages', 'capitalProfit', 'bankIncome'],
                xlabel: 'year',
            },
            {
                markdown: `
To see the dynamics between the actors, it is easier to compare
the relative income, where population growth has been normalized. It
is a key feature of the model that potentially, the banking sector
 will overwhelm the entire economy and drive down wages and profit.
                `,
                title: 'The Share between the Classes',
                id: 'share-chart',
                keys: ['laborShare', 'capitalShare', 'bankShare'],
                xlabel: 'year',
            },
            {
                markdown: `
### The Workers

In our model, we have a typical population:

$$\\frac{d}{dt}(population) = population \\times populationGrowthRate$$

Productivity is assumed to increase steadily due to innovations in
technology:

$$\\frac{d}{dt}(productivity) = productivity \\times productivityGrowthRate$$

The number of employed workers - labor - depends on the other two actors
in the economy. Labor
depends on how much capital is in the system, and changes in capital 
depends on profitability, which in turn depends on wages:

$$laborWages = labor \\times wage$$

We must explicitly introduce a model of how wage changes:

$$\\frac{d}{dt}(wage) = wage \\times wageFunction \\left[ \\frac{labor}{population} \\right]$$

We use the Keen Wage Function that models the upward pressure on
the wage as the employment fraction approaches 1.
                `,
                title: 'The Keen Wage Function',
                id: 'wagefn-chart',
                fn: 'wageFn',
                xlims: [0.6, 1.05],
                ymin: 0,
                xlabel: 'Employed Fraction',
                ylabel: 'Wage Change',
            },

            {
                markdown: `
It is precisely the difficulty of thinking through this coupling
between labor, capital and bank that we need to build a set of dynamic 
equations to clarify their interactions.

In the resultant model, the population grows exponentially, but labor fluctuates with
the typical business cycle.
`,
                title: 'Workers in the Population',
                id: 'pop-chart',
                keys: ['population', 'labor'],
                xlabel: 'year',
            },
            {
                markdown: `
### The Profit Drive of Capital

The behaviour of capitalists is modeled as a reaction to profitability.

$$profit = output - laborWages - interest$$

$$profitability = \\frac{profit}{capital}$$

Based on the Minsky Hypothesis, a capitalist will want to invest
 more when the profitability is positive. This can be expressed
 through the Keen Investment Function that determines the desired
 investment as a function of profitability:
                `,
                title: 'The Keen Investment Function',
                id: 'investfn-chart',
                fn: 'investFn',
                xlims: [-0.4, 0.15],
                ymin: 0,
                xlabel: 'profitability',
                ylabel: 'Investment Change',
            },
            {
                markdown: `
Capital will then borrow the money needed for this investment from
a bank, which will presumably generate further profits:

$$borrow = investmentFunction\\left[profitability\\right] \\times output - profit$$

This allows the model to generate the investment and borrowing
behavior of the capitalist, and thus, we get the interest, which
becomes the income of the bank.
                `,
                title: 'What drives Investment',
                id: 'investment-chart',
                keys: ['capitalProfit', 'investment', 'borrow', 'bankIncome'],
                xlabel: 'year',
            },
            {
                markdown: `

### The Bank

Once we can model capitalists' propensity to borrow, we have a model
of the banking sector, and thus it's impact on the economy.

$$\\frac{d}{dt}(debt) = interestRate \\times debt + borrow$$

This model assumes (unlike neoclassical models) that banks 
create new money and new debt, upon making a loan. This is the official position 
taken by the [Bank of England](https://www.bankofengland.co.uk/-/media/boe/files/quarterly-bulletin/2014/money-creation-in-the-modern-economy.pdf?la=en&hash=9A8788FD44A62D8BB927123544205CE476E01654), and
other central banks.
  
The income of the bank is thus the interest generated from the debt:

$$interest = interestRate \\times debt$$

When combined with all the equations above, this finally results 
in this neat analytic form of the output changes:

$$\\frac{d}{dt}(output) = output \\times \\left( \\frac{investmentFunction\\left[\\frac{profit}{capital}\\right]}{capitalAccelerator} - depreciationRate \\right)$$

We can now see that the business cycle oscillates, but accumulates
debt, until the debt runs away and overwhelms the system with
interest payments.
                `,
                title: 'The Banking system in the Economy',
                id: 'debt-chart',
                keys: ['debt', 'capital', 'output', 'interest'],
                xlabel: 'year',
            },
        ]
    }
}

export { EconModel }
