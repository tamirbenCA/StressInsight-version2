import homePage from './cmps/homePage.js'
import mathPromo from './cmps/mathPromo.js'
import coinsTask from './cmps/coinsTask.js'
import stickTask from './cmps/stickTask.js'
import thankYou from './cmps/thankYou.js'
import admin from './cmps/admin.js'


const routes = [
    {
        path: '/',
        component: homePage
    },
    {
        path: '/promo',
        component: mathPromo
    },
    {
        path: '/coinstask',
        component: coinsTask
    },
    {
        path: '/sticktask',
        component: stickTask
    },
    {
        path: '/thankyou',
        component: thankYou
    },
    {
        path: '/admin',
        component: admin
    },
    {
        path: '*',
        redirect: '/'
    }
];

export default routes;