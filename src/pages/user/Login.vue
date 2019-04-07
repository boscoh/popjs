<template>
  <v-container style="padding-top: 6em">
    <v-flex
      xs8 
      offset-xs2
      md4
      offset-md4
      lg4
      offset-lg4>
      <v-card>

        <v-card-title
          primary-title
          class="headline">
          Login to {{ title }}
        </v-card-title>

        <v-card-text>
          <form
            novalidate
            @submit.prevent="submit">

            <v-text-field
              v-validate="'email'"
              v-model="user.email"
              :error-messages="errors.collect('email')"
              label="E-mail address"
              data-vv-name="email"/>

            <v-text-field
              v-validate="'required|min:6'"
              v-model="rawPassword"
              :append-icon="passwordHidden ? 'visibility' : 'visibility_off'"
              :append-icon-cb="() => (passwordHidden = !passwordHidden)"
              :type="passwordHidden ? 'password' : 'text'"
              :error-messages="errors.collect('rawPassword')"
              hint="At least 6 characters"
              counter
              label="Password"
              data-vv-name="rawPassword"/>

            <p style="margin-bottom: 2em">
              <router-link to="/forgot-password">Forgot</router-link>
              your password?
            </p>

            <v-btn
              type="submit"
              class="v-accent">
              Login
            </v-btn>

            <div
              v-if="error"
              style="color: red">
              {{ error }}
            </div>

            <div style="margin-top: 2em">
              New to {{ title }}? &nbsp;
              <router-link to="/register">
                Register
              </router-link>
            </div>

          </form>
        </v-card-text>

      </v-card>
    </v-flex>
  </v-container>
</template>

<script>
import auth from '../../modules/auth'
import config from '../../config'

export default {
  data() {
    return {
      title: config.title,
      passwordHidden: true,
      rawPassword: '',
      error: ''
    }
  },
  computed: {
    user: {
      get() {
        return this.$store.state.user
      },
      set(u) {
        this.$store.commit('setUser', u)
      }
    }
  },
  methods: {
    async submit() {
      let payload = {
        email: this.user.email,
        rawPassword: this.rawPassword
      }
      console.log('> Login.submit', payload)
      let response = await auth.login(payload)
      console.log('> Login.submit response', response)

      if (response.result) {
        this.$router.push('/')
      } else {
        this.error = response.error.message
      }
    }
  }
}
</script>
