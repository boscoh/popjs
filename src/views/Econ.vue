<template>
    <v-container fluid class="pa-0">
        <v-layout row wrap>
            <v-flex xs4 md4 lg3>
                <v-card style=" height: calc(100vh - 48px); overflow: auto;">
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
import { ChartsContainer } from '../modules/charts-container'
import { EconModel } from '../modules/econ-models'
import _ from 'lodash'
import Sliders from '../components/sliders'

export default {
    components: { Sliders },
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
        this.charts = this.model.getCharts()
        this.chartsContainer = new ChartsContainer('econ-charts')
        for (let chart of this.charts) {
            this.chartsContainer.addChart(
                chart.id,
                chart.title,
                chart.xlabel,
                '',
                chart.keys
            )
        }
    },
    methods: {
        changeGraph() {
            this.model.importGuiParams(this.sliders)
            this.model.run()
            for (let chart of this.charts) {
                if (chart.id === 'wagefn-chart') {
                    let x = _.range(0.6, 1.1, 0.01)
                    let y = _.map(x, this.model.fn.wageChange)
                    this.chartsContainer.updateChart(
                        chart.id,
                        'wageChange',
                        x,
                        y
                    )
                } else if (chart.id === 'investfn-chart') {
                    let x = _.range(-0.4, 0.2, 0.01)
                    let y = _.map(x, this.model.fn.investmentChange)
                    this.chartsContainer.updateChart(
                        chart.id,
                        'investmentChange',
                        x,
                        y
                    )
                } else {
                    let x = this.model.times
                    for (let key of chart.keys) {
                        let y = this.model.solution[key]
                        this.chartsContainer.updateChart(
                            chart.id,
                            key,
                            x,
                            y
                        )
                    }
                }
            }
        },
    },
}
</script>
