import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import Property from '../views/Property.vue'
import Epi from '../views/Epi.vue'
import Econ from '../views/Econ.vue'
import State from '../views/State.vue'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
    },
    {
        path: '/property',
        name: 'Property',
        component: Property,
    },
    {
        path: '/state',
        name: 'State',
        component: State,
    },
    {
        path: '/epi',
        name: 'Epi',
        component: Epi,
    },
    {
        path: '/econ',
        name: 'Econ',
        component: Econ,
    },
]

const router = new VueRouter({
    routes,
})

export default router
