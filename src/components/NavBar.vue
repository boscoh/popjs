<template lang="pug">
.nav-bar.d-flex.flex-column.ps-5.border-bottom(ref="nav")

  router-link.text-decoration-none(to=".")
    h3.mt-3.text-dark.text-truncate PopJS - Interactive Population Models

  .dropdown
    button.btn.btn-sm.btn-secondary.dropdown-toggle(
      type="button" data-bs-toggle="dropdown" aria-expanded="false"
    )
      template(v-if="title")
        | {{ title }}
      template(v-else)
        | - choose model -
    ul.dropdown-menu
      li
        router-link.dropdown-item(v-for="menu in menus" :to="menu.path")
          |  {{ menu.title }}
</template>

<style>
:root {
    --nav-bar-height: 100px;
}
.nav-bar {
    height: var(--nav-bar-height);
    background: white no-repeat right;
}
</style>

<script>
import models from '../models'
import _ from 'lodash'

export default {
    props: ['name'],
    data() {
        return { menus: [], title: '' }
    },
    mounted() {
        this.menus = _.map(models, (m) => _.pick(m, ['title', 'path', 'name']))
        let menu = _.find(this.menus, { name: this.name })
        if (menu) {
            this.title = menu.title
        }
    },
}
</script>
