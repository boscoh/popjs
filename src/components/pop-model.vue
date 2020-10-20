<template>
    <v-container fluid class="pa-0">
        <v-row row wrap no-gutters>
            <v-flex
                xs4
                md4
                lg3
                class="mt-5 pt-5"
                style="height: calc(100vh - 48px); overflow: auto;"
            >
                  <div class="pa-3">
                      <sliders :sliders="sliders"></sliders>
                  </div>
            </v-flex>

            <v-flex
                xs8
                md8
                lg9
                class="pa-4 pb-5 mt-5"
                style="height: calc(100vh - 48px); border-left: 1px solid #EEE; overflow: auto;"
            >
                <div class="display-2 narrow-column font-weight-light mt-5 mb-3">
                    {{ title }}
                </div>
                <div :id="chartsId" row wrap />
            </v-flex>
        </v-row>
    </v-container>
</template>

<style>
.chart {
    height: 300px;
    min-width: 400px;
    max-width: 600px;
}
.narrow-column {
    max-width: 500px;
}
</style>

<script>
import { ChartsContainer } from './charts-container'
import Sliders from './sliders'
import models from '@/models/index'

export default {
    name: 'PopModel',
    components: { Sliders },
    props: ['name'],
    data () {
        return {
            title: '',
            chartsId: `${this.name}-charts`,
            sliders: [],
        }
    },
    watch: {
        sliders: {
            handler () {
                this.changeGraph()
            },
            deep: true,
        },
    },
    async mounted () {
        this.model = models[this.name]
        this.title = this.model.title
        this.sliders = this.model.getGuiParams()
        this.chartsContainer = new ChartsContainer(this.chartsId)
        for (let chart of this.model.getCharts()) {
            this.chartsContainer.addChart(chart)
        }
        this.changeGraph()
    },
    methods: {
        changeGraph () {
            this.model.importGuiParams(this.sliders)
            this.model.run()
            this.chartsContainer.updateFromModel(this.model)
        },
    },
}
</script>
