<template>
    <v-container fluid class="pa-0 pt-1">
        <v-layout row wrap>
            <v-flex xs4 md4 lg3>
                <v-card
                    class="text-left"
                    style=" height: calc(100vh - 48px); overflow: auto;"
                >
                    <v-card-text>
                        <p class="small mt-3 mb-1">
                            PARAMETERS
                        </p>
                        <div v-for="(slider, i) in sliders" :key="i">
                            <div
                                v-if="'comment' in slider"
                                class="mt-5 text-capitalize font-italic"
                            >
                                {{ slider.label }}
                            </div>

                            <v-container
                                v-else
                                fluid
                                class="d-inline-flex pa-0"
                            >
                                <div class="flex-grow-1 pt-2">
                                    {{ slider.label }}
                                    <v-slider
                                        style="margin-top: -10px"
                                        v-model="slider.value"
                                        :max="slider.max"
                                        :step="slider.interval"
                                        hide-details
                                        @change="changeGraph()"
                                    />
                                </div>
                                <div class="pl-4 flex-grow-0">
                                    <v-text-field
                                        class="pt-0"
                                        style="width: 7em"
                                        type="number"
                                        step="any"
                                        v-model="slider.value"
                                        @keypress="changeGraph()"
                                    >
                                    </v-text-field>
                                </div>
                            </v-container>
                        </div>
                    </v-card-text>
                </v-card>
            </v-flex>

            <v-flex xs8 md8 lg9>
                <v-card style=" height: calc(100vh - 48px); overflow: auto;">
                    <v-card-title class="display-2 mt-3">
                        Property vs Funds
                    </v-card-title>
                    <v-card-text class="text-xs-left">
                        <div style="max-width: 500px">
                            <p>
                                There's that proverb which says rent money is
                                dead money. But interest repayments for a
                                property is also dead money. Maybe that money
                                could have be better invested in a managed fund.
                            </p>
                            <p>
                                So what is better in the long run - investing in
                                property or investing in managed funds?
                            </p>
                            <p>
                                The problem is that it's hard to visualize
                                interest repayments. So here we provide a visual
                                way to compare the difference in strategies,
                                whilst allowing an exploration of assumptions of
                                the world at large. ROI.
                            </p>
                            <p>
                                An apt comparison is to compare a home-owner
                                with a mortgage, with a renter who invests in a
                                managed fund. This way you can pit rental
                                payments versus mortgage interest payments. And
                                incorporate startup amounts.
                            </p>
                            <p>
                                More importantly, you can see the return on
                                investment, profit made on all payments, which
                                should be the point of comparison. Of course,
                                the final profitability will also depend on the
                                costs of sale (for a property) and captial gains
                                tax (for managed funds).
                            </p>
                            <p>
                                The actual result though depends very much on
                                what you believe the future will be like (up to
                                30 years for mortgages). So it is important to
                                see how the profit changes, when varying the
                                four major variables describing the future:
                            </p>

                            <ul>
                                <li>capital growth of the property</li>
                                <li>interest rate of the mortgage</li>
                                <li>captial growth of the investment fund</li>
                                <li>inflation which affects rental prices</li>
                            </ul>
                        </div>
                    </v-card-text>
                    <div id="charts2" />

                    <div id="charts" />
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped></style>

<script>
import { PropertyModel } from '../modules/property-model'
import $ from 'jquery'
import ChartWidget from '../modules/chart-widget'

export default {
    name: 'Home',
    components: {},
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
        let $div = $('#charts').empty()
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
                for (let [i, key] of chart.keys.entries()) {
                    console.log(key, key in this.model.solution)
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
