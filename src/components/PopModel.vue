<template>
    <v-container fluid class="pa-0" style="overflow: hidden">
        <v-row no-gutters>
            <v-col
                xs="4"
                sm="4"
                md="4"
                lg="3"
                style="height: calc(100vh - 80px); overflow: auto;"
            >
                <div class="pa-4" style="margin-top: 30px; margin-bottom: 3em">
                    <sliders :sliders="sliders"></sliders>
                </div>
            </v-col>

            <v-col
                xs="8"
                sm="8"
                md="8"
                lg="9"
                style="
                  height: calc(100vh - 75px);
                  border-left: 1px solid #EEE;
                  overflow: auto;"
            >
                <div class="pa-4 mt-5">
                    <div class="display-1 narrow-column mb-3">
                        {{ title }}
                    </div>

                    <div v-if="link" class="mb-3">
                        <v-btn small :href="link">javascript source</v-btn>
                    </div>

                    <div :id="chartsId"></div>

                    <div style="height: 3em"></div>
                </div>
            </v-col>
        </v-row>
    </v-container>
</template>

<style>
.narrow-column {
    max-width: 500px;
}
h3 {
    font-weight: normal;
    text-transform: uppercase;
    font-size: 1.2em;
}
</style>

<script>
import _ from 'lodash'
import { ChartsContainer } from './charts-container'
import Sliders from '@/components/Sliders'
import models from '@/models/index'

export default {
    name: 'PopModel',
    components: { Sliders },
    props: ['name'],
    data () {
        return {
            title: '',
            link: '',
            chartsId: `${this.name}-charts`,
            modelName: this.name,
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
        $route (to) {
            this.build(to.name)
        },
    },
    mounted () {
        this.build(this.name)
    },
    methods: {
        build (name) {
            console.log('PopModel.mounted', name)
            let model = _.find(models, { name })
            this.model = new model.ModelClass()
            this.title = this.model.title
            this.link = this.model.link ? this.model.link : ''
            let params = this.model.getGuiParams()
            for (let param of params) {
              this.model.fillGuiParam(param)
            }
            this.sliders = params
            this.chartsContainer = new ChartsContainer(this.chartsId)
            for (let chart of this.model.getCharts()) {
                this.chartsContainer.addChart(chart)
            }
            this.changeGraph()
        },
        changeGraph () {
            this.model.importGuiParams(this.sliders)
            this.model.run()
            this.chartsContainer.updateFromModel(this.model)
        },
    },
}
</script>
