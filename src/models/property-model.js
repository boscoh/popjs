/**
 * The model for property and fund growth
 * Created by boscoh on 9/5/20.
 */

import { PopModel } from './pop-model'

function getMinimumPayment(principal, rate, nPeriod) {
    return (rate * principal) / (1.0 - Math.pow(1.0 + rate, -nPeriod))
}

class PropertyModel extends PopModel {
    constructor() {
        const defaultParams = {
            initialProperty: 600000.0,
            deposit: 150000.0,
            interestRate: 0.05,
            years: 30,
            propertyGrowthRate: 0.045,
            initialRentPerMonth: 2000,
            inflationRate: 0.015,
            fundGrowthRate: 0.08,
        }
        super(defaultParams)
        this.title = 'Property Vs Fund Analyzer'
        this.dt = 1
    }

    initializeRun() {
        this.param.time = this.param.years
        let initialPrincipal = this.param.initialProperty - this.param.deposit
        this.param.payment = getMinimumPayment(
            initialPrincipal,
            this.param.interestRate,
            this.param.years
        )

        this.var.property = this.param.initialProperty
        this.var.principal = initialPrincipal
        this.var.totalInterest = 0
        this.var.fund = this.param.deposit
        this.var.rent = this.param.initialRentPerMonth * 12
        this.var.totalRent = 0
        this.var.totalPaidForFundAndRent = this.param.deposit
        this.var.totalPaidForPropertyAndInterest = this.param.deposit
    }

    calcAuxVars() {
        this.auxVar.interestRate = this.param.interestRate * this.var.principal
        this.auxVar.fundPayment = this.param.payment - this.var.rent
        if (this.auxVar.fundPayment < 0) {
            this.auxVar.fundPayment = 0
        }

        this.auxVar.interestPerMonth = this.auxVar.interestRate / 12
        this.auxVar.paymentPerMonth = this.param.payment / 12
        this.auxVar.rentPerMonth = this.var.rent / 12
        this.auxVar.fundPaymentPerMonth = this.auxVar.fundPayment / 12

        this.auxVar.propertyProfit =
            this.var.property -
            this.param.deposit -
            this.var.principal -
            this.var.totalInterest

        this.auxVar.fundProfit =
            this.var.fund - this.param.deposit - this.var.totalRent
    }

    calcDVars() {
        this.dVar.totalInterest = this.auxVar.interestRate
        this.dVar.property = this.param.propertyGrowthRate * this.var.property
        if (this.var.principal >= 0) {
            this.dVar.principal = -(
                this.param.payment - this.auxVar.interestRate
            )
        } else {
            this.dVar.principal = 0
        }
        this.dVar.totalPaidForPropertyAndInterest = this.param.payment
        this.dVar.rent = this.param.inflationRate * this.var.rent
        this.dVar.totalRent = this.var.rent
        this.dVar.fund =
            this.param.fundGrowthRate * this.var.fund + this.auxVar.fundPayment
        this.dVar.totalPaidForFundAndRent =
            this.auxVar.fundPayment + this.var.rent
    }

    getGuiParams() {
        let guiParams = [
            {
                key: 'deposit',
                max: 1500000,
            },
            { comment: true, key: 'property parameters' },
            {
                key: 'initialProperty',
                max: 1500000,
            },
            {
                key: 'propertyGrowthRate',
                max: 0.18,
            },
            { comment: true, key: 'mortgage parameters' },
            {
                key: 'years',
                max: 100,
            },
            {
                key: 'interestRate',
                max: 0.18,
            },
            { comment: true, key: 'investment fund parameters' },
            {
                key: 'fundGrowthRate',
                max: 0.18,
            },
            { comment: true, key: 'rent parameters' },
            {
                key: 'inflationRate',
                max: 0.18,
            },
            {
                key: 'initialRentPerMonth',
                max: 15000,
            },
        ]
        for (let param of guiParams) {
            this.fillGuiParam(param)
        }
        return guiParams
    }

    getCharts() {
        let charts = [
            {
                title: 'Property',
                id: 'property-chart',
                markdown: `
There's that proverb which says rent money is dead money. But interest
repayment is also dead money. Maybe that could
have been better put in an investment fund. So which is better in the 
long run? 

One big problem with thinking about the profitability of property is 
that it's hard to visualize interest repayments. 
So here, we've provided a whole raft of interactive visualization 
to help you compare property to investment funds.

### Property

The first thing to do is express the growth in a property price
as a standard growth equation:

$$\\frac{d}{dt}(property) = property \\times propertyGrowthRate$$

We assume that you made a bank loan with a deposit, leaving you with 
a principal. Then the total interest paid is a growth equation based on 
the principal:

$$\\frac{d}{dt}(totalInterest) = principal \\times interestRate$$

The principal will decline with a death rate
equal to the portion of the mortgage payment not eaten by 
interest repayments:

$$principalRepayment = payment - principal \\times interestRate$$

$$\\frac{d}{dt}(principal) = -principalRepayment$$

The mortgage payment (per year) can be computed from this standard equation:

 $$payment =  principal \\times \\frac{ interestRate}{1 - interestRate \\times (1 + interestRate)^{-years})}$$
`,
                keys: [
                    'property',
                    'totalInterest',
                    'principal',
                    'totalPaidForPropertyAndInterest',
                    'propertyProfit',
                ],
            },
            {
                title: 'Investment Fund',
                markdown: `
### Investment Fund and Renting

Instead of buying a property with interest, one could invest the
same money in an investment fund. To make the comparison, we first
put the deposit in an investment fund. 

Then we take the standard mortgage payment as the equivalent of our income.
We put a chunk of that income into rent, where rents typically grows with inflation:

$$\\frac{d}{dt}(rent) = inflationRate \\times rent$$

$$\\frac{d}{dt}(totalRent) = rent$$

And thus the fund payment is what is left over, giving the
fund growth equation:

$$\\frac{d}{dt}(fund) = payment - rent$$
`,
                id: 'fund-chart',
                keys: [
                    'fund',
                    'totalRent',
                    'totalPaidForFundAndRent',
                    'fundProfit',
                ],
            },
            {
                title: 'Return on investment',
                markdown: `
### Comparison of Return of Investment 

We can compare the profitability of strategies between
buying a property or investing in a fund. In both cases,
we have a starting deposit, and the same montly income for
mortgage repayments, or rent and fund payments.

Then we can calculate profit:

$$propertyProfit = property - deposit - principal - totalInterest$$

$$fundProfit = fund - deposit - totalRent$$

The actual result of course depends on what you believe the
future will be like (up to 30 years for mortgages). This wil be
expressed through the rent inflation rate, property growth rate,
and bank interest rate.

The relative profitability depends on one's initial rent, the
size of the deposit, and the initial property price.
`,
                id: 'roi-chart',
                keys: [
                    'propertyProfit',
                    'fundProfit',
                    'totalPaidForPropertyAndInterest',
                    'totalPaidForFundAndRent',
                ],
            },
            {
                title: 'Monthly Expenses',
                markdown: `
### Monthly Expenses comparison

Finally, as a practical cash-flow concern, we can look
at how the differences play out on a monthly basis. We
cannot make a perfect comparison with the incomes as 
the rent inflation in later years may force us to pay more
per month than the minimum payment per month would allow.

If we're looking at dead money paid, it would be comparing
the payment of rent versus interest, on a monthly basis, 
for different scenarios.
`,
                id: 'monthly-chart',
                keys: [
                    'paymentPerMonth',
                    'interestPerMonth',
                    'rentPerMonth',
                    'fundPaymentPerMonth',
                ],
            },
        ]
        for (let chart of charts) {
            chart.xlabel = 'year'
        }
        return charts
    }
}

export { PropertyModel }
