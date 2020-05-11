<template>
    <v-container fluid class="pa-0 pt-1">
        <v-layout row>
            <v-flex xs4 md4 lg3>
                <v-card
                    class="text-sm-left text-md-left"
                    style="height: calc(100vh - 48px); overflow: auto;"
                >
                    <v-card-text>
                        <sliders
                            :sliders="sliders"
                            :callback="changeGraph"
                        ></sliders>
                    </v-card-text>
                </v-card>
            </v-flex>

            <v-flex xs8 md8 lg9>
                <v-card style=" height: calc(100vh - 48px); overflow: auto;">
                    <v-card-title class="display-1 mt-3">
                        {{ title }}
                    </v-card-title>
                    <v-card-text class="text-md-left text-lg-left text-sm-left">
                        These models represent the simplest types of models used
                        in epidemiological modelling.
                        <div class="pa-3"></div>
                        <v-select
                            :items="modelNames"
                            v-model="modelName"
                            style="width: 500px"
                            label="Model Type"
                            @change="changeModel"
                        />
                        <div id="epi-charts" />
                    </v-card-text>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<style>
.chart {
    height: 300px;
    max-width: 600px;
}
</style>

<script>
import { ChartsContainer } from '../modules/charts-container'
import { epiModels } from '../modules/epi-models'
import _ from 'lodash'
import Sliders from '../components/sliders'

export default {
    components: { Sliders },
    data() {
        return {
            title: 'Graphing Models',
            sliders: [],
            modelName: '',
            modelNames: [],
        }
    },
    watch: {
        sliders: {
            handler() {
                this.changeGraph()
            },
            deep: true,
        },
    },
    async mounted() {
        this.models = []
        for (let EpiModel of epiModels) {
            this.models.push(new EpiModel())
        }
        this.modelNames = _.map(this.models, e => e.name)
        this.modelName = this.modelNames[0]
        this.changeModel()
    },
    methods: {
        changeModel() {
            this.model = _.find(this.models, e => e.name === this.modelName)
            this.title = 'Epi Models - the ' + this.model.modelType + ' model'
            this.charts = this.model.getCharts()
            this.sliders = this.model.getGuiParams()
            this.chartsContainer = new ChartsContainer('epi-charts')
            for (let chart of this.charts) {
                this.chartsContainer.addChart(chart)
            }
            this.changeGraph()
        },
        changeGraph() {
            this.model.importGuiParams(this.sliders)
            this.model.run()
            let x = this.model.times
            for (let chart of this.charts) {
                for (let key of chart.keys) {
                    let y = this.model.solution[key]
                    this.chartsContainer.updateChart(chart.id, key, x, y)
                }
            }
        },
    },
}
</script>
