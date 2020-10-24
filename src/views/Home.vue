<template>
    <v-container fluid>
        <v-row no-gutters>
            <v-col
                offset-xs="4"
                xs="8"
                offset-sm="4"
                sm="8"
                offset-md="4"
                md="8"
                offset-lg="3"
                lg="9"
                class="pa-4 pb-5 mt-5"
            >
                <p class="display-2 mt-5">PopJS</p>
                <div v-html="preHtml"></div>
                <div v-for="(route, i) in routes" :key="i" class="mb-3">
                    <v-btn :to="route.path">{{ route.name }}</v-btn>
                </div>
                <div style="height: 3em"></div>
            </v-col>
        </v-row>
    </v-container>
</template>

<style>
p {
    max-width: 500px;
}
</style>

<script>
import markdownIt from 'markdown-it'
import dedent from 'dedent'
import models from '@/models/index'
import _ from 'lodash'
let md = markdownIt('commonmark')

function getRoute(m) {
    return { path: m.path, name: m.name }
}

export default {
    name: 'Home',
    data () {
        return {
            routes: _.map(models, getRoute),
            preHtml: md.render(dedent`
                &copy; 2020 [Bosco Ho](https://boscoh.com)

                PopJS is a javascript engine to develop
                 population dynamics models purely in the
                front-end.

                Source: &lt;<https://github.com/boscoh/popjs>&gt;
                Built on Vue, Vuetify using Runge-Kutta for integration.

                Population dynamics models use calculus in
                 simple differential equations to model a wide variety
                 of population behavior, from explosive growth,
                  equilibrium, cycles and catastrophic collapse.

           `),
        }
    },
}
</script>
