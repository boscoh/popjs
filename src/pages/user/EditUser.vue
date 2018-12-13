<template>
  <v-container>
    <v-card>

      <v-toolbar>
        <v-toolbar-title>{{ title }}</v-toolbar-title>
      </v-toolbar>

      <v-card-text>
        <form
          novalidate
          class="login-screen"
          @submit.prevent="submit">
          <v-container
            fluid
            grid-list-xl>

            <v-layout
              row
              wrap>
              <v-flex class="xs12">
                <v-text-field
                  v-validate="'required'"
                  v-model="name"
                  :error-messages="errors.collect('name')"
                  label="User name"
                  data-vv-name="name"/>
                <v-text-field
                  v-validate="'email'"
                  v-model="email"
                  :error-messages="errors.collect('email')"
                  label="E-mail address"
                  data-vv-name="email"/>
                <v-text-field
                  v-validate="'required|min:6'"
                  v-model="rawPassword"
                  :append-icon="passwordHidden ? 'visibility' : 'visibility_off'"
                  :append-icon-cb="() => (passwordHidden = !passwordHidden)"
                  :type="passwordHidden ? 'password' : 'text'"
                  :error-messages="errors.collect('Password')"
                  hint="At least 6 characters"
                  counter
                  label="New Password"
                  data-vv-name="Password"/>
                <v-text-field
                  v-validate="'required|confirmed:Password'"
                  v-model="rawConfirmPassword"
                  :append-icon="confirmPasswordHidden ? 'visibility' : 'visibility_off'"
                  :append-icon-cb="() => (confirmPasswordHidden = !confirmPasswordHidden)"
                  :type="confirmPasswordHidden ? 'password' : 'text'"
                  :error-messages="errors.collect('Confirm_Password')"
                  hint="At least 6 characters"
                  counter
                  label="Confirm New Password"
                  data-vv-name="Confirm_Password"/>
              </v-flex>
            </v-layout>

            <v-btn
              type="submit"
              class="v-accent">Save</v-btn>

            <div
              v-if="error"
              style="color: red">
              {{ error }}
            </div>

          </v-container>
        </form>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script>
import auth from '../../modules/auth'
import _ from 'lodash'

export default {
  name: 'EditUser',
  data() {
    let result = {}
    _.assign(result, this.$store.state.user)
    _.assign(result, {
      title: 'Edit Your Details',
      rawPassword: '',
      passwordHidden: true,
      rawConfirmPassword: '',
      confirmPasswordHidden: true,
      error: ''
    })
    return result
  },
  methods: {
    async submit() {
      this.error = ''

      let payload = {}
      const keys = ['id', 'name', 'email', 'rawPassword', 'rawPasswordConfirm']
      for (let key of keys) {
        if (this.$data[key]) {
          payload[key] = this.$data[key]
        }
      }

      let response = await auth.update(payload)
      if (response.result) {
        this.error = 'User updated'
      } else {
        console.log('> EditUser.submit fail', response)
        this.error = response.error.message
      }
    }
  }
}
</script>
