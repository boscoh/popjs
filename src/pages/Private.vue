<template>
  <v-container
    style="
        height: calc(100vh - 48px);
        overflow: auto">

    <v-layout
      column
      style="
          width: calc(100vw);
          padding-left: 15px;
          padding-right: 15px;">

      <h2 
        style="width: 100%"
        class="v-display-2">
        Private
      </h2>

      <p>
        This page is only shown if the user has been logged-in.
      </p>

    </v-layout>
  </v-container>
</template>
