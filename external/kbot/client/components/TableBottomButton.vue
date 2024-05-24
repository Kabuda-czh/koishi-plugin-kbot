<!--
 * @Author: Kabuda-czh
 * @Date: 2023-07-04 11:58:28
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-07-04 12:00:28
 * @FilePath: \KBot-App\plugins\kbot\client\components\TableBottomButton.vue
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
-->
<script setup lang="ts">
import { CirclePlus } from '@element-plus/icons-vue'

const emit = defineEmits(['addRow'])

function addRow() {
  emit('addRow')
}
</script>

<template>
  <div class="table-bottom">
    <ElButton
      class="table-bottom-btn"
      style="width: 100%"
      :icon="CirclePlus"
      @click="addRow"
    >
      添加
    </ElButton>
  </div>
</template>

<style scoped>
.table-bottom-btn {
  margin: 14px 0;
  height: 36px;
  border: dashed 1px #bed6ee;
  color: #4192f4;
  font-weight: bold;
}
</style>
