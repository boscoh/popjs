<template>
    <div>
        <p class="small mt-3 mb-1">
            PARAMETERS
        </p>

        <div class="d-none d-md-block">
            <div
                v-for="(slider, i) in sliders"
                :key="i"
                style="margin-bottom: -10px"
            >
                <div
                    v-if="'comment' in slider"
                    class="mt-5 text-capitalize font-italic"
                    style="margin-bottom: 10px; padding-top: 20px"
                >
                    {{ slider.label }}
                </div>
                <v-container v-else fluid class="d-inline-flex pa-0">
                    <div class="flex-grow-1 pt-2">
                        {{ slider.label }}
                        <v-slider
                            style="margin-top: -10px"
                            v-model="slider.value"
                            :max="slider.max"
                            :min="slider.min ? slider.min : 0"
                            :step="slider.interval"
                            hide-details
                            @change="changeSlider()"
                        />
                    </div>
                    <div class="pl-4 flex-grow-0">
                        <v-text-field
                            class="pt-0"
                            style="width: 7em"
                            type="number"
                            step="any"
                            v-model="slider.inputValue"
                            v-on:keypress.enter="changeInput()"
                        >
                        </v-text-field>
                    </div>
                </v-container>
            </div>
        </div>

        <div class="d-block d-md-none">
            <div
                v-for="(slider, i) in sliders"
                :key="i"
                style="margin-bottom: -10px"
            >
                <div
                    v-if="'comment' in slider"
                    class="mt-5 text-capitalize font-italic"
                    style="margin-bottom: 10px; padding-top: 0px"
                >
                    {{ slider.label }}
                </div>
                <div v-else>
                    <v-container fluid class="d-inline-flex pa-0">
                        <div class="flex-grow-1 pt-2">
                            <v-slider
                                v-model="slider.value"
                                :max="slider.max"
                                :min="slider.min ? slider.min : 0"
                                :step="slider.interval"
                                @change="changeSlider()"
                            />
                            <div style="margin-top: -10px" class="ml-2">
                                {{ slider.label }}
                            </div>
                            <v-text-field
                                class="mt-n1 ml-2 mb-3 pt-0"
                                type="number"
                                step="any"
                                v-model="slider.inputValue"
                                v-on:keypress.enter="changeInput()"
                            >
                            </v-text-field>
                        </div>
                    </v-container>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Sliders',
    props: {
        sliders: Array,
        callback: Function,
    },
    methods: {
        changeSlider() {
            if (this.callback) {
                console.log('changeSlider')
                for (let slider of this.sliders) {
                    slider.inputValue = slider.value
                }
                this.callback()
            }
        },
        changeInput() {
            if (this.callback) {
                console.log('changeInput')
                for (let slider of this.sliders) {
                    slider.value = slider.inputValue
                }
                this.callback()
            }
        },
    },
}
</script>
