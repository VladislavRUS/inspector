import Vue from 'vue';
import Router from 'vue-router';
import Upload from '@/components/Upload';
import Viewer from '@/components/Viewer';

Vue.use(Router);

export default new Router({
  routes: [
    {
      path: '/',
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
