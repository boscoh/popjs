<template>
  <v-container
    style="
      height: calc(100vh - 48px);
      overflow: auto">
    <v-layout>
      <v-flex
        xs10
        offset-xs1
        md1
        offset-md2
        lg6
        offset-lg3
        style="
          padding-top: 3em;
          text-align: left">

        <h1
          class="display-2">
          Private
        </h1>

        <br>
        <div style="padding-top: 2em; text-align: justify">
          This page is only shown if the user has been logged-in.
        </div>

      </v-flex>
    </v-layout>
  </v-container>
</template>
