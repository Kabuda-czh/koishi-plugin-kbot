<!--
 * @Author: Kabuda-czh
 * @Date: 2023-06-28 11:38:10
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-06-29 10:20:59
 * @FilePath: \KBot-App\plugins\kbot\client\components\HistoryDrawer.vue
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
-->
<script setup lang="ts">
import { computed, ref } from 'vue'
import type { GroupNotice } from '../interface'
import { fetchGroupNotice } from '../api'

interface Props {
  visible?: boolean
  title?: string
  botId?: string | number
  groupId?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  title: '群公告列表',
  botId: 0,
  groupId: 0,
})

const emits = defineEmits(['closed'])

const drawerVisible = computed({
  get() {
    return props.visible
  },
  set(val) {
    emits('closed', val)
  },
})
const timelineLoading = ref<boolean>(false)

const historyNotices = ref<GroupNotice[]>([])

async function getHistoryNotice() {
  if (props.groupId && props.botId) {
    timelineLoading.value = true
    fetchGroupNotice(props.botId, props.groupId).then((res: GroupNotice[]) => {
      historyNotices.value = res
    })
      .finally(() => {
        timelineLoading.value = false
      })
  }
}
</script>

<template>
  <meta name="referrer" content="never">
  <ElDrawer v-model="drawerVisible" direction="rtl" size="30%" @open="getHistoryNotice">
    <template #header="{ titleId, titleClass }">
      <span :id="titleId" class="drawer__title" :class="titleClass">
        {{ props.title }}
      </span>
    </template>

    <ElEmpty v-show="historyNotices.length === 0" />

    <ElTimeline v-loading="timelineLoading">
      <ElTimelineItem
        v-for="(notice, index) in historyNotices"
        :key="index"
        center
        color="#4192F4"
        placement="top"
      >
        <ElCard :body-style="{ padding: '0px' }">
          <img v-if="notice.message.images.length > 0" :src="`https://gdynamic.qpic.cn/gdynamic/${notice.message.images[0].id}/0`" class="drawer__image">
          <div class="drawer__info">
            <span>{{ notice.message.text }}</span>
            <div class="drawer__info__bottom">
              <time>发送时间: {{ new Date(notice.publish_time * 1000).toLocaleString() }}</time>
              <span>发送者id: {{ notice.sender_id }}</span>
            </div>
          </div>
        </ElCard>
      </ElTimelineItem>
    </ElTimeline>
  </ElDrawer>
</template>

<style scoped>
.drawer__title {
  font-size: 16px;
  font-weight: bold;
}

.drawer__image {
  width: 100%;
  display: block;
}

.drawer__info {
  padding: 14px;
}

.drawer__info__bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
