
export default function (fn, delay) {
    let timer = null
    const queue = []
    return {
        run() {
            return new Promise((resolve, reject) => {
                clearTimeout(timer)
                const key = new Date().getTime().toString(36) + Math.random().toString(36) + Math.random().toString(36);
                queue.push(key)
                timer = setTimeout(() => fn.apply(null, arguments).then(function () {
                    const index = queue.indexOf(key)
                    if (index > -1) {
                        if (queue.length === index + 1) {
                            queue.length = 0
                            resolve.apply(null, arguments)
                        } else {
                            queue.splice(index, 1)
                        }
                    }
                }, reject), delay)
            })
        },
        loading() {
            return queue.length > 0
        },
        cancel() {
            clearTimeout(timer)
            queue.length = 0
        }
    }
};