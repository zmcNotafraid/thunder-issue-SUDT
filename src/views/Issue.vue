<template>
  <component-sudt-form :issue-sudt=true :label-column=4 :wrapper-column=10></component-sudt-form>
</template>

<script lang='ts'>
import { defineComponent } from 'vue'
import SudtFormComponent from '../components/SudtForm.vue'

export default defineComponent({
  components: {
    'component-sudt-form': SudtFormComponent
  }
})
</script>
