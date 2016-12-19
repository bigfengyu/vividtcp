<style scoped>
.grids {
  width: 100%;
}

.text {
  display: table-cell;
  vertical-align: middle;
  cursor: default;
  color: #777;
}

.grid {
  display: table;
  width: 27px;
  height: 27px;
  float: left;
  margin-right: 2px;
  margin-bottom: 4px;
  border-radius: 4px;
  text-align: center;
  /*border: 0.5px dotted #777;*/
}

.grid:hover {
  border: 0.5px solid #777;
}

.green {
  /*发送，在窗口外 并接收到回执*/
  /* Permalink - use to edit and share this gradient: http://colorzilla.com/gradient-editor/#f8ffe8+0,e3f5ab+33,b7df2d+100;Green+3D+%234 */
  background: #f8ffe8;
  /* Old browsers */
  background: -moz-linear-gradient(top, #f8ffe8 0%, #e3f5ab 33%, #b7df2d 100%);
  /* FF3.6-15 */
  background: -webkit-linear-gradient(top, #f8ffe8 0%, #e3f5ab 33%, #b7df2d 100%);
  /* Chrome10-25,Safari5.1-6 */
  background: linear-gradient(to bottom, #f8ffe8 0%, #e3f5ab 33%, #b7df2d 100%);
  /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
  filter: progid: DXImageTransform.Microsoft.gradient( startColorstr='#f8ffe8', endColorstr='#b7df2d', GradientType=0);
  /* IE6-9 */
}

.yellow {
  /*发送，在窗口内*/
  /* Permalink - use to edit and share this gradient: http://colorzilla.com/gradient-editor/#fceabb+0,fccd4d+50,f8b500+51,fbdf93+100;Orange+3D+%235 */
  background: #fceabb;
  /* Old browsers */
  background: -moz-linear-gradient(top, #fceabb 0%, #fccd4d 50%, #f8b500 51%, #fbdf93 100%);
  /* FF3.6-15 */
  background: -webkit-linear-gradient(top, #fceabb 0%, #fccd4d 50%, #f8b500 51%, #fbdf93 100%);
  /* Chrome10-25,Safari5.1-6 */
  background: linear-gradient(to bottom, #fceabb 0%, #fccd4d 50%, #f8b500 51%, #fbdf93 100%);
  /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
  filter: progid: DXImageTransform.Microsoft.gradient( startColorstr='#fceabb', endColorstr='#fbdf93', GradientType=0);
  /* IE6-9 */
}

.canary {
  /* Permalink - use to edit and share this gradient: http://colorzilla.com/gradient-editor/#e5e696+0,d1d360+100;Wax+3D */
  background: #e5e696;
  /* Old browsers */
  background: -moz-linear-gradient(top, #e5e696 0%, #d1d360 100%);
  /* FF3.6-15 */
  background: -webkit-linear-gradient(top, #e5e696 0%, #d1d360 100%);
  /* Chrome10-25,Safari5.1-6 */
  background: linear-gradient(to bottom, #e5e696 0%, #d1d360 100%);
  /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
  filter: progid: DXImageTransform.Microsoft.gradient( startColorstr='#e5e696', endColorstr='#d1d360', GradientType=0);
  /* IE6-9 */
}

.blue {
  /*等待的下一个*/
  /* Permalink - use to edit and share this gradient: http://colorzilla.com/gradient-editor/#e0f3fa+0,d8f0fc+50,b8e2f6+51,b6dffd+100;Shape+2+Style */
  background: #e0f3fa;
  /* Old browsers */
  background: -moz-linear-gradient(top, #e0f3fa 0%, #d8f0fc 50%, #b8e2f6 51%, #b6dffd 100%);
  /* FF3.6-15 */
  background: -webkit-linear-gradient(top, #e0f3fa 0%, #d8f0fc 50%, #b8e2f6 51%, #b6dffd 100%);
  /* Chrome10-25,Safari5.1-6 */
  background: linear-gradient(to bottom, #e0f3fa 0%, #d8f0fc 50%, #b8e2f6 51%, #b6dffd 100%);
  /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
  filter: progid: DXImageTransform.Microsoft.gradient( startColorstr='#e0f3fa', endColorstr='#b6dffd', GradientType=0);
  /* IE6-9 */
}

.grey {
  /*未定义的*/
  /* Permalink - use to edit and share this gradient: http://colorzilla.com/gradient-editor/#fcfff4+0,dfe5d7+40,b3bead+100;Wax+3D+%233 */
  background: #fcfff4;
  /* Old browsers */
  background: -moz-linear-gradient(top, #fcfff4 0%, #dfe5d7 40%, #b3bead 100%);
  /* FF3.6-15 */
  background: -webkit-linear-gradient(top, #fcfff4 0%, #dfe5d7 40%, #b3bead 100%);
  /* Chrome10-25,Safari5.1-6 */
  background: linear-gradient(to bottom, #fcfff4 0%, #dfe5d7 40%, #b3bead 100%);
  /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
  filter: progid: DXImageTransform.Microsoft.gradient( startColorstr='#fcfff4', endColorstr='#b3bead', GradientType=0);
  /* IE6-9 */
}
</style>

<template>
<div class="message-window clearfix">
  <div v-for="(val,index) in grids" :class="['grid',val.color]">
    <div class="text noselect">
      {{val.num}}
    </div>
  </div>
</div>
</template>

<script>
export default {
  props: {
    grids: {
      default () {
        return [{
          num: 1,
          color: 'yellow'
        }]
      }
    }
  },
  // created(){
  //   let colors = ['green','yellow','blue','grey'];
  //   for(let i = 0;i < 200;++i){
  //     let color;
  //     if(i < 100){
  //       color = 'green';
  //     }else if(i >= 100 && i < 107){
  //       color = 'yellow';
  //     }else if(i >= 107 && i < 111){
  //       color = 'blue';
  //     }else{
  //       color = 'grey';
  //     }
  //     this.messages.push(color);
  //   }
  // }
}
</script>
