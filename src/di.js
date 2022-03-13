let container

class Container {

    #providers
    #instances = {}
    /**
     * @param {object} config
     * @param {Array<Provider>} config.providers
     * */
    constructor(config) {
        if (container) {
            return container
        }
        this.#providers = config.providers || []
        this.#registerDependencies()
        container = this
    }

    /** Registers all dependencies and adds Proxy */
    #registerDependencies() {
        const map = {}
        this.#providers.forEach(el => {
            map[el.providerName] = el.useClass
        })
        this.#instances = map
    }

    /**
     * Returning dependency instance by name
     * @param {Array<string>} interfaces
     */
    dependency(interfaces) {
        const res = []
        interfaces.forEach(el => {
            if (this.#instances[el]) {
                const instance = new this.#instances[el]()
                res.push(instance)
            }
        })
        return res
    }

}

/** Getting all params passed to constructor
 * @param {sting} str - the source code of the
 * @returns {Array<string>}
 * */
const getConstructorParams = (str) => str
    ?.replace(/ /g, '')
    ?.match(/(?<=constructor\()(.*?)(?=\s*\))/ig)
    ?.[0]
    ?.split(',')
    ?.map(e => e.trim())
    ?.filter(Boolean) || []

const deps = {}
let counter = 0

function injectable(Class) {
    const C = Class
    return new Proxy(C, {
        construct(target, argArray, newTarget) {

            if (!container) {
                throw new Error('DI container is not created')
            }

            /** List of interfaces required by
             * @type {Array<string>}
             * */
            const str = C.toString()
            const dependenciesArray = getConstructorParams(str)
            const injectesDeps = container?.dependency(dependenciesArray) || [];
            const initialDeps = JSON.stringify(deps)
            deps[target.name] = dependenciesArray
            const finalDeps = JSON.stringify(deps)
            if (initialDeps === finalDeps) ++counter

            if (dependenciesArray.includes(target.name) || counter > 5) {
                throw new Error(`Cyclic dependencies detected`)
            }
            if (dependenciesArray.length !== injectesDeps.length) {
                throw new Error('The dependency in missing!')
            }
            return new target(...injectesDeps, ...argArray)
        }
    })
}

module.exports = {
    Container,
    injectable,
    getConstructorParams
}
