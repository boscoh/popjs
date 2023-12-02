<template lang="pug">
.w-100.d-flex.flex-column(style="height: 100vh")
    nav-bar(name="")
    .overflow-scroll
      .col-lg-6.col-md-8.col-sm-12
        .m-5
          .pt-3
          .display-1 PopJS
          h3 Interactive Population Models
          p.mt-5
            | There are a family of models across a variety of disciplines
            | that obey similar mathematical equations - that of the population
            | model.
          p This dataviz app provides
            |  an interactive exploration of these models.
          .pt-3
          router-link.mt-3.list-group-item(
            v-for="s in summaries" :to="s.path"
          )
            .card
              .card-body
                h5.card-title {{ s.title }}
                p.card-text(v-if="s.summary")
                  | {{ s.summary }}
</template>

<script>
import NavBar from '../components/NavBar.vue'
import models from '../models'
import _ from 'lodash'

export default {
    data() {
        return { summaries: [] }
    },
    mounted() {
        const keys = ['path', 'title', 'summary']
        this.summaries = _.map(models, (m) => _.pick(m, keys))
    },
    components: { NavBar },
}
</script>
