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
          Property and Fund Analyzer
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
          class="text-xs-left"
          style="
            height: calc(100vh - 180px);
            overflow: auto;">

          <v-card-text class="text-xs-left">
            <h3 class="headline">Parameters</h3>
            <div
              v-for="(key, i) in keys"
              :key="i">

              <div v-if="isComment(key)">
                <br>
                <span style="font-style: italic">
                  {{ convertTitle(key) }}
                </span>
              </div>

              <div v-else>
                <v-slider
                  hide-details
                  v-model="paramInputs[key].value"
                  :max="paramInputs[key].max"
                  :step="paramInputs[key].interval"
                  @end="updateModel()"/>
                <div>
                  {{ convertTitle(key) }} = {{ paramInputs[key].value }}
                </div>
              </div>

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

          <v-card-text class="text-xs-left">
            <p>
              What is better in the long run - investing in property or managed funds?
            </p>
            <p>
              There's that proverb which says rent money is dead money. But
              interest repayments for a property is also dead money. It's
              much harder though to visualize interest repayments - most
              people can't. Here we provide a way to visually compare the two.
            </p>
            <p>
              An apt comparison
              is to compare a home-owner with a mortgage, with a renter
              who invests in a managed fund. This way you can pit rental payments
              versus mortgage interest payments. And incorporate startup amounts.
            </p>
            <p>
              More importantly, you can see the return on investment,
              profit made on all payments, which should be the point of comparison.
              Of course, the final profitability will also depend on the costs
              of sale (for a property) and captial gains tax (for managed funds).
            </p>
            <p>
              The actual result though depends very much on what you believe
              the future will be like (up to 30 years for mortgages). So it is
              important to see how the profit changes, when varying
              the four major variables describing the future:
            </p>

            <ul>
              <li>capital growth of the property</li>
              <li>interest rate of the mortgage</li>
              <li>captial growth of the investment fund</li>
              <li>inflation which affects rental prices</li>
            </ul>

          </v-card-text>

          <div id="charts"/>

        </v-card>
      </v-flex>

    </v-layout>

  </v-container>
</template>

<!-- Add 'scoped' attribute to limit CSS to this component only -->
<style scoped>
p {
  margin-bottom: 0.3em;
}
li {
  margin: 0;
  line-height: 1em;
}
</style>

<script>
import _ from 'lodash'
import vueSlider from 'vue-slider-component'
import {
  makeLineChartData,
  addDataset,
  ChartsContainer
} from '../modules/chartdata'
import { Model } from '../modules/model'

let keys = [
  '# future guesstimates',
  'interestPerYear',
  'propertyGrowthPerYear',
  'inflationPerYear',
  'fundGrowthPerYear',
  '# initial payments',
  'startupCost',
  'deposit',
  '# property parameters',
  'initialProperty',
  'mortgageLengthYear',
  '# rent parameters',
  'initialRent'
]

let paramInputs = {
  initialProperty: { value: 600000.0, interval: 10000, max: 1500000 },
  startupCost: { value: 20000.0, interval: 1000, max: 100000 },
  deposit: { value: 150000.0, interval: 1000, max: 1500000 },
  interestPerYear: { value: 5.0, interval: 0.1, max: 18 },
  mortgageLengthYear: { value: 30, interval: 1, max: 100 },
  propertyGrowthPerYear: { value: 4.5, interval: 0.1, max: 18 },
  initialRent: { value: 2000, interval: 100, max: 15000 },
  inflationPerYear: { value: 1.5, interval: 0.1, max: 18 },
  fundGrowthPerYear: { value: 6, interval: 0.1, max: 18 }
}

let charts = [
  {
    title: 'Property',
    props: [
      'property',
      'propertyInterestTotal',
      'interestTotal',
      'principal',
      'propertyProfit'
    ]
  },
  {
    title: 'Investment Fund',
    props: [
      'fund',
      'fundRentPaidTotal',
      'rentTotal',
      'fundPaidTotal',
      'fundProfit'
    ]
  },
  {
    title: 'Return on investment',
    props: [
      'propertyProfit',
      'propertyInterestTotal',
      'fundRentPaidTotal',
      'fundProfit'
    ]
  },
  {
    title: 'Monthly Expenses',
    props: ['paymentMonth', 'interestMonth', 'rentMonth', 'fundMonth']
  }
]

function getChartDataOfSimulation(params) {
  let model = new Model(params)
  model.integrate()

  let nMonth = model.params.mortgageLengthYear * 12
  let xValues = []
  for (let i = 0; i < nMonth; i += 1) {
    xValues.push(i / 12.0)
  }

  return _.map(charts, chart => {
    let chartData = makeLineChartData()
    chartData.options.title.text = chart.title
    let datasets = chartData.data.datasets
    for (let prop of chart.props) {
      let name = _.kebabCase(prop).replace(/-/g, ' ')
      const yValues = model.soln[prop]
      addDataset(datasets, name, xValues, yValues)
    }
    return chartData
  })
}

export default {
  name: 'Home',
  components: { vueSlider },
  data() {
    return {
      paramInputs,
      keys
    }
  },
  mounted() {
    this.chartsContainer = new ChartsContainer('#charts')
    this.updateModel()
  },
  methods: {
    updateModel() {
      console.log('> updateModel')
      let params = _.mapValues(paramInputs, o => o.value)
      let chartDataList = getChartDataOfSimulation(params)
      this.chartsContainer.update(chartDataList)
    },
    isComment(key) {
      return _.startsWith(key, '#')
    },
    convertTitle(key) {
      if (_.startsWith(key, '#')) {
        let n = key.length
        key = key.substr(1, n)
      }
      return _.lowerCase(_.startCase(key))
    }
  }
}
</script>
