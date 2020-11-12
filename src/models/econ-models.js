import { PopModel, makeLinearFunction } from './pop-model'

class EconModel extends PopModel {
    constructor () {
        super()
        this.link =
            'https://github.com/boscoh/popjs/blob/master/src/models/econ-models.js'
        this.title = 'Keen-Minsky Financial Instability Model'
        this.yCutoff = 1e10
        this.dt = 0.05
        this.param.time = 200

        this.param.populationGrowthRate = 0.02
        this.param.capitalAccelerator = 3
        this.param.depreciationRate = 0.06
        this.param.productivityGrowthRate = 0.015

        this.param.interestRate = 0.04

        this.param.investSlope = 10
        this.param.investXOrigin = 0.03
        this.param.wageSlope = 4
        this.param.wageXOrigin = 0.6

        this.param.initialWage = 0.85
        this.param.initialLaborFraction = 0.61
    }

    initializeRun () {
        this.fn.wageFn = makeLinearFunction(
            this.param.wageSlope,
            this.param.wageXOrigin
        )
        this.fn.investFn = makeLinearFunction(
            this.param.investSlope,
            this.param.investXOrigin
        )

        this.var.wage = this.param.initialWage
        this.var.productivity = 1
        this.var.population = 100
        this.var.laborFraction = this.param.initialLaborFraction
        this.var.output =
            this.var.laborFraction * this.var.population * this.var.productivity
        this.var.laborShare = this.var.wage / this.var.productivity
        this.var.debtRatio = 0
    }

    calcAuxVars () {
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

    calcDVars () {
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

    getGuiParams () {
        return [
            { key: 'time', max: 500 },
            {
                key: 'populationGrowthRate',
                max: 0.2,
            },
            {
                key: 'productivityGrowthRate',
                max: 0.1,
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
            { key: 'wageSlope', max: 30, min: -30 },
            { key: 'wageXOrigin', max: 1, min: -1 },
            { key: 'investSlope', max: 30, min: -30 },
            { key: 'investXOrigin', max: 0.5, min: -0.5 },
            {
                key: 'initialLaborFraction',
                max: 1.0,
            },
        ]
    }

    getCharts () {
        return [
            {
                markdown: `
                    The Keen-Minksy model, developed by [Steve Keen](
                    https://keenomics.s3.amazonaws.com/debtdeflation_media/papers/PaperPrePublicationProof.pdf), 
                    provides a model 
                    of the economy that has the 
                    attractive feature of generating both stable business 
                    cycles and catastrophic crashes.

                    The economy has three sectors:
                    
                    1. labor takes wages from capital to generate output
                    2. capital borrows money for investment and pays for labor to generate output
                    3. bank lends money to capital and takes interest for income  
                
                    <br>
                    The starting point of the model are these equations 
                    between labor and capital, which are dynamical 
                    restatements of standard macroeconomic relationships 

                    $$output = labor \\times productivity$$
                    $$capital = output \\times capitalAccelerator$$
                    $$\\frac{d}{dt}(capital) = investment - depreciationRate \\times capital$$
                                       
                    Technology improvements to capital are embedded
                    in the capital accelerator term.
                     
                    The model generates the evolution of the relative incomes 
                    of labor (wage share), capital (profit share) and bank 
                    (bank share), based purely on self-interacting 
                    dynamics: 
                    `,
                title: 'Income Share of the 3 classes',
                keys: ['laborShare', 'capitalShare', 'bankShare'],
                xlabel: 'year',
            },
            {
                markdown: `
                    ### Workers
                    
                    In our model, we have a typical population:
                    
                    $$\\frac{d}{dt}(population) = population \\times populationGrowthRate$$
                    
                    Productivity is assumed to increase steadily due to innovations in
                    technology to worker efficiencies:
                    
                    $$\\frac{d}{dt}(productivity) = productivity \\times productivityGrowthRate$$

                    The population grows exponentially, but labor fluctuates with the typical 
                    business cycle. 
                   `,
                title: 'People',
                keys: ['population', 'labor'],
                xlabel: 'year',
            },
            {
                markdown: `
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
                fn: 'wageFn',
                xlims: [0.6, 1.05],
                xlabel: 'Employed Fraction',
                ylabel: 'Wage Change',
            },
            {
                markdown: `
                    ### Profit Drive of Capital
                    
                    The behaviour of capitalists is modeled as a reaction to profitability.
                    The profitability is defined by the profit rate:

                    $$profit = output - laborWages - interest$$
                    
                    $$profitability = \\frac{profit}{capital}$$
                    
                    And the amount that the capitalists would like to borrow is 
                    determined by the invest function, which models the psychological
                    behavior of capitalists.

                    $$borrow = investmentFunction\\left[profitability\\right] \\times output - profit$$
                    
                    Minsky argued that in general a capitalist will want to 
                    invest more when the profit rate is positive, and attempt
                    to divest if the situation is unprofitable (profit rate < 0).
                    This can be expressed through the Keen Investment Function:
                                    `,
                title: 'The Keen Investment Function',
                fn: 'investFn',
                xlims: [-0.4, 0.15],
                xlabel: 'profitability',
                ylabel: 'Investment Change',
            },
            {
                markdown: `
                    ### The Bank, their debt and the Economy                      
                    
                    The bank's role is to create debt to lend to capitalists. 
                    This assumes (unlike neoclassical models) that banks 
                    create new money and new debt, upon making a loan. 
                    This is the official position 
                    taken by central banks such as the [Bank of England](https://www.bankofengland.co.uk/-/media/boe/files/quarterly-bulletin/2014/money-creation-in-the-modern-economy.pdf?la=en&hash=9A8788FD44A62D8BB927123544205CE476E01654).
                    
                    The income of the bank is thus the interest generated from the debt,
                    paid by the capitalist:
                    
                    $$interest = interestRate \\times debt$$

                    Combining the money borrowed, and the interest payments, we
                    obtain the equation for the debt generated by the banking sector:
                    
                    $$\\frac{d}{dt}(debt) = interestRate \\times debt + borrow$$
                    
                    When combined with all the equations above, this finally results 
                    in this neat analytic form of the output changes:
                    
                    $$\\frac{d}{dt}(output) = output \\times \\left( \\frac{investmentFunction\\left[\\frac{profit}{capital}\\right]}{capitalAccelerator} - depreciationRate \\right)$$
                    
                    We can now plot all the major components to the output, 
                    and compare it to the bank debt. We can now see that the 
                    business cycle oscillates, but accumulates debt, 
                    until the debt runs away and overwhelms the system with 
                    interest payments. The breakdown point is when the profit 
                    of the capitalists is driven below zero due to the 
                    banking sector. 
                `,
                title: 'The Banking system in the Economy',
                keys: ['wages', 'profit', 'bank', 'capital', 'debt', 'output'],
                xlabel: 'year',
            },
        ]
    }
}

export { EconModel }
