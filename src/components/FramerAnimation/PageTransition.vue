<template>
  <transition
    name="page-transition"
    mode="out-in"
    appear
    @enter="onEnter"
    @leave="onLeave"
  >
    <div :key="$route.path" class="page-transition">
      <slot />
    </div>
  </transition>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { applyRouteSeo, clearRouteSeo } from '../../seo/routeSeo.js'

const route = useRoute()

const onEnter = (el) => {
  // Page-level SEO tags for the page that is entering (see src/seo).
  applyRouteSeo(route.path)
}

const onLeave = (el) => {
  clearRouteSeo()
}
</script>

<style scoped>
.page-transition {
  width: 100%;
  min-height: 100vh;
}

/* Page Transition Animations */
.page-transition-enter-active,
.page-transition-leave-active {
  transition: all 0.4s cubic-bezier(0.25, 0.1, 0.25, 1);
}

.page-transition-enter-from {
  opacity: 0;
  transform: translateY(30px) scale(0.98);
}

.page-transition-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(0.98);
}

.page-transition-enter-to,
.page-transition-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
</style> 