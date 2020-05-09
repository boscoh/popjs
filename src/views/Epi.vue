<template>
    <v-container fluid class="pa-0 pt-1">
        <v-layout row>
            <v-flex xs4 md4 lg3>
                <v-card
                    class="text-sm-left text-md-left"
                    style=" height : calc(100vh - 48px); overflow: auto; "
                >
                    <v-card-text>
                        <p class="small mt-3 mb-1">
                            PARAMETERS
                        </p>
                        <div
                            v-for="(param, i) of sliders"
                            :key="i"
                            style="display: flex; margin-bottom: -20px"
                            column
                        >
                            <div
                                style="flex: 1; text-align: left; padding-top:0.6em"
                            >
                                {{ param.label }}
                                <v-slider
                                    style="margin-top: -10px"
                                    :step="param.interval"
                                    :max="param.max"
                                    v-model="param.value"
                                    @change="changeGraph()"
                                />
                            </div>
                            <div style="flex: 0 0 7em; padding-left: 1em">
                                <v-text-field
                                    class="pt-0"
                                    type="number"
                                    step="any"
                                    v-model="param.value"
                                    @keypress="changeGraph()"
                                >
                                </v-text-field>
                            </div>
                        </div>
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
import ChartWidget from '../modules/chart-widget'
import { epiModels } from '../modules/epi-models'
import $ from 'jquery'
import _ from 'lodash'

export default {
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
        this.modelName = this.models[0].name
        this.changeModel()
    },
    methods: {
        changeModel() {
            this.model = _.find(this.models, e => e.name === this.modelName)
            this.title = 'Epi Models - the ' + this.model.modelType + ' model'
            this.charts = this.model.getCharts()
            this.sliders = this.model.getGuiParams()

            this.graphWidgets = {}
            let $div = $('#epi-charts').empty()
            for (let chart of this.charts) {
                let id = chart.divTag
                $div.append(
                    $('<div>')
                        .attr('id', id)
                        .addClass('chart')
                )
                let chartWidget = new ChartWidget(`#${id}`)
                chartWidget.setTitle(chart.title)
                chartWidget.setXLabel(chart.xlabel)
                chartWidget.setYLabel('')
                for (let key of chart.keys) {
                    chartWidget.addDataset(key)
                }
                this.graphWidgets[chart.divTag] = chartWidget
            }

            this.changeGraph()
        },
        changeGraph() {
            this.model.importGuiParams(this.sliders)
            this.model.run()
            for (let chart of this.charts) {
                for (let [i, key] of chart.keys.entries()) {
                    console.log('changeGraph', key, this.model)
                    this.graphWidgets[chart.divTag].updateDataset(
                        i,
                        this.model.times,
                        this.model.solution[key]
                    )
                }
            }
        },
    },
}
</script>
