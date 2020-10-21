import _ from 'lodash'
import { FlowPopModel } from './flow-pop-model'

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
                id: 'compartment-chart',
                keys: _.keys(this.var),
                xlabel: 'days',
                markdown: `
                    The SIR model is the most basic epidemiological model of 
                    a transmissible disease. It consists of 3 populations (called
                    compartments): 
                    
                    - Susceptible patients don't have the disease,
                    - Infectious have caught the disease and can transmit it,  
                    - Recovered patients are immune      
                    
                    <br>  
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
                id: 'rn-chart',
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
