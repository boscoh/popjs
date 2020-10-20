import { DynaPopModel } from './dyna-pop-model'
import _ from 'lodash'

export class FlowPopModel extends DynaPopModel {
    constructor() {
        super()
        this.auxVarFlows = []
        this.paramFlows = []
        this.dt = 1
    }

    calcDVars() {
        let flows = []

        for (let [from, to, auxVarKey] of this.auxVarFlows) {
            let val = this.auxVar[auxVarKey] * this.var[from]
            flows.push([from, to, val])
        }

        for (let [from, to, paramKey] of this.paramFlows) {
            let val = this.param[paramKey] * this.var[from]
            flows.push([from, to, val])
        }

        for (let key of _.keys(this.dVar)) {
            this.dVar[key] = 0
        }

        for (let [from, to, val] of flows) {
            this.dVar[from] -= val
            this.dVar[to] += val
        }
    }

    preRunCheck() {
        this.calcAuxVars()
        this.calcDVars()
        let auxVarKeys = _.keys(this.auxVar)
        for (let auxVarEvent of this.auxVarFlows) {
            let auxVarEventKey = auxVarEvent[2]
            if (!_.includes(auxVarKeys, auxVarEventKey)) {
                console.log(
                    `Error: ${auxVarEventKey} of this.auxVarFlows not ` +
                        `found in this.calcAuxVars`
                )
            }
        }
        let paramKeys = _.keys(this.param)
        for (let paramEvent of this.paramFlows) {
            let paramEventKey = paramEvent[2]
            if (!_.includes(paramKeys, paramEventKey)) {
                console.log(
                    `Error: ${paramEventKey} of this.paramFlows not ` +
                        `found in this.param`
                )
            }
        }
    }
}
