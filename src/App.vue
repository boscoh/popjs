<template>
    <v-app>
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
                >
                    <model-menu class="pl-3"></model-menu>
                </v-col>
            </v-row>
        </v-container>

        <v-content style="overflow: hidden">
            <router-view></router-view>
        </v-content>
    </v-app>
</template>

<script>
import ModelMenu from '@/components/ModelMenu'

export default {
    name: 'App',
    components: { ModelMenu },
}
</script>
