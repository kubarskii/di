const {Container, injectable, getConstructorParams} = require('./di')

const Test = injectable(class {
    constructor(Http) {
        this.http = Http
        this.http.post()
    }
})

const Http = injectable(class {
    post() {
        console.log('This is called fom Http service')
    }
})

const HttpModule = injectable(class {
    post() {
        console.log('Ths is called from HttpModule service')
    }
})

const WebSocket = injectable(class {
    constructor() {
    }

    send() {
        console.log('This is called from WebSocket service')
    }
})

const Api = injectable(class {
    constructor(Http, WebSocket) {
        this.http = Http
        this.ws = WebSocket
    }

    sendWithWs() {
        this.ws.send()
    }

    post() {
        console.log('The is called from Api service')
        this.http.post()
    }
})

const Order = injectable(class {
    constructor(Api, Test) {
        this.api = Api
        this.test = Test
    }

    makeOrder() {
        this.api.post()
        this.api.sendWithWs()
    }
})

const container = new Container({
    providers: [
        {providerName: 'Test', useClass: Test},
        {providerName: 'Http', useClass: Http},
        {providerName: 'WebSocket', useClass: WebSocket},
        {providerName: 'Order', useClass: Order},
        {providerName: 'Api', useClass: Api},
    ]
})

const order = new Order()
order.makeOrder()
