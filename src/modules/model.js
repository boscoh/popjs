/**
 * The model for property and fund growth
 * Created by boscoh on 24/5/17.
 */

import _ from 'lodash'

let defaultParams = {
  initialProperty: 600000.0,
  startupCost: 20000.0,
  deposit: 150000.0,
  interestPerYear: 5.0,
  mortgageLengthYear: 30,
  propertyGrowthPerYear: 4.5,
  initialRent: 2000,
  inflationPerYear: 1.5,
  fundGrowthPerYear: 6
}

function getMinimumPaymentMonth (principal, rateMonth, nMonth) {
  return (rateMonth * principal)
    / (1.0 - Math.pow(1.0 + rateMonth, -nMonth))
}

class Model {

  constructor (params) {
    this.params = _.assign(defaultParams, params)
    this.vars = {}
    this.soln = {}
    this.last = {}
    this.initializeVars()
  }

  initializeVars () {
    let vars = this.vars
    let params = this.params
    let initialPayment = params.startupCost + params.deposit
    vars.principal = params.initialProperty - params.deposit
    vars.propertyInterestTotal = initialPayment
    vars.property = params.initialProperty
    vars.interestTotal = 0
    vars.rentMonth = params.initialRent
    vars.rentTotal = 0
    vars.fund = initialPayment
    vars.fundPaidTotal = initialPayment
    vars.fundRentPaidTotal = initialPayment
    vars.propertyProfit = 0
    vars.fundProfit = 0
  }

  getInterestMonth (iMonth) {
    return (this.params.interestPerYear / 100.0 / 12.0)
  }

  getCapitalGrowthMonth (iMonth) {
    return (1.0 + this.params.propertyGrowthPerYear / 100.0 / 12.0)
  }

  getRentGrowthMonth (iMonth) {
    return (1.0 + this.params.inflationPerYear / 100.0 / 12.)
  }

  getFundGrowthMonth (iMonth) {
    return (1.0 + this.params.fundGrowthPerYear / 100.0 / 12.)
  }

  update (iMonth) {
    let last = this.last
    let vars = this.vars

    let nMonth = this.params.mortgageLengthYear * 12
    vars.paymentMonth = getMinimumPaymentMonth(
      last.principal,
      this.getInterestMonth(iMonth),
      nMonth - iMonth)

    vars.propertyInterestTotal = last.propertyInterestTotal + vars.paymentMonth
    vars.interestMonth = this.getInterestMonth(iMonth) * last.principal
    vars.interestTotal = last.interestTotal + vars.interestMonth
    vars.principalPaydownMonth = vars.paymentMonth - vars.interestMonth
    vars.principal = last.principal - vars.principalPaydownMonth
    vars.property = last.property * this.getCapitalGrowthMonth(iMonth)

    vars.rentMonth = last.rentMonth * this.getRentGrowthMonth(iMonth)
    vars.rentTotal = last.rentTotal + vars.rentMonth
    vars.fundMonth = Math.max(0, vars.paymentMonth - vars.rentMonth)
    vars.fund = last.fund * this.getFundGrowthMonth(iMonth) + vars.fundMonth
    vars.fundPaidTotal = last.fundPaidTotal + vars.fundMonth
    vars.fundRentPaidTotal = last.fundRentPaidTotal + vars.fundMonth + vars.rentMonth

    vars.propertyProfit = vars.property - vars.propertyInterestTotal - vars.principal
    vars.fundProfit = vars.fund - vars.fundRentPaidTotal
  }

  integrate () {
    let nMonth = this.params.mortgageLengthYear * 12
    let last = this.last
    let vars = this.vars
    let soln = this.soln

    for (let iMonth = 0; iMonth < nMonth; iMonth += 1) {

      for (let key of _.keys(vars)) {
        if (key in soln) {
          last[key] = _.last(soln[key])
        } else if (key in vars) {
          last[key] = vars[key]
        } else {
          last[key] = 0
        }
      }

      this.update(iMonth)

      for (let key of _.keys(vars)) {
        if (!(key in soln)) {
          soln[key] = []
        }
        soln[key].push(vars[key])
      }
    }
  }

}

export { defaultParams, Model }
