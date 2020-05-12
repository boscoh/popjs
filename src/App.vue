<template>
    <v-app>
        <v-app-bar app light color="white">
            <div class="d-flex align-center">
                <v-icon
                    alt="Vuetify Logo"
                    class="shrink mr-2"
                    contain
                    width="40"
                >
                    mdi-chart-timeline-variant
                </v-icon>
            </div>

            <v-toolbar-title class="title shrink mt-1 hidden-sm-and-down">
                Dynamic Models
            </v-toolbar-title>

            <v-spacer></v-spacer>

            <v-btn to="/" text router>Home</v-btn>
            <v-btn to="/state" text router>Demographic</v-btn>
            <v-btn to="/epi" text router>Epidemiology</v-btn>
            <v-btn to="/econ" text router>Economics</v-btn>
            <v-btn to="/property" text router>Property</v-btn>
        </v-app-bar>

        <v-content>
            <router-view></router-view>
        </v-content>
    </v-app>
</template>

<script>
export default {
    name: 'App',

    data: () => ({
        //
    }),
}
</script>
