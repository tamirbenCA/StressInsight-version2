'use strict'

import myRoutes from './routes.js';
import headerBar from './cmps/header.js'

Vue.use(VueRouter);
const myRouter = new VueRouter({routes : myRoutes})


new Vue({
    template: `
        <section>
            <header-bar />
            <router-view></router-view>
        </section>
    `,
    router: myRouter,
    components: {headerBar}
}).$mount('#app')