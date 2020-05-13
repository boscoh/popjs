import _ from 'lodash'
import { DynaPopModel } from './dyna-pop-model'

class EcologyModel extends DynaPopModel {
    constructor() {
        const params = {
            time: 200,
            initialPrey: 10,
            initialPredator: 5,
            preyGrowthRate: 0.2,
            predationRate: 0.1,
            digestionRate: 0.1,
            predatorDeathRate: 0.2,
        }
        super(params)
        this.modelType = 'Lokta Volterra Predator-Prey Model'
        this.dt = 0.1
    }

    initializeVars() {
        this.var.predator = this.param.initialPrey
        this.var.prey = this.param.initialPredator
        console.log(this.var)
    }

    calcDVars() {
        this.dVar.prey =
            this.var.prey * this.param.preyGrowthRate -
            this.param.predationRate * this.var.prey * this.var.predator
        this.dVar.predator =
            this.param.digestionRate * this.var.prey * this.var.predator -
            this.var.predator * this.param.predatorDeathRate
    }

    getGuiParams() {
        let guiParams = [
            { key: 'time', max: 300 },
            {
                key: 'initialPrey',
                max: 20,
            },
            {
                key: 'initialPredator',
                max: 20,
            },
            {
                key: 'preyGrowthRate',
                max: 2,
            },
            {
                key: 'predationRate',
                max: 2,
            },
            {
                key: 'predatorDeathRate',
                max: 2,
            },
            {
                key: 'digestionRate',
                max: 2,
            },
        ]

        for (let param of guiParams) {
            if (!_.has(param, 'label')) {
                param.label = _.startCase(param.key)
            }
            if (_.has(param, 'max') && !_.has(param, 'interval')) {
                let exp = _.floor(Math.log10(param.max))
                param.interval = Math.pow(10, exp - 2)
            }
            param.value = this.param[param.key]
        }

        return guiParams
    }

    getCharts() {
        return [
            {
                title: 'Ecology',
                id: 'predator-prey-chart',
                keys: ['predator', 'prey'],
                xlabel: 'year',
                markdown:
`
$$\\frac{d}{dt}prey = preyGrowthRate \\times prey  - predationRate \\times prey \\times predator$$ 

$$\\frac{d}{dt}predator = digestionRate \\times prey \\times predator - predatorDeathRate \\times predator$$
`
            },
        ]
    }
}

export { EcologyModel }
