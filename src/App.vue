<template>
  <a-locale-provider :locale="locale">
    <a-layout id="components-layout-demo-responsive">
      <a-layout-sider breakpoint="lg" collapsed-width="0">
        <div class="logo">
          <span>
            <ThunderboltFilled style="color: yellow" />
              {{ $t("title.root")}}
            <a-dropdown>
              <a class="ant-dropdown-link" @click="(e) => e.preventDefault()">
                {{ locale }}<DownOutlined />
              </a>
              <template #overlay>
                <a-menu @click="switchLocale">
                  <a-menu-item key="zh-CN">
                    <a href="javascript:;">简体中文</a>
                  </a-menu-item>
                  <a-menu-item key="en-US">
                    <a href="javascript:;">EN</a>
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </span>
        </div>
        <a-divider />
        <a-menu theme="dark" mode="inline" :selected-keys="[this.$route.path]">
          <a-menu-item key="/">
            <router-link to="/">
              <HomeFilled />
              <span class="nav-text">{{ $t("menu.auth") }}</span>
            </router-link>
          </a-menu-item>
          <a-menu-item key="/issue">
            <router-link to="/issue">
              <MoneyCollectFilled />
              <span class="nav-text">{{ $t("menu.issue") }}</span>
            </router-link>
          </a-menu-item>
          <a-menu-item key="/transfer">
            <router-link to="/transfer">
              <InteractionFilled />
              <span class="nav-text">{{ $t("menu.transfer") }}</span>
            </router-link>
          </a-menu-item>
          <a-menu-item key="/burn">
            <router-link to="/burn">
              <FireFilled />
              <span class="nav-text">{{ $t("menu.burn") }}</span>
            </router-link>
          </a-menu-item>
          <a-menu-item key="/info">
            <router-link to="/info">
              <InfoCircleFilled />
              <span class="nav-text">{{ $t("menu.info") }}</span>
            </router-link>
          </a-menu-item>
        </a-menu>
      </a-layout-sider>
      <a-layout>
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
  </a-locale-provider>
</template>

<script lang="ts">
import 'ant-design-vue/dist/antd.css'
import { defineComponent } from 'vue'
import {
  HomeFilled,
  ThunderboltFilled,
  InteractionFilled,
  FireFilled,
  MoneyCollectFilled,
  InfoCircleFilled,
  DownOutlined
} from '@ant-design/icons-vue'

export default defineComponent({
  components: {
    HomeFilled,
    ThunderboltFilled,
    InteractionFilled,
    FireFilled,
    MoneyCollectFilled,
    InfoCircleFilled,
    DownOutlined
  },
  data() {
    return {
      locale:
          window.localStorage.getItem('locale') === 'zh-CN' ? '简体中文' : 'EN'
    }
  },
  methods: {
    switchLocale: function ({ key }: Record<string, string>) {
      window.localStorage.setItem('locale', key)
      setTimeout(this.$router.go, 1000)
    }
  }
})
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
  color: white;
}
</style>
