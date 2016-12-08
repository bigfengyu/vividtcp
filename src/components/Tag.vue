<style>
.tag-lr a {
  display: inline-block;
  height: 24px;
  line-height: 23px;
  position: relative;
  margin: 0 12px 8px 0;
  padding: 0 12px 0 10px;
  background: #777;
  -moz-border-radius-bottomleft: 5px;
  -webkit-border-bottom-left-radius: 5px;
  border-bottom-left-radius: 5px;
  -moz-border-radius-topleft: 5px;
  -webkit-border-top-left-radius: 5px;
  border-top-left-radius: 5px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  color: #fff;
  font-size: 12px;
  font-family: "Lucida Grande", "Lucida Sans Unicode", Verdana, sans-serif;
  text-decoration: none;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  font-weight: bold;
}

.tag-lr a:before {
  content: "";
  position: absolute;
  top: 10px;
  right: 1px;
  float: left;
  width: 5px;
  height: 5px;
  -moz-border-radius: 50%;
  -webkit-border-radius: 50%;
  border-radius: 50%;
  background: #fff;
  -moz-box-shadow: -1px -1px 2px rgba(0, 0, 0, 0.4);
  -webkit-box-shadow: -1px -1px 2px rgba(0, 0, 0, 0.4);
  box-shadow: -1px -1px 2px rgba(0, 0, 0, 0.4);
}

.tag-lr a:after {
  content: "";
  position: absolute;
  top: 0;
  right: -12px;
  width: 0;
  height: 0;
  border-color: transparent transparent transparent #777;
  border-style: solid;
  border-width: 12px 0 12px 12px;
}

.tag-rl a {
  display: inline-block;
  height: 24px;
  line-height: 24px;
  position: relative;
  margin: 0 0 8px 12px;
  padding: 0 10px 0 12px;
  background: #777;
  -webkit-border-bottom-right-radius: 3px;
  border-bottom-right-radius: 3px;
  -webkit-border-top-right-radius: 3px;
  border-top-right-radius: 3px;
  -webkit-box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  color: #fff;
  font-size: 12px;
  font-family: "Lucida Grande", "Lucida Sans Unicode", Verdana, sans-serif;
  text-decoration: none;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  font-weight: bold;
}

.tag-rl a:before {
  content: "";
  position: absolute;
  top: 0;
  left: -12px;
  width: 0;
  height: 0;
  border-color: transparent #777 transparent transparent;
  border-style: solid;
  border-width: 12px 12px 12px 0;
}

.tag-rl a:after {
  content: "";
  position: absolute;
  top: 10px;
  left: 1px;
  float: left;
  width: 5px;
  height: 5px;
  -webkit-border-radius: 50%;
  border-radius: 50%;
  background: #fff;
  -moz-box-shadow: -1px -1px 2px rgba(0, 0, 0, 0.4);
  -webkit-box-shadow: -1px -1px 2px rgba(0, 0, 0, 0.4);
  box-shadow: -1px -1px 2px rgba(0, 0, 0, 0.4);
}

.tag-lr a.green {
  background: #66bb6a;
}

.tag-lr a.green:after {
  border-color: transparent transparent transparent #66bb6a
}

.tag-rl a.green {
  background: #66bb6a;
}

.tag-rl a.green:before {
  border-color: transparent #66bb6a transparent transparent
}

.tag-lr a.red {
  background: #880000;
}

.tag-lr a.red:after {
  border-color: transparent transparent transparent #880000
}

.tag-rl a.red {
  background: #880000;
}

.tag-rl a.red:before {
  border-color: transparent #880000 transparent transparent
}

.tag-lr a.grey {
  background: #777;
}

.tag-lr a.grey:after {
  border-color: transparent transparent transparent #777
}

.tag-rl a.grey {
  background: #777;
}

.tag-rl a.grey:before {
  border-color: transparent #777 transparent transparent
}


/*.tag a:hover {
    background-color: #777;
}

.tag-lr a:hover:after {
    border-color: transparent transparent transparent #777;
}

.tag-rl a:hover:before {
    border-color: transparent #777 transparent transparent;
}*/
</style>

<template>
<div class="tag" :class="tagClass">
  <a :class="[color]">{{text}}</a>
</div>
</template>

<script>
export default {
  props: {
    'text': {
      default: ''
    },
    'direct': {
      type: String,
      default: 'lr'
    },
    'color': {
      required: true
    }
  },
  computed: {
    tagClass: function() {
      var className = 'tag-' + this.direct;
      return className;
    }
  }

}
</script>
