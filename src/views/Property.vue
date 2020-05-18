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
                <v-card
                    class="pb-5"
                    style=" height: calc(100vh - 48px); overflow: auto;"
                >
                    <v-card-title class="display-1 mt-5">
                        <br />
                        {{ title }}
                    </v-card-title>
                    <v-card-text>
                        <div id="property-charts" />
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
h1 {
    margin-bottom: 0.3em;
}
.chart {
    height: 300px;
    max-width: 700px;
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
            title: 'Property vs Fund Analyzer',
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
        this.chartsContainer = new ChartsContainer('property-charts')
        for (let chart of this.model.getCharts()) {
            this.chartsContainer.addChart(chart)
        }
        this.changeGraph()
    },
    methods: {
        changeGraph() {
            this.model.importGuiParams(this.sliders)
            this.model.run()
            this.chartsContainer.updateFromModel(this.model)
        },
    },
}
</script>
