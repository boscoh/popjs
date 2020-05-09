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
            fixedInterestRatePerYear: 0.05,
            mortgageLengthYear: 30,
            propertyGrowthPerYear: 0.045,
            initialRentPerMonth: 2000,
            inflationPerYear: 0.015,
            fundGrowthPerYear: 6,
        }
        super(params)
        this.param = _.assign(defaultParams, params)
        this.param.time = this.param.mortgageLengthYear
        this.dt = 1
    }




    initializeVars() {
        this.var.property = this.param.initialProperty
        let initPrincipal = this.param.initialProperty - this.param.deposit
        this.var.principal = initPrincipal
        this.var.totalInterest = 0
        this.var.totalFund = this.param.deposit
        this.var.rentPerYear = this.param.initialRentPerMonth * 12
        this.var.totalRent = 0
        this.var.totalPaidForFundAndRent = this.param.deposit
        this.var.totalPaidForPropertyAndInterest = this.param.deposit
        this.param.mortgagePerYear = getMinimumPayment(
            initPrincipal,
            this.param.fixedInterestRatePerYear,
            this.param.mortgageLengthYear
        )
    }

    calcAuxVars() {
        this.auxVar.interestPerYear = this.param.fixedInterestRatePerYear * this.var.principal
        this.auxVar.fundPaymentPerYear = this.param.mortgagePerYear - this.var.rentPerYear
        if (this.auxVar.fundPaymentPerYear < 0) {
            this.auxVar.fundPaymentPerYear = 0
        }

        this.auxVar.interestPerMonth = this.auxVar.interestPerYear / 12
        this.auxVar.mortgagePerMonth = this.param.mortgagePerYear / 12
        this.auxVar.rentPerMonth = this.var.rentPerYear / 12
        this.auxVar.fundPaymentPerMonth = this.auxVar.fundPaymentPerYear / 12

        this.auxVar.propertyProfit =
            this.var.property -
            this.param.deposit -
            this.var.principal -
            this.var.totalInterest

        this.auxVar.fundProfit =
            this.var.totalFund - this.param.deposit - this.var.totalRent
    }

    calcDVars() {
        this.dVar.totalInterest = this.auxVar.interestPerYear
        this.dVar.property = this.param.propertyGrowthPerYear * this.var.property
        if (this.var.principal >= 0) {
            this.dVar.principal = -(
                this.param.mortgagePerYear - this.auxVar.interestPerYear
            )
        } else {
            this.dVar.principal = 0
        }
        this.dVar.totalPaidForPropertyAndInterest = this.param.mortgagePerYear
        this.dVar.rentPerYear = this.param.inflationPerYear * this.var.rentPerYear
        this.dVar.totalRent = this.var.rentPerYear
        this.dVar.totalFund =
            this.param.fundGrowthPerYear * this.var.totalFund + this.auxVar.fundPaymentPerYear
        this.dVar.totalPaidForFundAndRent = this.auxVar.fundPaymentPerYear + this.var.rentPerYear
    }

    getGuiParams() {
        let guiParams = [
            {comment: true, key: 'future guesstimates'},
            {
                key: 'fixedInterestRatePerYear',
                value: 0.05,
                interval: 0.001,
                max: 0.18
            },
            {
                key: 'propertyGrowthPerYear',
                value: 0.045,
                interval: 0.001,
                max: 0.18,
            },
            {
                key: 'inflationPerYear',
                value: 0.015,
                interval: 0.001,
                max: 0.18
            },
            {
                key: 'fundGrowthPerYear',
                value: 0.06,
                interval: 0.001,
                max: 0.18
            },
            {comment: true, key: 'inital payments'},
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
                key: 'mortgageLengthYear',
                value: 30,
                interval: 1,
                max: 100
            },
            {comment: true, key: 'rent parameters'},
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
                divTag: 'property-chart',
                keys: [
                    'property',
                    'totalPaidForPropertyAndInterest',
                    'totalInterest',
                    'principal',
                    'propertyProfit',
                ],
            },
            {
                title: 'Investment Fund',
                divTag: 'fund-chart',
                keys: [
                    'totalFund',
                    'totalPaidForFundAndRent',
                    'totalRent',
                    'fundProfit',
                ],
            },
            {
                title: 'Return on investment',
                divTag: 'roi-chart',
                keys: [
                    'propertyProfit',
                    'totalPaidForPropertyAndInterest',
                    'totalPaidForFundAndRent',
                    'fundProfit',
                ],
            },
            {
                title: 'Monthly Expenses',
                divTag: 'monthly-chart',
                keys: [
                    'mortgagePerMonth',
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
