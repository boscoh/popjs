/**
 * The model for property and fund growth
 * Created by boscoh on 9/5/20.
 */

import _ from 'lodash'
import { DynaPopModel } from './dyna-pop-model'

function getMinimumPayment(principal, rate, nPeriod) {
    return (rate * principal) / (1.0 - Math.pow(1.0 + rate, -nPeriod))
}

class PropertyModel extends DynaPopModel {
    constructor(params) {
        const defaultParams = {
            initialProperty: 600000.0,
            deposit: 150000.0,
            interestRate: 0.05,
            mortgageLength: 30,
            propertyGrowthRate: 0.045,
            initialRentPerMonth: 2000,
            rentInflationRate: 0.015,
            fundGrowthRate: 6,
        }
        super(params)
        this.param = _.assign(defaultParams, params)
        this.dt = 1
    }

    initializeVars() {
        this.param.time = this.param.mortgageLength
        let initialPrincipal = this.param.initialProperty - this.param.deposit
        this.param.mortgagePayment = getMinimumPayment(
            initialPrincipal,
            this.param.interestRate,
            this.param.mortgageLength
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
        this.auxVar.interest = this.param.interestRate * this.var.principal
        this.auxVar.fundPayment = this.param.mortgagePayment - this.var.rent
        if (this.auxVar.fundPayment < 0) {
            this.auxVar.fundPayment = 0
        }

        this.auxVar.interestPerMonth = this.auxVar.interest / 12
        this.auxVar.mortgagePaymentPerMonth = this.param.mortgagePayment / 12
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
        this.dVar.totalInterest = this.auxVar.interest
        this.dVar.property = this.param.propertyGrowthRate * this.var.property
        if (this.var.principal >= 0) {
            this.dVar.principal = -(
                this.param.mortgagePayment - this.auxVar.interest
            )
        } else {
            this.dVar.principal = 0
        }
        this.dVar.totalPaidForPropertyAndInterest = this.param.mortgagePayment
        this.dVar.rent = this.param.rentInflationRate * this.var.rent
        this.dVar.totalRent = this.var.rent
        this.dVar.fund =
            this.param.fundGrowthRate * this.var.fund + this.auxVar.fundPayment
        this.dVar.totalPaidForFundAndRent = this.auxVar.fundPayment + this.var.rent
    }

    getGuiParams() {
        let guiParams = [
            {
                key: 'deposit',
                value: 150000.0,
                interval: 1000,
                max: 1500000
            },
            {comment: true, key: 'property parameters'},
            {
                key: 'initialProperty',
                value: 600000.0,
                interval: 10000,
                max: 1500000,
            },
            {
                key: 'propertyGrowthRate',
                value: 0.045,
                interval: 0.001,
                max: 0.18,
            },
            {comment: true, key: 'morgtage parameters'},
            {
                key: 'mortgageLength',
                value: 30,
                interval: 1,
                max: 100
            },
            {
                key: 'interestRate',
                value: 0.05,
                interval: 0.001,
                max: 0.18
            },
            {comment: true, key: 'investment fund parameters'},
            {
                key: 'fundGrowthRate',
                value: 0.06,
                interval: 0.001,
                max: 0.18
            },
            {comment: true, key: 'rent parameters'},
            {
                key: 'rentInflationRate',
                value: 0.015,
                interval: 0.001,
                max: 0.18
            },
            {
                key: 'initialRentPerMonth',
                value: 2000,
                interval: 100,
                max: 15000
            },
        ]

        for (let slider of guiParams) {
            slider.label = _.startCase(slider.key)
        }
        return guiParams
    }

    getCharts() {
        let charts = [
            {
                title: 'Property',
                id: 'property-chart',
                markdown:
`
There's that proverb which says rent money is dead money. But interest
repayments for a property is also dead money. Maybe that money could
have be better invested in a managed fund.

$\\sqrt{3x-1}+(1+x)^2$

So what is better in the long run - investing in property or investing
in managed funds?

### Property

The problem is that it's hard to visualize interest repayments. So here
we provide a visual way to compare the difference in strategies, whilst
allowing an exploration of assumptions of the world at large.
So let's compare the two

-   capital growth of the property
-   interest rate of the mortgage
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
                markdown:
`
### Invest Fund and Renting

An apt comparison is to compare a home-owner with a mortgage, with a
renter who invests in a managed fund. This way you can pit rental
payments versus mortgage interest payments. And incorporate startup
amounts.

More importantly, you can see the return on investment, profit made on
all payments, which should be the point of comparison. Of course, the
final profitability will also depend on the costs of sale (for a
property) and captial gains tax (for managed funds).

The actual result though depends very much on what you believe the
future will be like (up to 30 years for mortgages). So it is important
to see how the profit changes, when varying the four major variables
describing the future:

-   captial growth of the investment fund
-   inflation which affects rental prices
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
                markdown:
`
### Comparing the ROI

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
                markdown:
                    `
### Monthly Expenses comparison

`,
                id: 'monthly-chart',
                keys: [
                    'mortgagePaymentPerMonth',
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
