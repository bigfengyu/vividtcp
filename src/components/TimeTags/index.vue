<template>
  <div class="vtags">
    <Tag v-for="(item,index) in lines"
         v-if="isNeedShow(item)"
         :class="['tag'+item.order]"
         :text="text(item)"
         :color="color"
         :direct="direct"
         :style="style(item)">
    </Tag>
  </div>
</template>

<script src="./script.js">