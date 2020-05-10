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
                    <v-card-title class="display-2 mt-3">
                        Property vs Funds
                    </v-card-title>
                    <v-card-text class="text-xs-left">
                        <div style="max-width: 500px">
                            <markdown-it-vue class="md-body" content="# Markdown"/>

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
                    <div id="charts" />
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped></style>

<script>
import MarkdownItVue from 'markdown-it-vue'
import 'markdown-it-vue/dist/markdown-it-vue.css'
import { ChartsContainer} from '../modules/charts-container'
import { PropertyModel } from '../modules/property-model'
import Sliders from '../components/sliders'

export default {
    components: { Sliders, MarkdownItVue },
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
            this.chartsContainer.addChart(
                chart.id, chart.title, chart.xlabel, '', chart.keys
            )
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
