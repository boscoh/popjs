<template>
    <v-container fluid class="pa-0" style="overflow: hidden">
        <v-row row wrap no-gutters>
            <v-flex
                xs4
                md4
                lg3
                style="margin-top: 30px; height: calc(100vh - 85px); overflow: auto;"
            >
                <div class="pa-3">
                    <sliders :sliders="sliders"></sliders>
                </div>
            </v-flex>

            <v-flex
                xs8
                md8
                lg9
                style="
                  height: calc(100vh - 60px);
                  border-left: 1px solid #EEE;
                  overflow: auto;"
            >
                <div class="pa-4 mt-5">

                    <div
                        class="
                            display-2
                            narrow-column
                            font-weight-light
                            mt-5
                            mb-3"
                    >
                        {{ title }}
                    </div>

                    <div v-if="link">
                      <a :href="link">[javascript source]</a>
                      <br>
                      <br>
                    </div>

                    <div :id="chartsId" row wrap />

                    <br />
                    <br />
                    <br />
                    <br />
                </div>
            </v-flex>
        </v-row>
    </v-container>
</template>

<style>
.narrow-column {
    max-width: 500px;
}
</style>

<script>
import { ChartsContainer } from './charts-container'
import Sliders from './sliders'
import ModelClass from '@/models/index'

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
            this.model = new ModelClass[name]()
            this.title = this.model.title
            this.link = this.model.link ? this.model.link : ''
            this.sliders = this.model.getGuiParams()
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
