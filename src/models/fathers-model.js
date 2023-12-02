import _ from 'lodash'
import { PopModel } from './pop-model'

class FathersModel extends PopModel {
    constructor() {
        super()
        this.integrateMethod = 'runWithEuler'
        this.param.time = 150
        this.dt = 0.5
        this.yCutoff = 1e5

        this.param.nAge = 25

        this.param.radicalisation = 0.3
        this.param.aversion = 1
        this.param.disenchantment = 0.5
        this.param.delay = 10

        this.groups = ['naive', 'moderate', 'radical']

        this.link =
            'https://github.com/boscoh/popjs/blob/master/src/models/fathers-model.js'
        this.title = 'Turchin Fathers and Sons Model'
        this.summary = `The Peter Turchin model of generational violence based on an mental
            infection model of violent radicalisation`

        this.initializeRun()
    }

    initializeRun() {
        this.param.nAge = _.parseInt(this.param.nAge)

        this.pops = {}
        for (let group of this.groups) {
            this.pops[group] = []
            for (let age of _.range(this.param.nAge)) {
                this.pops[group].push(`${group}_${age}`)
            }
        }
        for (let group of this.groups) {
            for (let age of _.range(this.param.nAge)) {
                const key = `${group}_${age}`
                if (group === 'naive') {
                    this.var[key] = 0.5 / this.param.nAge
                } else if (group === 'radical') {
                    this.var[key] = 0.1 / this.param.nAge
                } else {
                    this.var[key] = 0.4 / this.param.nAge
                }
            }
        }
    }

    calcAuxVars() {
        for (let group of this.groups) {
            let vals = _.filter(_.map(this.pops[group], (k) => this.var[k]))
            this.auxVar[`${group}_total`] = _.sum(vals)
        }

        let iDelay = Math.round(this.param.delay / this.dt)
        this.auxVar.radical_total_delayed = 0
        for (let key of this.pops.radical) {
            if (!(key in this.solution)) {
                continue
            }
            const n = this.solution[key].length
            if (n > iDelay) {
                const v = this.solution[key][n - 1 - iDelay]
                this.auxVar.radical_total_delayed += v
            }
        }

        this.auxVar.rho =
            this.param.disenchantment * this.auxVar.radical_total_delayed

        this.auxVar.sigma =
            this.auxVar.radical_total *
            (this.param.radicalisation -
                this.param.aversion * this.auxVar.moderate_total)
    }

    calcDVars() {
        this.dVar = {}

        for (let k of this.varKeys) {
            this.dVar[k] = -this.var[k]
        }

        this.dVar['naive_0'] += 1.0 / this.param.nAge

        for (let j = 1; j < this.param.nAge; j += 1) {
            const i = j - 1
            this.dVar[`naive_${j}`] +=
                this.var[`naive_${i}`] * (1 - this.auxVar.sigma)
            this.dVar[`radical_${j}`] +=
                this.var[`radical_${i}`] * (1 - this.auxVar.rho)
            this.dVar[`radical_${j}`] +=
                this.var[`naive_${i}`] * this.auxVar.sigma
            this.dVar[`moderate_${j}`] += this.var[`moderate_${i}`]
            this.dVar[`moderate_${j}`] +=
                this.var[`radical_${i}`] * this.auxVar.rho
        }
    }

    getInitialParams() {
        return this.getDefaultGuiParams()
    }

    getCharts() {
        return [
            {
                markdown: `

                    Peter Turchin's fathers-and-sons model reproduces
                    the observed generational
                    changes in violence that occur every 50 or so years, in societies as
                    diverse as the USA, the Roman empire, and various Chinese dynasties.

                    It is based on modelling radicalization
                    like a virus and leans on standard epidemiological modelling. The
                    model consists of three categories of people:

                    1. Naives are not violent and not been exposed to radicalization
                    2. Radicals are angry and prone to protest and violence
                    3. Moderates are former radicals who have renounced extremism

                    The model carries a number of age groups for each category of people.

                    $$ naive_0, naive_1, ..., naive_{nAge} $$
                    $$ radical_0, radical_1, ..., radical_{nAge} $$
                    $$ moderate_0, moderate_1, ..., moderate_{nAge} $$

                    Naive people are radicalized by the radicalization rate R,
                    which is proportional to the number of radicals
                    in society at the time, but is also reduced if there
                    are sufficient number of moderates, who are adverse to
                    radicalisation:

                    $$
                    R = (
                        radicalisation
                        - aversion \\times \\sum_{age} moderate_{age}
                        )
                        \\times  \\sum_{age} radical_{age}
                    $$

                    Radicals are disenchanted after a delay of a certain number of years
                    of being extremists, and this rate D defines the movement of radicals
                    to moderate:

                    $$ D = disenchantment \\times \\sum_{age} radical_{age}(t_{delay}) $$

                    Thus the changes for each age in each category is a progression of each
                    age group to the next age group over a unit of time (1 year), with
                    a conservative dispersal to different categories depending on R and D.

                    $$
                    \\frac{d}{dt}(naive_{age}) =
                        - naive_{age} + naive_{age - 1} \\times ( 1 - R)
                    $$

                    $$
                    \\frac{d}{dt}(radical_{age}) =
                        - radical_{age}
                        + radical_{age - 1} \\times ( 1 - D)
                        + naive_{age - 1} \\times R
                    $$

                    $$
                    \\frac{d}{dt}(moderate_{age}) =
                        - moderate_{age}
                        + moderate_{age - 1}
                        + radical_{age - 1} \\times D
                    $$
                `,
                title: 'All',
                keys: ['naive_total', 'radical_total', 'moderate_total'],
            },
            {
                title: 'Naive Age Groups',
                keys: this.pops.naive,
            },
            { title: 'Radical Age Groups', keys: this.pops.radical },
            { title: 'Moderate Age Groups', keys: this.pops.moderate },
        ]
    }
}

export { FathersModel }
