import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'
import PopModel from '@/components/pop-model'
import models from '@/models/index'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
    },
]

console.log(models)
for (let name in models) {
    routes.push({
        path: '/' + name,
        name,
        component: PopModel,
        props: { name },
    })
}

const router = new VueRouter({ routes })

export default router
