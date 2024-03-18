const fs = require('fs')
const path = require('path')
const components = {};
fs.readdirSync(__dirname + '/packages').forEach(item => {
    const path = __dirname + '/packages/' + item;
    if (fs.lstatSync(path).isDirectory()) {
        if (fs.lstatSync(path + '/src/index.vue').isFile()) {
            const component = 'Huawei' + item.split('-').map(item => item.split('').map((value, index) => index ? value.toLowerCase() : value.toUpperCase()).join('')).join('');
            const content = `import component from './src'
component.install = function (Vue) {
    Vue.component(component.name, component)
}
component.name = '${component}'
export default component`;
            fs.writeFileSync(path + '/index.js', content)
            components[item] = component
        }
    }
})
const content = `${Object.keys(components).map(key => 'import ' + components[key] + ' from "./' + key + '"').join('\n')}
const components = [
    ${Object.values(components).join(',\n    ')}
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
export default {
    install,
    ${Object.values(components).join(',\n    ')}
}`;
fs.writeFileSync(__dirname + '/packages/index.js', content)