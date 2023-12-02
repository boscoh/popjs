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
        <sliders :sliders="sliders" :callback="changeGraph"></sliders>
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

        <div v-for="(chart, i) of charts" :key="i">
          <div class="narrow-column" v-html="chart.html"></div>
          <line-chart
              style="height: 300px; min-width: 400px; max-width: 600px;"
              :chart-data="chart.data"
              :options="chart.options"
          ></line-chart>
        </div>
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
</style>

<script>
import _ from 'lodash'
import Sliders from '@/components/Sliders'
import models from '@/models/index'
import LineChart from './LineChart.js'
import dedent from 'dedent'

const md = require('markdown-it')('commonmark')
const mk = require('markdown-it-katex')
md.use(mk)

const colors = [
  '#4ABDAC', // fresh
  '#FC4A1A', // vermilion
  '#F78733', // sunshine
  '#037584', // starry night
  '#007849', // iris
  '#FAA43A', // orange
  '#60BD68', // green
  '#F17CB0', // pink
  '#B2912F', // brown
  '#B276B2', // purple
  '#DECF3F', // yellow
  '#F15854', // red
  '#C08283', // pale gold
  '#dcd0c0', // silk
  '#E37222', // tangerine
]

const seenNames = []

function getColor(name) {
  let i = seenNames.indexOf(name)
  if (i < 0) {
    seenNames.push(name)
    i = seenNames.length - 1
  }
  return colors[i % colors.length]
}

function makeOptions(title, xAxisLabel, yAxisLabel) {
  return {
    title: {
      fontStyle: 'normal',
      display: true,
      text: title,
    },
    legend: {
      display: true,
      position: 'right',
      labels: {usePointStyle: true},
    },
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      xAxes: [
        {
          display: true,
          type: 'linear',
          position: 'bottom',
          scaleLabel: {
            display: true,
            labelString: xAxisLabel,
          },
          ticks: {},
        },
      ],
      yAxes: [
        {
          display: true,
          type: 'linear',
          scaleLabel: {
            display: true,
            labelString: yAxisLabel,
          },
          ticks: {},
        },
      ],
    },
  }
}

function buildDataset(name, xValues, yValues, color) {
  const data = []
  if (xValues && yValues) {
    for (let i = 0; i < xValues.length; i += 1) {
      data.push({
        x: xValues[i],
        y: yValues[i],
      })
    }
  }
  return {
    label: _.startCase(name),
    data: data,
    fill: false,
    backgroundColor: color,
    borderColor: color,
    showLine: true,
    pointStyle: 'line',
    pointRadius: 0,
    borderWidth: 2,
  }
}

export default {
  name: 'PopModel',
  components: {Sliders, LineChart},
  props: ['name'],
  data() {
    return {
      title: '',
      link: '',
      chartsId: `${this.name}-charts`,
      charts: [],
      modelName: this.name,
      sliders: [],
    }
  },
  watch: {
    $route(to) {
      this.build(to.name)
    },
  },
  mounted() {
    this.build(this.name)
  },
  methods: {
    updateDataset(charts) {
      for (let chart of charts) {
        if (chart.fn) {
          const xlims = chart.xlims
          const xmin = xlims[0]
          const xmax = xlims[1]
          const xstep = (xmax - xmin) / 100
          const x = _.range(xmin, xmax, xstep)
          const y = _.map(x, this.model.fn[chart.fn])
          chart.data = {
            datasets: [buildDataset(
                chart.fn,
                x, y, getColor(chart.fn)
            )]
          }
        } else {
          let datasets = []
          for (let key of _.get(chart, 'keys', [])) {
            let xValues = []
            let yValues = []
            if (_.has(this.model.solution, key)) {
              xValues = this.model.times
              yValues = this.model.solution[key]
            }
            datasets.push(
                buildDataset(key, xValues, yValues, getColor(key))
            )
          }
          chart.data = {datasets}
        }
      }
    },
    build(name) {
      console.log('PopModel.build', name)
      let model = _.find(models, {name})
      this.model = new model.ModelClass()
      this.title = this.model.title
      this.link = this.model.link ? this.model.link : ''
      let params = this.model.getGuiParams()
      for (let param of params) {
        this.model.fillGuiParam(param)
      }
      this.sliders = params
      this.model.run()
      let charts = this.model.getCharts()
      for (let chart of charts) {
        if (chart.markdown) {
          chart.html = md.render(dedent(chart.markdown))
        }
        chart.options = makeOptions(
            _.get(chart, 'title', ''),
            _.get(chart, 'xlabel', ''),
            _.get(chart, 'ylabel', '')
        )
        let yAxis = chart.options.scales.yAxes[0]
        if ('ymin' in chart) {
          yAxis.ticks.min = chart.ymin
        }
        if ('ymax' in chart) {
          yAxis.ticks.min = chart.ymax
        }
      }
      this.updateDataset(charts)
      this.charts = charts
    },
    changeGraph() {
      console.log('changeGraph')
      this.model.importGuiParams(this.sliders)
      this.model.run()
      this.updateDataset(this.charts)
    },
  },
}
</script>
