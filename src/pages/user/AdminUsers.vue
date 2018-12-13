<template>
  <v-container>
    <v-card>

      <v-toolbar>
        <v-toolbar-title>Administrate Users</v-toolbar-title>
      </v-toolbar>

      <v-card-text>
        <v-list>
          <v-list-tile
            v-for="user of users"
            :key="user.id">

            {{ user.name }} - {{ user.email }}

            <v-btn
              flat
              icon
              @click="deleteUser(user.id)">
              <v-icon>
                delete
              </v-icon>
            </v-btn>

          </v-list-tile>
        </v-list>
      </v-card-text>

    </v-card>
  </v-container>
</template>

<script>
import rpc from '../../modules/rpc'
import config from '../../config'

export default {
  name: 'AdminUser',
  data() {
    return {
      title: config.title,
      users: []
    }
  },
  async mounted() {
    let response = await rpc.rpcRun('adminGetUsers')
    console.log('AdminUsers.mounted', response)
    if (response.result) {
      console.log('> AdminUsers.mounted users', response.result.users)
      this.users = response.result.users
    }
  },
  methods: {
    async deleteUser(userId) {
      let response = await rpc.rpcRun('adminDeleteUser', userId)
      if (response.result) {
        console.log('> AdminUsers.deleteUser remaining', response.result.users)
        this.users = response.result.users
      }
    }
  }
}
</script>
