<template>
    <v-container fluid class="pa-0">
        <v-layout row wrap>
            <v-flex xs4 md4 lg3>
                <v-card style=" height: calc(100vh - 48px); overflow: auto;">
                    <v-card-text>
                        <p class="small mt-3 mb-1">
                            PARAMETERS
                        </p>
                        <v-container
                                fluid
                            v-for="(param, i) of sliders"
                            :key="i"
                            class="d-inline-flex pa-0"
                            column
                        >
                            <div
                                class="flex-grow-1 pt-2"
                            >
                                {{ param.label }}
                                <v-slider
                                    style="margin-top: -10px"
                                    ref="slider"
                                    :step="param.interval"
                                    :max="param.max"
                                    v-model="param.value"
                                    @change="changeGraph()"
                                />
                            </div>
                            <div class="pl-4 flex-grow-0">
                                <v-text-field
                                    class="pt-0"
                                    style="width: 7em"
                                    type="number"
                                    step="any"
                                    v-model="param.value"
                                    @change="changeGraph()"
                                >
                                </v-text-field>
                            </div>
                        </v-container>
                    </v-card-text>
                </v-card>
            </v-flex>

            <v-flex xs8 md8 lg9>
                <v-card style=" height: calc(100vh - 48px); overflow: auto;">
                    <v-card-title class="display-1 mt-3">
                        {{ title }}
                    </v-card-title>
                    <v-card-text>
                        <v-layout id="econ-charts" row wrap />
                    </v-card-text>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<style>
.chart {
    height: 300px;
    min-width: 400px;
}
</style>

<script>
import ChartWidget from '../modules/chart-widget'
import { EconModel } from '../modules/econ-models'
import $ from 'jquery'
import _ from 'lodash'

export default {
    data() {
        return {
            title: '',
            sliders: [],
        }
    },
    async mounted() {
        this.model = new EconModel()
        this.title = this.model.modelType

        this.sliders = this.model.getGuiParams()

        let $div = $('#econ-charts')
        this.graphWidgets = {}
        this.charts = this.model.getCharts()
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
    methods: {
        changeGraph() {
            this.model.importGuiParams(this.sliders)
            this.model.run()
            for (let chart of this.charts) {
                if (chart.divTag === 'wagefn-chart') {
                    let xVals = _.range(0.6, 1.1, 0.01)
                    this.graphWidgets[chart.divTag].updateDataset(
                        0,
                        xVals,
                        _.map(xVals, this.model.fn.wageChange)
                    )
                } else if (chart.divTag === 'investfn-chart') {
                    let xVals = _.range(-0.4, 0.2, 0.01)
                    this.graphWidgets[chart.divTag].updateDataset(
                        0,
                        xVals,
                        _.map(xVals, this.model.fn.investmentChange)
                    )
                } else {
                    console.log('changeGraph graph', chart)
                    for (let [i, key] of chart.keys.entries()) {
                        this.graphWidgets[chart.divTag].updateDataset(
                            i,
                            this.model.times,
                            this.model.solution[key]
                        )
                    }
                }
            }
        },
    },
}
</script>
