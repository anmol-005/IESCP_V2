import Navbar from "./components/navbar.js"
import router from "./router.js"

new Vue({
  el: '#app',
  router,
  components: {
      Navbar
  },
  template: `
      <div>
          <Navbar></Navbar>
          <router-view></router-view>
      </div>
  `
});
