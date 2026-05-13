<template lang="pug">
.w-100.d-flex.flex-column(style="height: 100vh")

  nav-bar(:name="name")

  // Interactive Parameters Side Panel
  .offcanvas.offcanvas-end(
    tabindex="-1" id="offcanvasExample" aria-labelledby="offcanvasExampleLabel"
    style="max-width: 280px"
  )
    .offcanvas-header
      h5.offcanvas-title(id="offcanvasExampleLabel") &nbsp;
      button.btn-close.text-reset(data-bs-dismiss="offcanvas" aria-label="Close")
    .offcanvas-body
      param-panel(:params="params" :callback="changeGraph")

  // Main 2-column Container
  .d-flex.flex-row.overflow-hidden

    // Toggle Params Panel Button
    .p-1.pe-3.d-block.d-md-none.position-absolute.text-end(style="width: 100%")
      button.btn.btn-sm.btn-secondary(
        data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample"
      )
        | &leftarrow; Interactive Parameters

    // Param Panel show if width is > sm
    .d-none.d-md-block.col-4.border-end.overflow-auto(
      style="height: calc(100vh - var(--nav-bar-height))"
    )
      .d-flex.flex-row-reverse
        .px-5(style="max-width: 400px")
          .py-4
          param-panel(:params="params" :callback="changeParams")

    // The Charts
    .col-sm-12.col-md-8.com-lg-8.overflow-auto(
      style="height: calc(100vh - var(--nav-bar-height))"
    )
      .px-5.pb-4.d-flex.flex-column(v-if="model")
        h2.mt-5 {{ model.title }}
        div
          a.btn.btn-sm.btn-outline-secondary(:href="model.link") source
        .mt-2(v-for="(chart, i) of charts" :key="i")
          .mt-3(v-html="chart.html" style="max-width: 550px")
          div(style="max-width: 650px; height: 350px")
            Line(:id="chart.title" :options="chart.options" :data="chart.data")
      .pb-5
      .pb-5
</template>

<script>
import _ from 'lodash'
import 'chart.js/auto'
import {Line} from 'vue-chartjs'

import models from '../models'
import NavBar from '../components/NavBar.vue'
import ParamPanel from '../components/ParamPanel.vue'

export default {
  components: {Line, NavBar, ParamPanel},
  props: ['name'],
  data() {
    return {
      charts: [],
      params: [],
    }
  },
  mounted() {
    this.build(this.name)
  },
  watch: {
    name: function (newVal, oldVal) {
      console.log('prop change name', newVal) // watch it
      this.build(newVal)
    },
  },
  methods: {
    build(name) {
      const model = _.find(models, {name})
      this.model = new model.ModelClass()
      this.title = this.model.title
      this.params = this.model.getParams()
      this.charts = this.model.getChartJsTemplates()
      this.changeParams()
    },
    changeParams() {
      console.log('changeParams')
      this.model.setParams(this.params)
      this.model.updateChartJsData(this.charts)
    },
  },
}
</script>
