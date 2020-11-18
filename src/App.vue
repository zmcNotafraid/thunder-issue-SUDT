<template>
  <a-layout id="components-layout-demo-responsive">
    <a-layout-sider
      breakpoint="lg"
      collapsed-width="0"
    >
      <div class="logo">
        <span>
          <ThunderboltFilled style='color: yellow'/>
          Thunder Issue SUDT
        </span>
      </div>
      <hr>
      <a-menu theme="dark" mode="inline" v-model:selectedKeys="selectedKeys">
        <a-menu-item key="1">
          <HomeFilled />
          <span class="nav-text">
            <router-link to="/"> Wallet Auth </router-link>
          </span>
        </a-menu-item>
        <a-menu-item key="2">
          <MoneyCollectFilled />
          <span class="nav-text">
            <router-link to="/issue">Issue Token</router-link>
          </span>
        </a-menu-item>
        <a-menu-item key="3">
          <InteractionFilled />
          <span class="nav-text">
            <router-link to="/transfer">Transfer Token</router-link>
          </span>
        </a-menu-item>
        <a-menu-item key="4">
          <FireFilled />
          <span class="nav-text">
            <router-link to="/burn">Burn Token</router-link>
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
import { HomeFilled, ThunderboltFilled, InteractionFilled, FireFilled, MoneyCollectFilled } from "@ant-design/icons-vue"

@Options({
  components: {
    HomeFilled,
    ThunderboltFilled,
    InteractionFilled,
    FireFilled,
    MoneyCollectFilled
  }
})
export default class App extends Vue {
  data() {
    return {
      selectedKeys: ["4"]
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
  margin: 16px;
  color: white;
}
.nav-text > a {
  color: white
}
</style>
