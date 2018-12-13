<template>
  <v-container
    fluid
    grid-list-xl>

    <v-layout 
      row 
      wrap>
      <v-flex xs12>
        <h1 
          class="display-1" 
          style="text-align: left">
          {{ title }}
        </h1>
      </v-flex>
    </v-layout>

    <v-layout 
      row 
      wrap>

      <v-flex 
        xs4 
        md3 
        lg2>
        <v-card
          style="
            height: calc(100vh - 180px);
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
                ref="slider"
                :step="param.interval"
                :max="param.max"
                v-model="param.value"
                @callback="changeGraph()"/>
            </div>
          </v-card-text>

        </v-card>
      </v-flex>

      <v-flex 
        xs8 
        md9 
        lg10>
        <v-card
          style="
            height: calc(100vh - 180px);
            overflow: auto;">
          <v-card-title class="headline">
            Graphs
          </v-card-title>
          <v-card-text>

            <v-layout
              id="econ-charts"
              row
              wrap/>

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
import util from '../modules/util'

export default {
  data() {
    return {
      title: '',
      sliders: []
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
    this.model = new EconModel()
    this.title = this.model.modelType

    util.copyArray(this.sliders, this.model.guiParams)

    let $div = $('#econ-charts')
    this.graphWidgets = {}
    for (let chart of this.model.charts) {
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
  methods: {
    changeGraph() {
      this.model.importGuiParams(this.sliders)
      this.model.run(30, 1)
      for (let chart of this.model.charts) {
        if (chart.divTag === 'wagefn-chart') {
          let xVals = _.range(0.51, 1.49, 0.01)
          this.graphWidgets[chart.divTag].updateDataset(
            0,
            xVals,
            _.map(xVals, this.model.fns.wageChangeFn)
          )
        } else if (chart.divTag === 'investfn-chart') {
          let xVals = _.range(-0.49, 0.49, 0.01)
          this.graphWidgets[chart.divTag].updateDataset(
            0,
            xVals,
            _.map(xVals, this.model.fns.investmentChangeFn)
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
    }
  }
}
</script>
