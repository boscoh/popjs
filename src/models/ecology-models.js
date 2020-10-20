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
        this.title = 'Lokta Volterra Predator-Prey Model'
        this.dt = 0.1
    }

    initializeRun() {
        this.var.predator = this.param.initialPrey
        this.var.prey = this.param.initialPredator
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
            this.fillGuiParam(param)
        }
        return guiParams
    }

    getCharts() {
        return [
            {
                markdown: `
The first complex population model (1925), uses these sets of coupled equation to
reproduce the periodic rise and fall of populations in the wild. These
equations are also used in studying auto-catalytic chemical reactions.

The Lokta-Volterra equations follow two populations, a prey population with an endogenous
growth function where the prey presumably takes in nutrients from an abundant
environment, but will also die from the predator attack it, as represented
by the predation rate.
 
$$\\frac{d}{dt}(prey) = preyGrowthRate \\times prey  - predationRate \\times prey \\times predator$$ 

In contrast, the predator relies totally on the prey as its food source, which
 is represented by the digestion rate, which determines how many prey a predator
 has to eat before it can produce a new predator. Finally, we need to include
 an explicit death rate for the predator:

$$\\frac{d}{dt}(predator) = digestionRate \\times prey \\times predator - predatorDeathRate \\times predator$$
                `,
                title: 'Ecology',
                id: 'predator-prey-chart',
                keys: ['predator', 'prey'],
                xlabel: 'year',
            },
        ]
    }
}

export { EcologyModel }
