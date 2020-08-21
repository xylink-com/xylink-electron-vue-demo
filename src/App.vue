<template>
  <div id="app">
    <h1>hello world</h1>
  </div>
</template>

<script>
// import HelloWorld from './components/HelloWorld.vue'
import { BrowserWindow } from "electron";
import path from "path";

export default {
  name: "App",
  components: {},
  created() {
    console.log("app: ", BrowserWindow);
    console.log("path: ", path);
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
