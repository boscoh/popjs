<template>
  <v-container
    fluid
    grid-list-xl>

    <v-layout
      row 
      wrap>
      <v-flex
        xs12 
        style="text-align: left">
        <h1 class="display-1">
          {{ title }}
        </h1>
      </v-flex>
      <v-flex
        xs12>
        <v-select
          :items="modelNames"
          v-model="modelName"
          style="width: 500px"
          label="Model Type"
          solo
          @change="changeModel"
        />
      </v-flex>
    </v-layout>

    <v-layout 
      row>

      <v-flex
        xs4
        md3 
        lg2>
        <v-card
          style="
            height: calc(100vh - 270px);
            overflow: auto;">
          <v-card-title class="headline">
            Parameters
          </v-card-title>
          <v-card-text>
            <div
              v-for="(param, i) of sliders"
              :key="i"
              style="text-align: left"
              column>
              {{ param.label }} =
              {{ param.decimal ? param.value.toFixed(param.decimal) : param.value }}
              <v-slider
                :step="param.interval"
                :max="param.max"
                v-model="param.value"
                @callback="changeGraph()"/>
            </div>
            <v-btn @click="randomizeGraph()">
              random
            </v-btn>
          </v-card-text>
        </v-card>
      </v-flex>

      <v-flex
        xs8
        md9
        lg10>
        <v-card
          style="
            height: calc(100vh - 270px);
            overflow: auto;">
          <v-card-title class="headline">
            Graphs
          </v-card-title>
          <v-card-text>
            <div id="epi-charts"/>
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
import util from '../modules/util'
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
      modelNames: []
    }
  },
  watch: {
    sliders: {
      handler() {
        this.changeGraph()
      },
      deep: true
    }
  },
  async mounted() {
    this.modelNames = _.map(epiModels, e => e.name)
    this.modelName = epiModels[0].name
    this.changeModel()
  },
  methods: {
    changeModel() {
      let epiModel = _.find(epiModels, e => e.name === this.modelName)
      this.model = new epiModel.Class()
      this.title = 'Basic ' + this.model.modelType + ' Epi Model'
      this.charts = [
        {
          title: 'COMPARTMENTS',
          divTag: 'compartment-chart',
          keys: _.keys(this.model.compartment),
          xlabel: 'time (days)'
        }
      ]
      if (this.modelName !== 'Ebola') {
        this.charts.push({
          title: 'RN',
          divTag: 'rn-chart',
          keys: ['rn'],
          xlabel: 'time (days)'
        })
      }

      util.copyArray(this.sliders, this.model.guiParams)

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
    },
    changeGraph() {
      this.model.importGuiParams(this.sliders)
      let nStep = this.model.param.time / 1
      this.model.run(nStep, 1)
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
    randomizeGraph() {
      for (let slider of this.sliders) {
        slider.value = Math.random() * slider.max
      }
      this.changeGraph()
    }
  }
}
</script>
