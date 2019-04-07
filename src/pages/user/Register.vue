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
          Register to {{ title }}
        </v-card-title>

        <v-card-text>
          <form
            novalidate
            class="login-screen"
            @submit.prevent="submit">

            <v-text-field
              v-validate="'name'"
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
              ref="password"
              v-model="rawPassword"
              :append-icon="passwordHidden ? 'visibility' : 'visibility_off'"
              :append-icon-cb="() => (passwordHidden = !passwordHidden)"
              :type="passwordHidden ? 'password' : 'text'"
              :error-messages="errors.collect('password')"
              hint="At least 6 characters"
              counter
              label="Password"
              data-vv-name="password"
              data-vv-delay="300"/>

            <v-text-field
              v-validate="'required|confirmed:password'"
              ref="password_confirmation"
              v-model="rawPasswordConfirm"
              :append-icon="confirmPasswordHidden ? 'visibility' : 'visibility_off'"
              :append-icon-cb="() => (confirmPasswordHidden = !confirmPasswordHidden)"
              :type="confirmPasswordHidden ? 'password' : 'text'"
              :error-messages="errors.collect('password_confirmation')"
              hint="At least 6 characters"
              counter
              label="Confirm Password"
              target="password"
              data-vv-name="password_confirmation"
              data-vv-delay="300"/>

            <v-btn
              type="submit"
              class="v-accent">
              Register
            </v-btn>

            <div
              v-if="error"
              style="color: red">
              {{ error }}
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
      name: '',
      email: '',
      rawPassword: '',
      passwordHidden: true,
      rawPasswordConfirm: '',
      confirmPasswordHidden: true,
      user: auth.user,
      error: ''
    }
  },
  methods: {
    async submit() {
      let payload = {
        name: this.$data.name,
        email: this.$data.email,
        rawPassword: this.$data.rawPassword,
        rawPasswordConfirm: this.$data.rawPasswordConfirm
      }
      let response = await auth.register(payload)

      if (response.result) {
        console.log('> Register.submit register success', response.result)
        response = await auth.login({
          email: payload.email,
          rawPassword: payload.rawPassword
        })
      }

      if (response.result) {
        console.log('> Register.submit login success', response.result)
        this.$router.push('/')
      } else {
        console.log('> Register.submit fail', response.error)
        this.error = response.error.message
      }
    }
  }
}
</script>
