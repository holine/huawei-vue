import Vue from 'vue'
import App from './App.vue'
import huawei from '../packages'

Vue.config.productionTip = false

Vue.use(huawei)
new Vue({
  render: function (h) { return h(App) },
}).$mount('#app')