<template lang="pug">
h4.mb-5 Interactive Parameters

template(v-for="param in params")

  i.mt-5.mb-2(v-if="param.comment")
    | {{ param.label }}

  div(v-else)

    | {{ param.label }}

    .d-flex.flex-row.w-100.justify-space-between.align-center.align-items-center

      .flex-grow-1
        vue-slider.w-100(
          :dragOnClick="true"
          tooltip="none"
          :height="6"
          v-model="param.value"
          :min="param.min ? param.min : 0"
          :interval="param.interval"
          :max="param.max"
          @change="callback"
          @drag-end="callback"
        )

      .ms-2
        input.form-control(
          :min="param.min ? param.min : 0"
          :step="param.interval"
          :max="param.max"
          type="number"
          v-model="param.value"
          @change="callback"
        )
.pb-5
.pb-5
</template>

<style></style>

<script>
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'

export default {
    props: ['params', 'callback'],
    components: { VueSlider },
}
</script>
