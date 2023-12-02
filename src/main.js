import { createApp } from 'vue'
import App from './App.vue'
import * as VueRouter from 'vue-router'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap'
import models from './models'
import HomeView from './views/HomeView.vue'
import PopModelView from './views/PopModelView.vue'

let routes = [{ path: '/', component: HomeView }]
for (let model of models) {
    routes.push({
        path: model.path,
        name: model.name,
        component: PopModelView,
        props: { name: model.name },
    })
}
const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes,
})

const app = createApp(App)

app.use(router)

app.mount('#app')
