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
      <a-divider />
      <a-menu theme="dark" mode="inline" :selected-keys="[this.$route.path]">
        <a-menu-item key="/">
          <router-link to="/">
            <HomeFilled />
            <span class="nav-text">
              Wallet Auth
            </span>
          </router-link>
        </a-menu-item>
        <a-menu-item key="/issue">
          <router-link to="/issue">
            <MoneyCollectFilled />
            <span class="nav-text">
              Issue Token
            </span>
          </router-link>
        </a-menu-item>
        <a-menu-item key="/transfer">
          <router-link to="/transfer">
            <InteractionFilled />
            <span class="nav-text">
              Transfer Token
            </span>
          </router-link>
        </a-menu-item>
        <a-menu-item key="/burn">
          <router-link to="/burn">
            <FireFilled />
            <span class="nav-text">
              Burn Token
            </span>
          </router-link>
        </a-menu-item>
        <a-menu-item key="/info">
          <router-link to="/info">
            <InfoCircleFilled />
            <span class="nav-text">
              Token Info
            </span>
          </router-link>
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
import { HomeFilled, ThunderboltFilled, InteractionFilled, FireFilled, MoneyCollectFilled, InfoCircleFilled } from "@ant-design/icons-vue"

@Options({
  components: {
    HomeFilled,
    ThunderboltFilled,
    InteractionFilled,
    FireFilled,
    MoneyCollectFilled,
    InfoCircleFilled
  }
})
export default class App extends Vue {
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
