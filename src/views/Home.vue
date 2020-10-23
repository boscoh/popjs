<template>
    <v-container fluid class="pa-0 pt-1">
        <v-row no-gutters>
            <v-flex
                xs4
                md4
                lg3
                class="mt-5 pt-5"
                style="height: calc(100vh - 48px); overflow: auto;"
            >
            </v-flex>

            <v-flex xs8 md8 lg9 class="pa-4 pb-5 mt-5">
                <p class="display-2 font-weight-light mt-5">
                    PopJS
                </p>
                <p class="mt-5 font-weight-bold text-uppercase">
                    Population Dynamics Modeling
                </p>

                <div v-html="preHtml"></div>

                <div
                    v-for="(route, i) in routes"
                    :key="i"
                    class="mb-3"
                >
                  <v-btn :to="route.path">
                    {{route.name}}
                  </v-btn>
                </div>

              <div v-html="postHtml"></div>

            </v-flex>
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
import katex from 'markdown-it-katex'
import dedent from 'dedent'
import models from '@/models/index'

let md = markdownIt('commonmark').use(katex)

let routes = []
for (let m of models) {
  routes.push({
    path: m.path,
    name: m.name,
  })
}

export default {
    name: 'Home',
    data () {
        return {
            routes,
            preHtml: md.render(dedent`
                PopJS is a javascript engine to develop
                 population dynamics index purely in the
                front-end.

                Source: &lt;<https://github.com/boscoh/popjs>&gt;

                Population dynamics index use calculus in
                 simple differential equations to model a wide variety
                 of population behavior, from explosive growth,
                  equilibrium, cycles and catastrophic collapse.

           `),
          postHtml: md.render(dedent`
                Built on Vue, Vuetify using Runge-Kutta for integration.

                &copy; 2020 [Bosco Ho](https://boscoh.com)
           `),
        }
    },
}
</script>
