import { PopModel } from './pop-model'

function make_approach_fn(y_init, y_final, x_at_midpoint) {
    const diff_g = y_final - y_init
    return function(x) {
        if (x < 0) {
            return y_init
        }
        return y_init + diff_g * (x / (x_at_midpoint + x))
    }
}

class EliteModel extends PopModel {
    constructor() {
        super()
        this.param.time = 400
        this.param.maxProductionRate = 2
        this.param.producerBirth = 0.02
        this.param.producerDeath = 0.02
        this.param.eliteBirth = 0.05
        this.param.maxEliteDeath = 0.12
        this.param.eliteAtHalfExtraction = 0.3
        this.param.stateAtHalfPeace = 0.3
        this.param.stateAtHalfCarry = 0.07
        this.param.initProdDecline = 0.5
        this.param.finalStateProdDecline = 0.2
        this.param.stateTaxRate = 1
        this.param.stateEmploymentRate = 0.01
        this.param.initProducer = 0.5
        this.param.initElite = 0.02
        this.param.initState = 0.0

        this.link =
            'https://github.com/boscoh/popjs/blob/master/src/models/elite-models.js'
        this.title = 'Turchin Demographic Fiscal Model'
        this.dt = 1
    }

    initializeRun() {
        this.var.producer = this.param.initProducer
        this.var.elite = this.param.initElite
        this.var.state = this.param.initState

        this.fn.prodDeclineFn = make_approach_fn(
            this.param.initProdDecline,
            this.param.finalStateProdDecline,
            this.param.stateAtHalfCarry
        )
    }

    calcAuxVars() {
        this.auxVar.prodDecline = this.fn.prodDeclineFn(this.var.state)

        this.auxVar.totalProduct =
            this.var.producer *
            this.param.maxProductionRate *
            (1 - this.auxVar.prodDecline * this.var.producer)

        this.auxVar.eliteFraction =
            this.var.elite / (this.param.eliteAtHalfExtraction + this.var.elite)
        this.auxVar.eliteShare =
            this.auxVar.totalProduct * this.auxVar.eliteFraction
        this.auxVar.producerShare =
            this.auxVar.totalProduct - this.auxVar.eliteShare

        this.auxVar.carry =
            (this.param.maxProductionRate * this.param.producerBirth -
                this.param.producerDeath) /
            this.auxVar.prodDecline /
            this.param.maxProductionRate /
            this.param.producerBirth

        this.auxVar.stateModifiedFraction =
            1 - this.var.state / (this.param.stateAtHalfPeace + this.var.state)
        this.auxVar.eliteDeathRate =
            this.param.maxEliteDeath * this.auxVar.stateModifiedFraction
        this.auxVar.eliteDeath = this.var.elite * this.auxVar.eliteDeathRate

        this.auxVar.productPerElite = this.auxVar.eliteShare / this.var.elite
        this.auxVar.productPerProducer =
            this.auxVar.producerShare / this.var.producer
    }

    calcDVars() {
        this.dVar.producer =
            this.param.producerBirth * this.auxVar.producerShare -
            this.param.producerDeath * this.var.producer

        this.dVar.elite =
            this.param.eliteBirth * this.auxVar.eliteShare -
            this.auxVar.eliteDeath

        this.dVar.state = 0
        if (this.dVar.elite > 0) {
            this.dVar.state += this.param.stateTaxRate * this.dVar.elite
        }
        this.dVar.state -= this.param.stateEmploymentRate * this.var.elite
        if (this.dVar.state + this.var.state < 0) {
            this.dVar.state = -this.var.state
        }
    }

    getGuiParams() {
        let guiParams = []
        for (let key in this.param) {
            if (key === 'dt') {
                continue
            }
            let val = this.param[key]
            if (val > 0) {
                val = 5 * val
            } else if (val === 0) {
                val = 1
            }
            guiParams.push({ key, max: val })
        }
        for (let param of guiParams) {
            this.fillGuiParam(param)
        }
        return guiParams
    }

    getCharts() {
        return [
            {
                markdown: `

                The Elite Demographic State model from Peter Turchin provides
                a concrete model for the rise and fall of states. The state
                has three major components:

                1. Producers make the food, and increase if there is enough food
                2. Elites extract food from the producers but are prone to infighting
                3. The State improves the productivity of producers and pacifies elite infighting
        
                The producer population will rise and fall depending on the
                surplus produced, which depends on how many elites are
                extracting wealth, and on the productivity improvements due to the state:

            `,
                title: 'people',
                keys: ['producer', 'elite', 'state'],
                ymax_cutoff: 100,
            },
            {
                markdown: `

                ### Share of Production
    
                The amount of resources produced is:
    
                $$ totalProduct = producer \\times productionRate $$
    
                where the production rate can be improved by the
                state through the production decline function (discussed below)
                $$ productionRate = 
                             maxProductionRate
                             \\times 
                                \\left[
                                  1 - prodDeclineFn(state)
                                   \\times producer
                                \\right]
                $$
    
                Here, we use a greedy elite model where all the product will
                be extracted if the elite numbers grows large enough, leading to
                the elite fraction for the total product:
    
                $$ eliteFraction = 
                          \\frac
                            { elite }
                            {1 - eliteAtHalfExtraction \\times elite}
                $$
    
                $$ eliteShare = totalProduct \\times eliteFraction $$
    
                This leaves the producers:
    
                $$ producerShare = totalProduct - eliteShare $$
    
                `,
                title: 'Production Rate',
                keys: ['producerShare', 'eliteShare', 'totalProduct'],
                ymin: 0,
            },
            {
                markdown: `

                When expressed per capita, we can see the relative
                wealth of producers versus elites over time.
    
                `,
                title: 'Earnings Per Capita',
                id: 'earning-chart',
                keys: ['productPerProducer', 'productPerElite'],
                ymin: 0,
            },
            {
                markdown: `

                ### State improves production
    
                As the State gets stronger, it will be able to improve
                production. This is expressed through the Production
                Decline Function which defines how the state softens the
                production decline. The production decline measures
                the decline in the production rate due to over-crowding
                as the producer population nears the carrying capacity.
    
                `,
                fn: 'prodDeclineFn',
                id: 'prod-decline-chart',
                xlims: [0, 1],
                ymin: 0,
                var: 'state',
            },
            {
                markdown: `

                Thus we can see how as state revenue increases, the
                effective carrying capacity increases.
    
                `,
                title: 'State Action on Producer Capacity',
                id: 'state-prod-chart',
                keys: ['producer', 'carry', 'state'],
                ymin: 0,
            },
            {
                markdown: `

                ### Pacification of Elite infighting
    
                In the model, the intrinsic maxEliteDeath is quite high as
                elites will fight amongst themselves for
                resources. However, as the state increases strength,
                the state can impose peace on the elites, and this is reflected
                in:

                $$ stateModifiedFraction = 1 
                        - 
                        \\frac
                            {state}
                            {stateAtHalfPeace + state}
                $$

                resulting in a lower elite death rate:
    
                $$ eliteDeathRate = maxEliteDeath
                            \\times stateModifiedFraction
                $$
    
                The deaths of elites obviously depends also
                on the number of elites that have managed
                to grow due to extraction of resources from
                the producers:
    
                $$ eliteDeath = elite 
                            \\times eliteDeathRate
                $$
    
                `,
                title: 'State Action on Elites',
                id: 'state-elite-chart',
                keys: ['eliteDeathRate', 'eliteDeath', 'state'],
                ymin: 0,
            },
        ]
    }
}

export { EliteModel }
