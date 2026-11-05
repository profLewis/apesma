<script setup lang="ts">
// APESMA (profLewis): the 🍌 Peach Banana button - back to the house's control panel (its Music page).
import { useSidebar } from "@/components/ui/sidebar";
import { apesmaToPeachBanana } from "@/helpers/apesma";
import { computed } from "vue";

const { state, isMobile, setOpenMobile } = useSidebar();
const isCollapsed = computed(() => state.value === "collapsed");

const go = () => {
  if (isMobile.value) setOpenMobile(false);
  apesmaToPeachBanana();
};
</script>

<template>
  <button
    type="button"
    class="apesma-pb"
    :class="isCollapsed ? 'mx-auto collapsed' : 'w-full'"
    title="Peach Banana - the house's control panel"
    @click="go"
  >
    <span class="ic">🍌</span>
    <span v-if="!isCollapsed" class="tx">Peach Banana</span>
  </button>
</template>

<style scoped>
.apesma-pb {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 40px;
  padding: 6px 10px;
  margin: 2px 0 6px;
  border-radius: 10px;
  border: 1.5px solid #f2c94c;
  background: rgba(242, 201, 76, 0.14);
  color: inherit;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
}
.apesma-pb:hover {
  background: rgba(242, 201, 76, 0.26);
}
.apesma-pb.collapsed {
  width: 40px;
  justify-content: center;
  padding: 6px 0;
}
.apesma-pb .ic {
  font-size: 18px;
  line-height: 1;
}
</style>
