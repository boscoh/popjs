import _ from 'lodash'
import PopJs from './pop-js'

class SisModel extends PopJs {
  constructor(id) {
    super(id)

    this.modelType = 'SIS'

    this.compartment = {
      susceptible: 0,
      infectious: 0
    }

    this.defaultParams = {
      initPopulation: 50000,
      initPrevalence: 3000,
      recoverRate: 0.1,
      reproductionNumber: 1.5
    }

    this.param = _.cloneDeep(this.defaultParams)

    this.varEvents.push(['susceptible', 'infectious', 'rateForce'])
    this.paramEvents.push(['infectious', 'susceptible', 'recoverRate'])

    this.guiParams = [
      {
        key: 'time',
        value: 100,
        max: 300,
        interval: 1,
        placeHolder: '',
        label: 'Time',
        decimal: 0
      },
      {
        key: 'reproductionNumber',
        value: 1.5,
        max: 20,
        interval: 0.1,
        placeHolder: '',
        label: 'R0',
        decimal: 1
      },
      {
        key: 'durationInfection',
        value: 10,
        interval: 1,
        max: 100,
        placeHolder: '',
        label: 'Infectious Period (days)',
        decimal: 0
      },
      {
        key: 'initPrevalence',
        value: 3000,
        max: 100000,
        interval: 1,
        placeHolder: '',
        label: 'Prevalence',
        decimal: 0
      },
      {
        key: 'initPopulation',
        value: 50000,
        max: 100000,
        interval: 1,
        placeHolder: '',
        label: 'Initial Population',
        decimal: 0
      }
    ]

    this.interventionParams = [
      {
        key: 'interventionDay',
        value: 5,
        max: 100,
        interval: 1,
        placeHolder: '',
        label: 'Start Day',
        decimal: 2
      },
      {
        key: 'reproductionNumber',
        value: 1.2,
        interval: 0.01,
        max: 1,
        placeHolder: '',
        label: 'R0',
        decimal: 2
      }
    ]
  }

  calcExtraParams() {
    this.param.recoverRate = 1 / this.param.durationInfection
    this.param.contactRate =
      this.param.reproductionNumber * this.param.recoverRate
  }

  calcVars() {
    this.var.population = _.sum(_.values(this.compartment))
    this.var.rateForce =
      (this.param.contactRate / this.var.population) *
      this.compartment.infectious
    this.var.rn =
      (this.compartment.susceptible / this.var.population) *
      this.param.reproductionNumber
  }
}

class SirModel extends PopJs {
  constructor(id) {
    super(id)

    this.modelType = 'SIR'

    this.compartment = {
      susceptible: 0,
      infectious: 0,
      recovered: 0
    }

    this.defaultParams = {
      initPopulation: 50000,
      initPrevalence: 3000,
      recoverRate: 0.1,
      reproductionNumber: 1.5
    }

    this.varEvents.push(['susceptible', 'infectious', 'rateForce'])
    this.paramEvents.push(['infectious', 'recovered', 'recoverRate'])

    this.param = _.cloneDeep(this.defaultParams)

    this.guiParams = [
      {
        key: 'time',
        value: 100,
        max: 300,
        interval: 1,
        placeHolder: '',
        label: 'Time',
        decimal: 0
      },
      {
        key: 'reproductionNumber',
        value: 1.5,
        interval: 0.1,
        max: 20,
        placeHolder: '',
        label: 'R0',
        decimal: 1
      },
      {
        key: 'durationInfection',
        value: 10,
        interval: 1,
        max: 100,
        placeHolder: '',
        label: 'Infectious Period (days)',
        decimal: 0
      },
      {
        key: 'initPrevalence',
        value: 3000,
        max: 100000,
        placeHolder: '',
        interval: 1,
        label: 'Prevalence',
        decimal: 0
      },
      {
        key: 'initPopulation',
        value: 50000,
        max: 100000,
        interval: 1,
        placeHolder: '',
        label: 'Initial Population',
        decimal: 0
      }
    ]

    this.interventionParams = [
      {
        key: 'interventionDay',
        value: 5,
        max: 100,
        interval: 1,
        placeHolder: '',
        label: 'Start Day'
      },
      {
        key: 'reproductionNumber',
        value: 1.2,
        interval: 0.01,
        max: 10,
        placeHolder: '',
        label: 'R0'
      }
    ]
  }

  calcExtraParams() {
    this.param.recoverRate = 1 / this.param.durationInfection
    this.param.contactRate =
      this.param.reproductionNumber * this.param.recoverRate
  }

  initCompartmentsByParams() {
    this.compartment.infectious = this.param.initPrevalence
    this.compartment.susceptible =
      this.param.initPopulation - this.param.initPrevalence
    this.compartment.recovered = 0
  }

  calcVars() {
    this.var.population = _.sum(_.values(this.compartment))
    this.var.rateForce =
      (this.param.contactRate / this.var.population) *
      this.compartment.infectious
    this.var.rn =
      (this.compartment.susceptible / this.var.population) *
      this.param.reproductionNumber
  }
}

class SEIRModel extends PopJs {
  constructor(id) {
    super(id)
    this.id = id

    this.modelType = 'SEIR'

    this.compartment = {
      susceptible: 0,
      exposed: 0,
      infectious: 0,
      recovered: 0,
      dead: 0
    }

    this.defaultParams = {
      initPopulation: 50000,
      period: 0.1,
      incubation: 0.01,
      caseFatality: 0.2,
      initPrevalence: 5000,
      reproductionNumber: 4
    }
    this.param = _.cloneDeep(this.defaultParams)

    this.varEvents.push(['susceptible', 'exposed', 'rateForce'])
    this.paramEvents.push(['exposed', 'infectious', 'incubationRate'])
    this.paramEvents.push(['infectious', 'infectious', 'disDeath'])
    this.paramEvents.push(['infectious', 'recovered', 'recoverRate'])
    this.paramEvents.push(['infectious', 'dead', 'deathRate'])

    this.guiParams = [
      {
        key: 'time',
        value: 100,
        max: 300,
        interval: 1,
        placeHolder: '',
        label: 'time',
        decimal: 0
      },
      {
        key: 'reproductionNumber',
        value: 1.5,
        max: 15,
        interval: 0.1,
        placeHolder: '',
        label: 'R0',
        decimal: 1
      },
      {
        key: 'durationInfection',
        value: 10,
        interval: 1,
        max: 100,
        placeHolder: '',
        label: 'Infectious Period (days)',
        decimal: 0
      },
      {
        key: 'caseFatality',
        value: 0.2,
        interval: 0.01,
        max: 1,
        placeHolder: '',
        label: 'Case-Fatality Rate',
        decimal: 2
      },
      {
        key: 'initPrevalence',
        value: 3000,
        interval: 1,
        max: 100000,
        placeHolder: '',
        label: 'Prevalence',
        decimal: 0
      },
      {
        key: 'initPopulation',
        value: 50000,
        max: 100000,
        interval: 1,
        placeHolder: '',
        label: 'Initial Population',
        decimal: 0
      }
    ]

    this.interventionParams = [
      {
        key: 'interventionDay',
        value: 5,
        interval: 1,
        placeHolder: '',
        label: 'Start Day'
      },
      {
        key: 'reproductionNumber',
        value: 1.2,
        interval: 0.01,
        placeHolder: '',
        label: 'R0'
      }
    ]
  }

  calcExtraParams() {
    this.param.deathRate =
      this.param.caseFatality / this.param.durationInfection
    this.param.recoverRate =
      1 / this.param.durationInfection - this.param.deathRate
    this.param.disDeath = -1 * this.param.caseFatality * this.param.period
    this.param.incubationRate = this.param.incubation
    this.param.contactRate = this.param.reproductionNumber * this.param.period
  }

  calcVars() {
    this.var.population = _.sum(_.values(this.compartment))
    this.var.rateForce =
      (this.param.contactRate / this.var.population) *
      this.compartment.infectious
    this.var.rn =
      (this.compartment.susceptible / this.var.population) *
      this.param.reproductionNumber
  }
}

class SEIRSModel extends PopJs {
  constructor(id) {
    super(id)
    this.id = id

    this.modelType = 'SEIRS'

    this.compartment = {
      susceptible: 0,
      exposed: 0,
      infectious: 0,
      recovered: 0,
      dead: 0
    }

    this.defaultParams = {
      initPopulation: 50000,
      period: 0.1,
      incubation: 0.01,
      caseFatality: 0.2,
      initPrevalence: 3000,
      reproductionNumber: 50,
      immunityPeriod: 50
    }
    this.param = _.cloneDeep(this.defaultParams)

    this.varEvents.push(['susceptible', 'exposed', 'rateForce'])
    this.paramEvents.push(['exposed', 'infectious', 'incubationRate'])
    this.paramEvents.push(['infectious', 'infectious', 'disDeath'])
    this.paramEvents.push(['infectious', 'recovered', 'recoverRate'])
    this.paramEvents.push(['recovered', 'susceptible', 'immunityLossRate'])
    this.paramEvents.push(['infectious', 'dead', 'deathRate'])

    this.guiParams = [
      {
        key: 'time',
        value: 100,
        max: 300,
        interval: 1,
        placeHolder: '',
        label: 'Time',
        decimal: 0
      },
      {
        key: 'reproductionNumber',
        value: 1.5,
        interval: 0.1,
        max: 20,
        placeHolder: '',
        label: 'R0',
        decimal: 1
      },
      {
        key: 'durationInfection',
        value: 10,
        interval: 1,
        placeHolder: '',
        label: 'Infectious Period (days)',
        decimal: 0
      },
      {
        key: 'caseFatality',
        value: 0.2,
        interval: 0.01,
        max: 1,
        placeHolder: '',
        label: 'Case-Fatality Rate',
        decimal: 2
      },
      {
        key: 'immunityPeriod',
        value: 50,
        interval: 1,
        max: 300,
        placeHolder: '',
        label: 'Immunity Period ',
        decimal: 0
      },
      {
        key: 'initPrevalence',
        value: 3000,
        max: 100000,
        interval: 1,
        placeHolder: '',
        label: 'Prevalence',
        decimal: 0
      },
      {
        key: 'initPopulation',
        value: 50000,
        max: 100000,
        interval: 1,
        placeHolder: '',
        label: 'Initial Population',
        decimal: 0
      }
    ]

    this.interventionParams = [
      {
        key: 'interventionDay',
        value: 5,
        interval: 1,
        placeHolder: '',
        label: 'Start Day'
      },
      {
        key: 'reproductionNumber',
        value: 1.2,
        interval: 0.01,
        placeHolder: '',
        label: 'R0'
      }
    ]
  }

  calcExtraParams() {
    this.param.deathRate =
      this.param.caseFatality / this.param.durationInfection
    this.param.recoverRate =
      1 / this.param.durationInfection - this.param.deathRate
    this.param.incubationRate = this.param.incubation
    this.param.disDeath = -1 * this.param.caseFatality * this.param.period
    this.param.contactRate = this.param.reproductionNumber * this.param.period
    this.param.immunityLossRate = 1 / this.param.immunityPeriod
  }

  calcVars() {
    this.var.population = _.sum(_.values(this.compartment))
    this.var.rateForce =
      (this.param.contactRate / this.var.population) *
      this.compartment.infectious
    this.var.rn =
      (this.compartment.susceptible / this.var.population) *
      this.param.reproductionNumber
  }
}

class EbolaModel extends PopJs {
  constructor(id) {
    super(id)
    this.id = id

    this.modelType = 'Ebola'

    this.compartment = {
      susceptible: 0,
      exposed: 0,
      infectedEarly: 0,
      infectious: 0,
      hospitalised: 0,
      recovered: 0,
      dead: 0,
      buried: 0
    }

    this.defaultParams = {
      initPopulation: 50000,
      initPrevalence: 5000,
      foiZero: 0.1,
      foi: 0.2,
      foiTwo: 0.02,
      reproduction: 10,
      foiThree: 0.2,
      latency: 0.1,
      preDetection: 0.25,
      postDetection: 0.16,
      ascerProb: 0.05,
      hospitalCapacity: 10000,
      caseFatalityHosp: 0.35,
      caseFatality: 0.7,
      preBurialPeriod: 3
    }
    this.param = _.cloneDeep(this.defaultParams)

    this.varEvents.push(['susceptible', 'exposed', 'rateForce'])
    this.paramEvents.push(['exposed', 'infectedEarly', 'incubationRate'])
    this.varEvents.push(['infectedEarly', 'infectious', 'rateForce1'])
    this.varEvents.push(['infectedEarly', 'hospitalised', 'rateForce2'])
    this.paramEvents.push(['infectious', 'recovered', 'recoverRate1'])
    this.paramEvents.push(['hospitalised', 'recovered', 'recoverRate2'])
    this.paramEvents.push(['infectious', 'dead', 'deathRate1'])
    this.paramEvents.push(['hospitalised', 'dead', 'deathRate2'])
    this.paramEvents.push(['dead', 'buried', 'burialRate'])

    this.guiParams = [
      {
        key: 'time',
        value: 100,
        max: 300,
        interval: 1,
        placeHolder: '',
        label: 'Time',
        decimal: 0
      },
      {
        key: 'reproduction',
        value: 1.6,
        interval: 0.1,
        placeHolder: '',
        max: 20,
        label: 'R0',
        decimal: 1
      },
      {
        key: 'ascerProb',
        value: 0.2,
        interval: 0.01,
        max: 1,
        placeHolder: '',
        label: 'Fraction of People potentially infectious during incubation',
        decimal: 2
      },
      {
        key: 'hospitalCapacity',
        value: 10000,
        max: 50000,
        interval: 1,
        placeHolder: '',
        label: 'Hospital Capacity (number of isolation beds)',
        decimal: 0
      },
      {
        key: 'caseFatalityHosp',
        value: 0.35,
        interval: 0.01,
        max: 1,
        placeHolder: '',
        label: 'Case Fatality in Hospital',
        decimal: 2
      },
      {
        key: 'preBurialPeriod',
        value: 3,
        interval: 1,
        max: 20,
        placeHolder: '',
        label: 'Burial Period (days)',
        decimal: 0
      },
      {
        key: 'initPrevalence',
        value: 5000,
        max: 100000,
        interval: 1,
        placeHolder: '',
        label: 'Prevalence',
        decimal: 0
      },
      {
        key: 'initPopulation',
        value: 50000,
        max: 100000,
        interval: 1,
        placeHolder: '',
        label: 'Initial Population',
        decimal: 0
      }
    ]

    this.interventionParams = [
      {
        key: 'interventionDay',
        value: 5,
        interval: 1,
        placeHolder: '',
        label: 'Start Day',
        decimal: 2
      },
      {
        key: 'reproductionNumber',
        value: 1.2,
        interval: 0.01,
        placeHolder: '',
        label: 'R0',
        decimal: 2
      },
      {
        key: 'hospitalCapacity',
        value: 10000,
        interval: 1,
        placeHolder: '',
        label: 'Hospital Capacity (number of isolation beds)',
        decimal: 2
      }
    ]
  }

  calcExtraParams() {
    this.param.incubationRate = this.param.latency
    this.param.recoverRate1 =
      (1 - this.param.caseFatality) * this.param.postDetection
    this.param.recoverRate2 =
      (1 - this.param.caseFatalityHosp) * this.param.postDetection
    this.param.deathRate1 = this.param.caseFatality * this.param.postDetection
    this.param.deathRate2 =
      this.param.caseFatalityHosp * this.param.postDetection
    this.param.burialRate = 1 / this.param.preBurialPeriod
    this.param.foi =
      this.param.preDetection *
      (this.param.reproduction -
        (this.param.foiZero * (1 - this.param.ascerProb) +
          this.param.foiTwo * this.param.ascerProb) /
          this.param.postDetection -
        this.param.foiThree *
          (this.param.caseFatalityHosp * (1 - this.param.ascerProb) +
            this.param.caseFatality * this.param.ascerProb) *
          this.param.preBurialPeriod)
  }

  calcVars() {
    this.var.population = _.sum(_.values(this.compartment))
    this.var.rateForce =
      (this.param.foi * this.compartment.infectious +
        this.param.foiZero * this.compartment.infectedEarly +
        this.param.foiTwo * this.compartment.hospitalised +
        this.param.foiThree * this.compartment.dead) /
      this.var.population
    this.var.rateForce1 =
      (1 -
        this.param.ascerProb *
          (1 - this.compartment.hospitalised / this.param.hospitalCapacity)) *
      this.param.preDetection
    this.var.rateForce2 =
      this.param.ascerProb *
      (1 - this.compartment.hospitalised / this.param.hospitalCapacity) *
      this.param.preDetection
  }
}

let epiModels = [
  {
    Class: SirModel,
    name: 'Susceptible Infectious Recovered'
  },
  {
    Class: SisModel,
    name: 'Susceptible Infectious Susceptible'
  },
  {
    Class: SEIRModel,
    name: 'Susceptible Exposed Infections Recovered'
  },
  {
    Class: SEIRSModel,
    name: 'Susceptible Exposed Infections Recovered Susceptible'
  },
  {
    Class: EbolaModel,
    name: 'Ebola'
  }
]

export { epiModels }
