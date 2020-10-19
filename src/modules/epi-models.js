import _ from 'lodash'
import { FlowPopModel } from './flow-pop-model'

class EpiModel extends FlowPopModel {
    constructor() {
        super()

        this.modelType = 'EPI'
        this.name = 'Base EPI Model'

        this.param = {
            time: 100,
            dtExponent: -1,
            initialPopulation: 50000,
            initialPrevalence: 3000,
            recoverRate: 0.1,
            reproductionNumber: 1.5,
            infectiousPeriod: 10,
        }

        this.var = {
            susceptible: 0,
            infectious: 0,
        }
    }

    calcAuxVars() {
        this.auxVar.population = _.sum(_.values(this.var))
        this.auxVar.rateForce =
            (this.param.contactRate / this.auxVar.population) *
            this.var.infectious
        this.auxVar.rn =
            (this.var.susceptible / this.auxVar.population) *
            this.param.reproductionNumber
    }

    getGuiParams() {
        let guiParams = [
            {
                key: 'time',
                max: 300,
            },
            { key: 'dtExponent', max: 3, min: -3 },
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

    getCharts() {
        let charts = [
            {
                title: 'COMPARTMENTS',
                id: 'compartment-chart',
                keys: _.keys(this.var),
                xlabel: 'days',
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
        return charts
    }
}

class SirModel extends EpiModel {
    constructor() {
        super()

        this.modelType = 'SIR'
        this.name = 'Susceptible Infectious Recovered'

        this.param = {
            time: 100,
            dtExponent: -1,
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

    initializeRun() {
        this.dt = Math.pow(10, this.param.dtExponent)
        this.param.recoverRate = 1 / this.param.infectiousPeriod
        this.param.contactRate =
            this.param.reproductionNumber * this.param.recoverRate
        this.var.infectious = this.param.initialPrevalence
        this.var.susceptible =
            this.param.initialPopulation - this.param.initialPrevalence
        this.var.recovered = 0
    }

    getCharts() {
        let charts = super.getCharts()
        charts[0].markdown = `
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
`
        return charts
    }
}

class SisModel extends EpiModel {
    constructor() {
        super()

        this.modelType = 'SIS'
        this.name = 'Susceptible Infectious Susceptible'

        this.param = {
            time: 100,
            dtExponent: -1,
            initialPopulation: 50000,
            initialPrevalence: 3000,
            recoverRate: 0.1,
            reproductionNumber: 3,
            infectiousPeriod: 10,
        }

        this.var = {
            susceptible: 0,
            infectious: 0,
        }
        this.auxVarFlows.push(['susceptible', 'infectious', 'rateForce'])
        this.paramFlows.push(['infectious', 'susceptible', 'recoverRate'])
    }

    initializeRun() {
        this.dt = Math.pow(10, this.param.dtExponent)
        this.param.recoverRate = 1 / this.param.infectiousPeriod
        this.param.contactRate =
            this.param.reproductionNumber * this.param.recoverRate

        this.var.infectious = this.param.initialPrevalence
        this.var.susceptible =
            this.param.initialPopulation - this.param.initialPrevalence
    }
}

class SEIRModel extends EpiModel {
    constructor() {
        super()

        this.modelType = 'SEIR'
        this.name = 'Susceptible Exposed Infections Recovered'

        this.param = {
            time: 500,
            dtExponent: -1,
            initialPopulation: 50000,
            incubationRate: 0.01,
            caseFatality: 0.2,
            initialPrevalence: 5000,
            reproductionNumber: 4,
            infectiousPeriod: 10,
        }

        this.var = {
            susceptible: 0,
            exposed: 0,
            infectious: 0,
            recovered: 0,
            dead: 0,
        }
        this.auxVarFlows.push(['susceptible', 'exposed', 'rateForce'])
        this.paramFlows.push(['exposed', 'infectious', 'incubationRate'])
        this.paramFlows.push(['infectious', 'recovered', 'recoverRate'])
        this.paramFlows.push(['infectious', 'dead', 'deathRate'])
    }

    initializeRun() {
        this.dt = Math.pow(10, this.param.dtExponent)
        this.param.deathRate =
            this.param.caseFatality / this.param.infectiousPeriod
        this.param.recoverRate =
            1 / this.param.infectiousPeriod - this.param.deathRate
        this.param.contactRate =
            this.param.reproductionNumber / this.param.infectiousPeriod

        for (let key of _.keys(this.var)) {
            this.var[key] = 0
        }
        this.var.infectious = this.param.initialPrevalence
        this.var.susceptible =
            this.param.initialPopulation - this.param.initialPrevalence
    }

    getGuiParams() {
        let guiParams = [
            {
                key: 'time',
                max: 1000,
            },
            { key: 'dtExponent', max: 3, min: -3 },
            {
                key: 'reproductionNumber',
                max: 15,
                label: 'R0',
            },
            {
                key: 'infectiousPeriod',
                max: 100,
                label: 'Infectious Period (days)',
            },
            {
                key: 'caseFatality',
                max: 1,
                label: 'Case-Fatality Rate',
            },
            {
                key: 'initialPrevalence',
                interval: 1,
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
}

class SEIRSModel extends EpiModel {
    constructor() {
        super()

        this.modelType = 'SEIRS'
        this.name = 'Susceptible Exposed Infections Recovered Susceptible'

        this.param = {
            time: 1500,
            dtExponent: -1,
            initialPopulation: 50000,
            incubationRate: 0.01,
            caseFatality: 0.2,
            initialPrevalence: 3000,
            reproductionNumber: 5,
            immunityPeriod: 50,
            infectiousPeriod: 10,
        }

        this.var = {
            susceptible: 0,
            exposed: 0,
            infectious: 0,
            recovered: 0,
            dead: 0,
        }

        this.auxVarFlows.push(['susceptible', 'exposed', 'rateForce'])

        this.paramFlows.push(['exposed', 'infectious', 'incubationRate'])
        this.paramFlows.push(['infectious', 'recovered', 'recoverRate'])
        this.paramFlows.push(['recovered', 'susceptible', 'immunityLossRate'])
        this.paramFlows.push(['infectious', 'dead', 'deathRate'])
    }

    initializeRun() {
        this.dt = Math.pow(10, this.param.dtExponent)
        this.param.deathRate =
            this.param.caseFatality / this.param.infectiousPeriod
        this.param.recoverRate =
            1 / this.param.infectiousPeriod - this.param.deathRate
        this.param.contactRate =
            this.param.reproductionNumber / this.param.infectiousPeriod
        this.param.immunityLossRate = 1 / this.param.immunityPeriod

        for (let key of _.keys(this.var)) {
            this.var[key] = 0
        }
        this.var.infectious = this.param.initialPrevalence
        this.var.susceptible =
            this.param.initialPopulation - this.param.initialPrevalence
    }

    getGuiParams() {
        let guiParams = [
            {
                key: 'time',
                max: 3000,
            },
            { key: 'dtExponent', max: 3, min: -3 },
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
                key: 'caseFatality',
                max: 1,
                label: 'Case-Fatality Rate',
            },
            {
                key: 'immunityPeriod',
                max: 300,
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
}

let epiModels = [SirModel, SisModel, SEIRModel, SEIRModel, SEIRSModel]

export { epiModels }
