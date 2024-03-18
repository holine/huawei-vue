import component from './src'
component.install = function (Vue) {
    Vue.component(component.name, component)
}
component.name = 'HuaweiMap'
export default component