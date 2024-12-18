<template>
  <div id="app">
    <huawei-map api-key="" :location.sync="location" :mode="['simple', 'search-manual']" @location="change" />
  </div>
</template>
<script>
export default {
  name: "App",
  data() {
    return {
      location: {
        lat: 39.90918789503468,
        lng: 116.3974501246199,
      },
    };
  },
  methods: {
    change(location) {
      console.log(location);
    },
  },
};
</script>
<style>
#app {
  height: 100vh;
  width: 100vw;
}
</style>
