<template>
<a-layout id="components-layout-demo-responsive">
    <a-layout-sider
      breakpoint="lg"
      collapsed-width="0"
      @collapse="onCollapse"
      @breakpoint="onBreakpoint"
    >
      <div class="logo">
        <span>
        <ThunderboltOutlined />
        Thunder Issue SUDT
        </span>
      </div>
      <a-menu theme="dark" mode="inline" v-model:selectedKeys="selectedKeys">
        <a-menu-item key="1">
          <home-outlined />
          <span class="nav-text">Wallet Info</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header :style="{ background: '#fff', padding: 0 }" />
      <a-layout-content :style="{ margin: '24px 16px 0'}">
        <div :style="{ padding: '24px', background: '#fff', height: '100%' }">
          <Auth />
        </div>
      </a-layout-content>
      <a-layout-footer style="textAlign: center">
        Thunder Issue SUDT ©2020 Created by Nervos
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component"
import Auth from "./components/Auth.vue"
import {
  HomeOutlined,
  ThunderboltOutlined
} from '@ant-design/icons-vue'

@Options({
  components: {
    Auth,
    HomeOutlined,
    ThunderboltOutlined
  }
})

export default class App extends Vue {
  data () {
    return {
      selectedKeys: ['1']
    }
  }
}
</script>

<style>
#app {
  height: 100%;
}
.ant-layout {
  height: 100%;
}
#components-layout-demo-responsive .logo {
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  margin: 16px;
}

</style>
