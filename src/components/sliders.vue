<template>
    <div>
        <p class="small mt-3 mb-1">
            PARAMETERS
        </p>
        <div v-for="(slider, i) in sliders" :key="i">
            <div
                    v-if="'comment' in slider"
                    class="mt-5 text-capitalize font-italic"
            >
                {{ slider.label }}
            </div>

            <v-container
                    v-else
                    fluid
                    class="d-inline-flex pa-0"
            >
                <div class="flex-grow-1 pt-2">
                    {{ slider.label }}
                    <v-slider
                            style="margin-top: -10px"
                            v-model="slider.value"
                            :max="slider.max"
                            :step="slider.interval"
                            hide-details
                            @change="change()"
                    />
                </div>
                <div class="pl-4 flex-grow-0">
                    <v-text-field
                            class="pt-0"
                            style="width: 7em"
                            type="number"
                            step="any"
                            v-model="slider.value"
                            @keypress="change()"
                    >
                    </v-text-field>
                </div>
            </v-container>
        </div>
    </div>
</template>

<script>
    export default {
        name: 'Sliders',
        props: {
                sliders: Array,
                callback: Function
        },
        watch: {
            sliders: {
                handler() {
                    this.change()
                },
                deep: true,
            },
        },
        methods: {
            change() {
                this.callback()
            },
        },
    }
</script>
