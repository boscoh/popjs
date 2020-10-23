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
for (let m of models) {
    routes.push({
        path: m.path,
        name: m.name,
        component: PopModel,
        props: { name: m.name },
    })
}

const router = new VueRouter({ routes })

export default router
