import _ from 'lodash'
import { FlowPopModel } from './flow-pop-model'

class SirModel extends FlowPopModel {
    constructor() {
        super()

        this.modelType = 'SIR'
        this.name = 'Susceptible Infectious Recovered'

        this.param = {
            time: 100,
            initPopulation: 50000,
            initPrevalence: 3000,
            recoverRate: 0.1,
            reproductionNumber: 1.5,
            durationInfection: 10,
        }

        this.var = {
            susceptible: 0,
            infectious: 0,
            recovered: 0,
        }
        this.auxVarFlows.push(['susceptible', 'infectious', 'rateForce'])
        this.paramFlows.push(['infectious', 'recovered', 'recoverRate'])
    }

    initializeVars() {
        this.param.recoverRate = 1 / this.param.durationInfection
        this.param.contactRate =
            this.param.reproductionNumber * this.param.recoverRate
        this.var.infectious = this.param.initPrevalence
        this.var.susceptible =
            this.param.initPopulation - this.param.initPrevalence
        this.var.recovered = 0
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
                value: 100,
                max: 300,
                interval: 1,
                placeHolder: '',
                label: 'Time',
                decimal: 0,
            },
            {
                key: 'reproductionNumber',
                value: 1.5,
                interval: 0.1,
                max: 20,
                placeHolder: '',
                label: 'R0',
                decimal: 1,
            },
            {
                key: 'durationInfection',
                value: 10,
                interval: 1,
                max: 100,
                placeHolder: '',
                label: 'Infectious Period (days)',
                decimal: 0,
            },
            {
                key: 'initPrevalence',
                value: 3000,
                max: 100000,
                placeHolder: '',
                interval: 1,
                label: 'Prevalence',
                decimal: 0,
            },
            {
                key: 'initPopulation',
                value: 50000,
                max: 100000,
                interval: 1,
                placeHolder: '',
                label: 'Initial Population',
                decimal: 0,
            },
        ]
        return guiParams
    }
}

class SisModel extends FlowPopModel {
    constructor() {
        super()

        this.modelType = 'SIS'
        this.name = 'Susceptible Infectious Susceptible'

        this.param = {
            time: 100,
            initPopulation: 50000,
            initPrevalence: 3000,
            recoverRate: 0.1,
            reproductionNumber: 1.5,
            durationInfection: 10,
        }

        this.var = {
            susceptible: 0,
            infectious: 0,
        }
        this.auxVarFlows.push(['susceptible', 'infectious', 'rateForce'])
        this.paramFlows.push(['infectious', 'susceptible', 'recoverRate'])
    }

    initializeVars() {
        this.param.recoverRate = 1 / this.param.durationInfection
        this.param.contactRate =
            this.param.reproductionNumber * this.param.recoverRate

        for (let key of _.keys(this.var)) {
            this.var[key] = 0
        }
        this.var.infectious = this.param.initPrevalence
        this.var.susceptible =
            this.param.initPopulation - this.param.initPrevalence
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
                value: 100,
                max: 300,
                interval: 1,
                placeHolder: '',
                label: 'Time',
                decimal: 0,
            },
            {
                key: 'reproductionNumber',
                value: 1.5,
                max: 20,
                interval: 0.1,
                placeHolder: '',
                label: 'R0',
                decimal: 1,
            },
            {
                key: 'durationInfection',
                value: 10,
                interval: 1,
                max: 100,
                placeHolder: '',
                label: 'Infectious Period (days)',
                decimal: 0,
            },
            {
                key: 'initPrevalence',
                value: 3000,
                max: 100000,
                interval: 1,
                placeHolder: '',
                label: 'Prevalence',
                decimal: 0,
            },
            {
                key: 'initPopulation',
                value: 50000,
                max: 100000,
                interval: 1,
                placeHolder: '',
                label: 'Initial Population',
                decimal: 0,
            },
        ]
        return guiParams
    }
}

class SEIRModel extends FlowPopModel {
    constructor() {
        super()

        this.modelType = 'SEIR'
        this.name = 'Susceptible Exposed Infections Recovered'

        this.param = {
            time: 100,
            initPopulation: 50000,
            period: 0.1,
            incubation: 0.01,
            caseFatality: 0.2,
            initPrevalence: 5000,
            reproductionNumber: 4,
            durationInfection: 10,
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
        this.paramFlows.push(['infectious', 'infectious', 'disDeath'])
        this.paramFlows.push(['infectious', 'recovered', 'recoverRate'])
        this.paramFlows.push(['infectious', 'dead', 'deathRate'])
    }

    initializeVars() {
        this.param.deathRate =
            this.param.caseFatality / this.param.durationInfection
        this.param.recoverRate =
            1 / this.param.durationInfection - this.param.deathRate
        this.param.disDeath = -1 * this.param.caseFatality * this.param.period
        this.param.incubationRate = this.param.incubation
        this.param.contactRate =
            this.param.reproductionNumber * this.param.period

        for (let key of _.keys(this.var)) {
            this.var[key] = 0
        }
        this.var.infectious = this.param.initPrevalence
        this.var.susceptible =
            this.param.initPopulation - this.param.initPrevalence
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
                value: 100,
                max: 300,
                interval: 1,
                placeHolder: '',
                label: 'time',
                decimal: 0,
            },
            {
                key: 'reproductionNumber',
                value: 1.5,
                max: 15,
                interval: 0.1,
                placeHolder: '',
                label: 'R0',
                decimal: 1,
            },
            {
                key: 'durationInfection',
                value: 10,
                interval: 1,
                max: 100,
                placeHolder: '',
                label: 'Infectious Period (days)',
                decimal: 0,
            },
            {
                key: 'caseFatality',
                value: 0.2,
                interval: 0.01,
                max: 1,
                placeHolder: '',
                label: 'Case-Fatality Rate',
                decimal: 2,
            },
            {
                key: 'initPrevalence',
                value: 3000,
                interval: 1,
                max: 100000,
                placeHolder: '',
                label: 'Prevalence',
                decimal: 0,
            },
            {
                key: 'initPopulation',
                value: 50000,
                max: 100000,
                interval: 1,
                placeHolder: '',
                label: 'Initial Population',
                decimal: 0,
            },
        ]

        return guiParams
    }
}

class SEIRSModel extends FlowPopModel {
    constructor() {
        super()

        this.modelType = 'SEIRS'
        this.name = 'Susceptible Exposed Infections Recovered Susceptible'

        this.param = {
            time: 100,
            initPopulation: 50000,
            period: 0.1,
            incubation: 0.01,
            caseFatality: 0.2,
            initPrevalence: 3000,
            reproductionNumber: 50,
            immunityPeriod: 50,
            durationInfection: 10,
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
        this.paramFlows.push(['infectious', 'infectious', 'disDeath'])
        this.paramFlows.push(['infectious', 'recovered', 'recoverRate'])
        this.paramFlows.push(['recovered', 'susceptible', 'immunityLossRate'])
        this.paramFlows.push(['infectious', 'dead', 'deathRate'])
    }

    initializeVars() {
        this.param.deathRate =
            this.param.caseFatality / this.param.durationInfection
        this.param.recoverRate =
            1 / this.param.durationInfection - this.param.deathRate
        this.param.incubationRate = this.param.incubation
        this.param.disDeath = -1 * this.param.caseFatality * this.param.period
        this.param.contactRate =
            this.param.reproductionNumber * this.param.period
        this.param.immunityLossRate = 1 / this.param.immunityPeriod

        for (let key of _.keys(this.var)) {
            this.var[key] = 0
        }
        this.var.infectious = this.param.initPrevalence
        this.var.susceptible =
            this.param.initPopulation - this.param.initPrevalence
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
                value: 100,
                max: 300,
                interval: 1,
                placeHolder: '',
                label: 'Time',
                decimal: 0,
            },
            {
                key: 'reproductionNumber',
                value: 1.5,
                interval: 0.1,
                max: 20,
                placeHolder: '',
                label: 'R0',
                decimal: 1,
            },
            {
                key: 'durationInfection',
                value: 10,
                interval: 1,
                placeHolder: '',
                label: 'Infectious Period (days)',
                decimal: 0,
            },
            {
                key: 'caseFatality',
                value: 0.2,
                interval: 0.01,
                max: 1,
                placeHolder: '',
                label: 'Case-Fatality Rate',
                decimal: 2,
            },
            {
                key: 'immunityPeriod',
                value: 50,
                interval: 1,
                max: 300,
                placeHolder: '',
                label: 'Immunity Period ',
                decimal: 0,
            },
            {
                key: 'initPrevalence',
                value: 3000,
                max: 100000,
                interval: 1,
                placeHolder: '',
                label: 'Prevalence',
                decimal: 0,
            },
            {
                key: 'initPopulation',
                value: 50000,
                max: 100000,
                interval: 1,
                placeHolder: '',
                label: 'Initial Population',
                decimal: 0,
            },
        ]

        return guiParams
    }
}

let epiModels = [SirModel, SisModel, SEIRModel, SEIRModel, SEIRSModel]

export { epiModels }
