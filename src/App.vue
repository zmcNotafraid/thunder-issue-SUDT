<template>
  <a-layout id="components-layout-demo-responsive">
    <a-layout-sider
      breakpoint="lg"
      collapsed-width="0"
    >
      <div class="logo">
        <span>
          <ThunderboltOutlined />
          Thunder Issue SUDT
        </span>
      </div>
      <a-menu mode="inline" v-model:selectedKeys="selectedKeys">
        <a-menu-item key="1">
          <home-outlined />
          <span class="nav-text">
            <router-link to="/"> Wallet Auth </router-link>
          </span>
        </a-menu-item>
        <a-menu-item key="2">
          <home-outlined />
          <span class="nav-text">
            <router-link to="/issue">Issue Token</router-link>
          </span>
        </a-menu-item>
        <a-menu-item key="3">
          <home-outlined />
          <span class="nav-text">
            <router-link to="/transfer">Transfer Token</router-link>
          </span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header :style="{ background: '#fff', padding: 0 }" />
      <a-layout-content :style="{ margin: '24px 16px 0' }">
        <div :style="{ padding: '24px', background: '#fff', height: '100%' }">
          <router-view></router-view>
        </div>
      </a-layout-content>
      <a-layout-footer style="textalign: center">
        Thunder Issue SUDT ©2020 Created by Nervos
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<script lang="ts">
import 'ant-design-vue/dist/antd.css'
import { Options, Vue } from "vue-class-component"
import { HomeOutlined, ThunderboltOutlined } from "@ant-design/icons-vue"

@Options({
  components: {
    HomeOutlined,
    ThunderboltOutlined
  }
})
export default class App extends Vue {
  data() {
    return {
      selectedKeys: ["1"]
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
