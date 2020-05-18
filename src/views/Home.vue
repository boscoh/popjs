<template>
    <v-container fluid class="pa-0 pt-1">
        <v-layout>
            <v-flex xs12 sm12 md4 lg4 class="mx-auto pa-3 pt-5">
                <br />
                <p class="display-2 font-weight-light mt-5">
                    PopJS
                </p>
                <p class="mt-5 font-weight-bold text-uppercase">
                    Population Dynamics Modeling
                </p>

                <div v-html="rawHtml"></div>
            </v-flex>
        </v-layout>
    </v-container>
</template>

<script>
import markdownIt from 'markdown-it'
import katex from 'markdown-it-katex'
let md = markdownIt('commonmark').use(katex)
export default {
    name: 'Home',
    data() {
        return {
            rawHtml: md.render(`


PopJS is a javascript engine to develop
 population dynamics models purely in the
front-end.

Source code: &lt;<https://github.com/boscoh/popjs>&gt;

Population dynamics models use calculus in
 simple differential equations to model a wide variety
 of population behavior, from explosive growth,
  equilibrium, cycles and catastrophic collapse.


Built on Vue, Vuetify using the RK45.js
library for Runge-Kutta-Fehlberg method for integration.

&copy; 2020 [Bosco Ho](https://boscoh.com)

            `),
        }
    },
}
</script>
