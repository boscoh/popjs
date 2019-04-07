<template>
  <v-toolbar
    dense
    light
    color="white"
  >
    <v-avatar
      :tile="true"
      :size="24"
    >
      <img src="static/logo.png">
    </v-avatar>

    <v-toolbar-title
      style="cursor: pointer;"
      @click="home()"
    >
      {{ title }}
    </v-toolbar-title>

    <v-spacer/>

    <v-toolbar-items>
      <v-btn
        v-for="entry in mainEntries"
        :key="entry.path"
        :to="entry.path"
        flat
        router
      >
        {{ entry.title }}
      </v-btn>

      <template v-if="isUser">
        <v-btn
          v-show="user.authenticated"
          flat
          to="/private"
          router
        >
          Private
        </v-btn>

        <v-menu
          v-if="user.authenticated"
          bottom
          left
          flat
          open-on-hover
        >
          <v-btn
            slot="activator"
            flat
          >
            {{ user.name }}
            <v-icon>arrow_drop_down</v-icon>
          </v-btn>
          <v-list>
            <v-list-tile @click="editUser">
              <v-list-tile-title>
                Edit User
              </v-list-tile-title>
            </v-list-tile>

            <v-list-tile @click="logout">
              <v-list-tile-title>
                Logout
              </v-list-tile-title>
            </v-list-tile>
          </v-list>
        </v-menu>

        <v-btn
          v-else
          flat
          to="/login"
        >
          Login
        </v-btn>
      </template>
    </v-toolbar-items>
  </v-toolbar>
</template>

<script>
import auth from '../modules/auth'
import config from '../config'
import router from '../router'

let mainEntries = []
for (let route of router.options.routes) {
  if (route.isNavbar) {
    mainEntries.push({
      path: route.path,
      title: _.capitalize(route.name)
    })
  }
}

export default {
  data() {
    return {
      mainEntries,
      title: config.title,
      isUser: config.isUser
    }
  },
  computed: {
    user: function() {
      return this.$store.state.user
    }
  },
  methods: {
    editUser() {
      this.$router.push('/edit-user')
    },
    home() {
      this.$router.push('/')
    },
    async logout() {
      await auth.logout()
      this.$router.push('/login')
    }
  }
}
</script>
