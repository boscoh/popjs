import Vue from 'vue'
import Router from 'vue-router'

import config from './config.js'

import Home from './pages/Home'

import About from './pages/About'
import Private from './pages/Private'

import Login from './pages/user/Login'
import Register from './pages/user/Register'
import EditUser from './pages/user/EditUser'
import AdminUsers from './pages/user/AdminUsers'
import ForgotPassword from './pages/user/ForgotPassword'
import ResetPassword from './pages/user/ResetPassword'
import EpiModel from './pages/EpiModel'
import EconModel from './pages/EconModel'

Vue.use(Router)
let routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/econ',
    name: 'econ',
    component: EconModel
  },
  {
    path: '/epi',
    name: 'epi',
    component: EpiModel
  },
  {
    path: '/about',
    name: 'about',
    component: About
  }
]

if (config.isUser) {
  routes = routes.concat([
    {
      path: '/private',
      name: 'private',
      component: Private
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/register',
      name: 'register',
      component: Register
    },
    {
      path: '/edit-user',
      name: 'editUser',
      component: EditUser
    },
    {
      path: '/admin-users',
      name: 'adminUsers',
      component: AdminUsers
    },
    {
      path: '/forgot-password',
      name: 'forgotPassword',
      component: ForgotPassword
    },
    {
      path: '/reset-password/:tokenId',
      name: 'resetPassword',
      component: ResetPassword
    }
  ])
}

let router = new Router({ routes })

export default router
