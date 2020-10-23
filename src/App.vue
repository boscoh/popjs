<template>
    <v-app>
        <v-flex offset-xs4 xs8 offset-md4 md8 offset-lg3 lg9 class="pt-5 pl-3">
            <div class="d-flex align-center"></div>

            <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn color="light" light v-bind="attrs" v-on="on">
                        <v-icon
                            alt="Vuetify Logo"
                            class="shrink mr-2"
                            contain
                            width="40"
                        >
                            mdi-chart-timeline-variant
                        </v-icon>
                        PopJS::Models
                    </v-btn>
                </template>
                <v-list>
                    <v-list-item
                        v-for="(item, index) in items"
                        :key="index"
                        :to="item.to"
                    >
                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
        </v-flex>

        <v-content style="overflow: hidden">
            <router-view></router-view>
        </v-content>
    </v-app>
</template>

<script>
import models from '@/models/index'

let items = [{to: '/', title: 'Home'}]
for (let m of models) {
  items.push({to: m.path, title: m.name})
}

export default {
    name: 'App',
    data () {return {items}},
}
</script>
