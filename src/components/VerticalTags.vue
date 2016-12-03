<template>
  <div class="vtags">
    <Tag v-for="(item,index) in tags"
         :class="['tag'+item.order]"
         :text="item.text"
         :color="color"
         :direct="direct"
         :style="style(item)">
    </Tag>
  </div>
</template>
<style>

</style>
<script>
  //  var tag = {
  //    order:1
  //    posy: 0,
  //    text: 'haha'
  //  };

  import Tag from './Tag.vue'
  export default{
    props: {
      direct: {
        default: 'lr'
      }, // lr , rl
      tags: {
        default: []
      }
    },
    computed: {
      color(){
        return {
          'lr': 'green',
          'rl': 'red'
        }[this.direct];
      }
    },
    methods: {
      style(tag){
        var style = {position: 'absolute'};
        style['top'] = tag.posy - 12 + 'px';
        style[{lr: 'right', rl: 'left'}[this.direct]] = '0';
        return style;
      }
    },
    components: {
      Tag
    }
  }
</script>
