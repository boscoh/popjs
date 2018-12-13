<template>
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
</template>

<script>
import auth from '../../modules/auth'
export default {
  name: 'ResetPassword',
  data() {
    let tokenId = this.$route.params.tokenId
    console.log(`> ResetPassword tokenId=${tokenId}`)
    return {
      title: 'Reset Password',
      tokenId,
      rawPassword: '',
      passwordHidden: true,
      rawPasswordConfirm: '',
      confirmPasswordHidden: true,
      error: ''
    }
  },
  methods: {
    async submit() {
      this.error = ''
      let response = await auth.resetPassword(this.tokenId, this.rawPassword)
      if (response.result) {
        this.error = 'Password reset'
      } else {
        console.log('> ResetPassword.submit fail', response)
        this.error = response.error.message
      }
    }
  }
}
</script>
