// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.

import 'normalize.css';
import PortalVue from 'portal-vue';
import Toasted from 'vue-toasted';
import Vue from 'vue';
import './index.css';
import App from './App';
import router from './router';
import store from './store';

Vue.config.productionTip = false;
Vue.use(Toasted);
Vue.use(PortalVue);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  components: {
    App,
  },
  template: '<App/>',
});
