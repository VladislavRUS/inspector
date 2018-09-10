import Vue from 'vue';
import Router from 'vue-router';
import Upload from '@/components/Upload';
import Viewer from '@/components/Viewer';
import Home from '@/components/Home';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home,
    },
    {
      path: '/upload',
      name: 'Upload',
      component: Upload,
    },
    {
      path: '/viewer',
      name: 'Viewer',
      component: Viewer,
    },
  ],
});
