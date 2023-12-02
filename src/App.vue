<template lang="pug">
router-view(:key="$route.fullPath")
</template>

<script setup>
document.title = 'PopJS'
</script>

<style>
html,
body {
    overflow: hidden;
}
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
}
</style>
