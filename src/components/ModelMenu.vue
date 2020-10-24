<template>
    <div>
        <v-menu offset-y>
            <template v-slot:activator="{ on, attrs }">
                <v-btn color="light" light v-bind="attrs" v-on="on">
                    <v-icon alt="Logo" class="shrink mr-2" contain width="40">
                        mdi-chart-timeline-variant
                    </v-icon>
                    PopJS::Models
                </v-btn>
            </template>
            <v-list>
                <v-list-item v-for="(item, i) in items" :key="i" :to="item.to">
                    <v-list-item-title>{{ item.title }}</v-list-item-title>
                </v-list-item>
            </v-list>
        </v-menu>
    </div>
</template>

<script>
import models from '@/models/index'

let items = [{ to: '/', title: 'Home' }]
for (let m of models) {
    items.push({ to: m.path, title: m.name })
}

export default {
    name: 'ModelMenu',
    data () {
        return { items }
    },
}
</script>
