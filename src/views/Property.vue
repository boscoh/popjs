<template>
    <v-container fluid class="pa-0 pt-1">
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
                    <v-card-title class="display-1 mt-5">
                        <p class="mt-5">&nbsp;</p>
                        Property vs Funds
                    </v-card-title>
                    <v-card-text class="text-xs-left">
                        <div id="charts" />
                    </v-card-text>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style>
.narrow-column {
    max-width: 500px;
}
</style>

<script>
import { ChartsContainer } from '../modules/charts-container'
import { PropertyModel } from '../modules/property-model'
import Sliders from '../components/sliders'

export default {
    components: { Sliders },
    data() {
        return {
            sliders: [],
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
    mounted() {
        this.model = new PropertyModel()
        this.sliders = this.model.getGuiParams()
        this.charts = this.model.getCharts()
        this.graphWidgets = {}
        this.chartsContainer = new ChartsContainer('charts')
        for (let chart of this.charts) {
            this.chartsContainer.addChart(chart)
        }
        this.changeGraph()
    },
    methods: {
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
