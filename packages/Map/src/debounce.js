class Debounce {
    #queue = []
    #timer = null
    #delay = 0
    #fn = null
    constructor(fn, delay) {
        this.fn = fn
        this.delay = delay
        this.timer = null
        this.queue = []
    }

    run(...args) {
        return new Promise((resolve, reject) => {
            clearTimeout(this.timer)
            this.timer = setTimeout(() => {
                const key = Math.random().toString(36) + Math.random().toString(36);
                this.queue.push(key)
                this.fn(...args).then((...data) => {
                    const index = this.queue.indexOf(key)
                    if (index > -1) {
                        if (this.queue.length === index + 1) {
                            this.queue.length = 0
                            resolve(...data)
                        } else {
                            this.queue.splice(index, 1)
                        }
                    }
                }, (...data) => {
                    reject(...data)
                })
            }, this.delay)
        })
    }

    loading() {
        return this.queue.length > 0
    }

    cancel() {
        clearTimeout(this.timer)
        this.queue.length = 0
    }
}
export default Debounce