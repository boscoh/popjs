<template>
    <v-app>
        <v-app-bar app light flat color="white">
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
                PopJS
            </v-toolbar-title>

            <v-spacer></v-spacer>

            <v-menu offset-y>
                <template v-slot:activator="{ on, attrs }">
                    <v-btn color="light" light v-bind="attrs" v-on="on">
                        Models
                    </v-btn>
                </template>
                <v-list>
                    <v-list-item to="/" text router
                        ><v-list-item-title
                            >Home</v-list-item-title
                        ></v-list-item
                    >
                    <v-list-item
                        v-for="(item, index) in items"
                        :key="index"
                        :to="item.to"
                    >
                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>
        </v-app-bar>

        <v-content style="overflow: hidden">
            <router-view></router-view>
        </v-content>
    </v-app>
</template>

<script>
export default {
    name: 'App',
    data () {
        return {
            items: [
                { to: '/ecologymodel', title: 'Ecology' },
                { to: '/statemodel', title: 'Demographic' },
                { to: '/sirmodel', title: 'Epidemiology' },
                { to: '/econmodel', title: 'Economics' },
                { to: '/propertymodel', title: 'Property' },
            ],
        }
    },
}
</script>
