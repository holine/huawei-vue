import HuaweiMap from "./Map"
const components = [
    HuaweiMap
]
const install = (Vue) => {
    if (install.installed) {
        return
    }
    components.map(component => Vue.component(component.name, component))
}
if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue)
}
export {
    install,
    HuaweiMap
}
export default install