<template lang="pug">
.nav-bar.d-flex.flex-row.border-bottom(ref="nav")

  .d-none.d-md-block.col-4
  .col-sm-12.col-md-8.com-lg-8.ps-5.d-flex
    .flex-column
      router-link.text-decoration-none(to=".")
        h6.bold.text-uppercase.mt-3.mb-1.text-dark.text-truncate PopJS - Population Models
      .dropdown
        button.btn.btn-sm.btn-outline-secondary.dropdown-toggle(
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
    --nav-bar-height: 80px;
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
