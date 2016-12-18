import Vue from 'vue'
import App from './AbstrackApp.vue'
import MuseUI from 'muse-ui'
import 'muse-ui/dist/muse-ui.css'
import 'assets/icon.css'
import 'assets/common.css'
// import 'assets/material-icon.woff2'
/* eslint-disable no-new  */

import Transcanvas from './components/Transcanvas.js'

// import './tcp.js'

window.eventHub = new Vue();

Vue.use(MuseUI);


new Vue({
  el: '#app',
  template: '<App/>',
  components: { App }
});

// new Vue({
//   el: '#app',
//   template: '<Render :level="1"><p>yeah</p></Render>',
//   components: { Render }
// });

// new Vue({
//   el: '#app',
//   render (h) {
//     return (
//       <Transcanvas></Transcanvas>
//     )
//   }
// });

// function populate() {
//   var lineNum = 10;
//   var order = 1;
//   var map = ['lr', 'rl'];
//   var lines = [];
//   for (; order <= lineNum; ++order) {
//     var line = {
//       order: order,
//       begTime: (order - 1) * 0.02,  // second
//       endTime: order * 0.02,  // second
//       lose: false,
//       direct: map[(order - 1) % 2]
//     };
//     lines.push(line);
//   }
//   return lines;
// }

// var lines = populate();

// console.log(lines);

// let testTransCanvas = new Vue({
//   el: '#app',
//   data(){
//     return {
//       nowTime:0
//     }
//   },
//   mounted(){
//     let vm = this;
//     let id = setInterval(function(){
//       vm.nowTime += 5/1000/100;
//       if(vm.nowTime == 1){
//         clearInterval(id);
//       }
//     },5);
//   },
//   render(h) {
//     return (
//       <div style="width:50%;height:2000px;margin:0 auto;border:1px solid">
//         <Transcanvas nowTime={this.nowTime} lines={lines} timeScale={100} secInterScale={3}></Transcanvas>
//       </div>
//     )
//   }
// })
