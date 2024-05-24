<!--
 * @Author: Kabuda-czh
 * @Date: 2023-01-31 16:17:01
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-06-29 10:18:16
 * @FilePath: \KBot-App\plugins\kbot\client\components\GroupDialog.vue
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
-->
<script setup lang="ts">
import { View } from '@element-plus/icons-vue'
import type { Column } from 'element-plus'
import { ElAutoResizer, ElButton, ElImage, ElTableV2 } from 'element-plus'
import { computed, h, reactive, ref } from 'vue'
import { fetchGuildMemberList } from '../api'
import type { UserInfo } from '../interface'
import GroupMemberDialog from './GroupMemberDialog.vue'
import FuzzySearch from './FuzzySearch.vue'

interface Props {
  visible?: boolean
  groupId?: string | number
  botId?: string | number
  botRole?: string
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  groupId: 0,
  botId: 0,
  botRole: 'member',
})

const emits = defineEmits(['closed'])
const dialogVisible = computed({
  get() {
    return props.visible
  },
  set(val) {
    emits('closed', val)
  },
})
const dialogLoading = ref<boolean>(false)

const memberDialogVisible = ref<boolean>(false)
const memberId = ref<string>('')

const defaultMemberList = ref<UserInfo[]>([])
const memberList = ref<UserInfo[]>([])
const columns = reactive<Column<any>[]>([
  {
    key: 'userId',
    dataKey: 'userId',
    title: 'QQ号',
    width: 150,
    align: 'center',
  },
  {
    key: 'username',
    dataKey: 'username',
    title: 'QQ名称',
    width: 350,
    align: 'center',
  },
  {
    key: 'avatar',
    dataKey: 'avatar',
    title: '头像',
    width: 100,
    align: 'center',
    cellRenderer: ({ cellData: avatar }) => {
      return h(ElImage, {
        src: avatar,
        fit: 'cover',
        style: {
          width: '30px',
          height: '30px',
          borderRadius: '50%',
        },
      })
    },
  },
  {
    key: 'operation',
    title: '查看群员详细信息',
    width: 350,
    align: 'center',
    cellRenderer: ({ rowData: { userId } }) => {
      return h(
        ElButton,
        {
          circle: true,
          size: 'large',
          icon: View,
          onClick: () => {
            memberId.value = userId
            memberDialogVisible.value = true
          },
        },
      )
    },
  },
])

async function getMemberList() {
  if (props.groupId) {
    dialogLoading.value = true

    defaultMemberList.value = memberList.value = await fetchGuildMemberList(props.botId, props.groupId).finally(() => {
      setTimeout(() => (dialogLoading.value = false), 500)
    })
  }
}

function selectData(item: { label: string; value: string | number }) {
  dialogLoading.value = true
  const filterList = defaultMemberList.value.filter(
    member => +member.userId === +item.value,
  )

  setTimeout(() => {
    memberList.value = filterList
    dialogLoading.value = false
  }, 1000)
}

function dataChange(value: string | number) {
  if (!value) {
    dialogLoading.value = true
    setTimeout(() => {
      memberList.value = defaultMemberList.value
      dialogLoading.value = false
    }, 1000)
  }
}
</script>

<template>
  <ElDialog
    v-model="dialogVisible" width="50%" title="群成员列表" destroy-on-close @open="getMemberList"
    @closed="dialogVisible = false"
  >
    <div v-loading="dialogLoading" class="dialogContainer">
      <div class="memberSearch">
        <FuzzySearch
          :options="defaultMemberList" label-key="username" value-key="userId" @select-data="selectData"
          @data-change="dataChange"
        />
        <p>搜索群成员</p>
      </div>
      <ElAutoResizer>
        <template #default="{ width, height }">
          <ElTableV2 :data="memberList" :columns="columns" :height="600" :width="width" :max-height="height - 80" />
        </template>
      </ElAutoResizer>
    </div>
  </ElDialog>

  <GroupMemberDialog
    :group-id="props.groupId" :visible="memberDialogVisible" :bot-id="props.botId"
    :bot-role="props.botRole" :member-id="memberId" @closed="memberDialogVisible = false"
  />
</template>

<style scoped>
.dialogContainer {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 60vh;
}

.memberSearch {
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  gap: 15px;
}
</style>
