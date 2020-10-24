import _ from 'lodash'
import { PopModel } from '@/models/pop-model'

class FlowPopModel extends PopModel {
    constructor () {
        super()
        this.auxVarFlows = []
        this.paramFlows = []
        this.dt = 1
    }

    calcDVars () {
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

    preRunCheck () {
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

class SirModel extends FlowPopModel {
    constructor () {
        super()

        this.name = 'SIR'
        this.title = 'Susceptible Infectious Recovered'
        this.dt = 0.1
        this.link =
            'https://github.com/boscoh/popjs/blob/master/src/models/epi-models.js'

        this.param = {
            time: 100,
            initialPopulation: 50000,
            initialPrevalence: 3000,
            infectiousPeriod: 10,
            recoverRate: 0.1,
            reproductionNumber: 3,
        }

        this.var = {
            susceptible: 0,
            infectious: 0,
            recovered: 0,
        }

        this.auxVarFlows.push(['susceptible', 'infectious', 'rateForce'])
        this.paramFlows.push(['infectious', 'recovered', 'recoverRate'])
    }

    initializeRun () {
        this.param.recoverRate = 1 / this.param.infectiousPeriod
        this.param.contactRate =
            this.param.reproductionNumber * this.param.recoverRate

        this.var.infectious = this.param.initialPrevalence
        this.var.susceptible =
            this.param.initialPopulation - this.param.initialPrevalence
        this.var.recovered = 0
    }

    calcAuxVars () {
        this.auxVar.population = _.sum(_.values(this.var))
        this.auxVar.rateForce =
            (this.param.contactRate / this.auxVar.population) *
            this.var.infectious
        this.auxVar.rn =
            (this.var.susceptible / this.auxVar.population) *
            this.param.reproductionNumber
    }

    getGuiParams () {
        let guiParams = [
            {
                key: 'time',
                max: 300,
            },
            {
                key: 'reproductionNumber',
                max: 20,
                label: 'R0',
            },
            {
                key: 'infectiousPeriod',
                max: 100,
                label: 'Infectious Period (days)',
            },
            {
                key: 'initialPrevalence',
                max: 100000,
                label: 'Prevalence',
            },
            {
                key: 'initialPopulation',
                max: 100000,
                label: 'Initial Population',
            },
        ]
        for (let param of guiParams) {
            this.fillGuiParam(param)
        }
        return guiParams
    }

    getCharts () {
        return [
            {
                title: 'COMPARTMENTS',
                keys: _.keys(this.var),
                xlabel: 'days',
                markdown: `
                    The SIR model is the most basic epidemiological model of 
                    a transmissible disease. It consists of 3 populations (called
                    compartments): 
                    
                    - Susceptible patients don't have the disease,
                    - Infectious have caught the disease and can transmit it,  
                    - Recovered patients are immune      
                    
                    The transmissability of disease is through the force of infection:
                    
                    $$forceOfInfection = \\frac{infectious}{population} \\times \\frac{R_0}{infectiousPeriod}$$
                    
                    $$recoverRate = \\frac{1}{infectiousPerod}$$
                    
                    where $R_0$ is the total number of people an infectious person would 
                    infect during the infectious period.
                    
                    This type of model is often called a compartmental model
                    as the change equations are balanced growth/decline equations where
                    the decline in one compartment (population) results in growth in another compartment:
                    
                    $$\\frac{d}{dt}susceptible = - susceptible \\times forceOfInfection$$
                    $$\\frac{d}{dt}infectious = - infectious \\times recoverRate + susceptible \\times forceOfInfection $$
                    $$\\frac{d}{dt}recovered = infectious \\times recoverRate$$
                    `,
            },
            {
                title: 'RN',
                keys: ['rn'],
                xlabel: 'days',
                markdown: `
                    To see the strength of the disease, it is best to look
                    the effective reproductive number:
                    
                    $$R_n = \\frac{susceptible}{population} \\times R_0$$
                    `,
            },
        ]
    }
}

export { SirModel }
