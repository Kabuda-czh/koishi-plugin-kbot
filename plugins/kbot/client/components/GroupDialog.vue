<!--
 * @Author: Kabuda-czh
 * @Date: 2023-01-31 16:17:01
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-14 12:45:02
 * @FilePath: \KBot-App\plugins\kbot\client\components\GroupDialog.vue
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
-->
<script setup lang="ts">
import { View } from '@element-plus/icons-vue'
import { computed, ref } from 'vue'
import { fetchGuildMemberList } from '../api'
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

interface UserInfo {
  userId: string
  username: string
  avatar?: string
  nickname: string
}

const defaultMemberList = ref<UserInfo[]>([])
const memberList = ref<UserInfo[]>([])

const getMemberList = async () => {
  if (props.groupId) {
    dialogLoading.value = true

    defaultMemberList.value = memberList.value = await fetchGuildMemberList(props.groupId).finally(() => {
      setTimeout(() => (dialogLoading.value = false), 500)
    })
  }
}

const memberDialogVisible = ref<boolean>(false)
const memberId = ref<string>('')

const selectData = (item: { label: string; value: string | number }) => {
  dialogLoading.value = true
  const filterList = defaultMemberList.value.filter(
    member => +member.userId === +item.value,
  )

  setTimeout(() => {
    memberList.value = filterList
    dialogLoading.value = false
  }, 1000)
}

const dataChange = (value: string | number) => {
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
  <el-dialog
    v-model="dialogVisible"
    width="50%"
    title="群成员列表"
    destroy-on-close
    @open="getMemberList"
    @closed="dialogVisible = false"
  >
    <div class="memberSearch">
      <p>搜索群成员</p>
      <FuzzySearch
        :options="defaultMemberList"
        label-key="username"
        value-key="userId"
        @select-data="selectData"
        @data-change="dataChange"
      />
    </div>
    <el-table v-loading="dialogLoading" :data="memberList" max-height="70vh">
      <el-table-column align="center" prop="userId" label="QQ号" width="150" />
      <el-table-column align="center" prop="username" label="QQ名称" />
      <el-table-column align="center" label="头像" width="80">
        <template #default="{ row }">
          <el-image
            style="width: 30px; height: 30px; border-radius: 50%"
            :src="row.avatar"
            fit="fill"
          />
        </template>
      </el-table-column>
      <el-table-column align="center" label="查看群员详细信息">
        <template #default="{ row }">
          <el-button
            :icon="View"
            size="large"
            circle
            @click="
              memberDialogVisible = true;
              memberId = row.userId;
            "
          />
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>

  <GroupMemberDialog
    :group-id="props.groupId"
    :visible="memberDialogVisible"
    :bot-id="props.botId"
    :bot-role="props.botRole"
    :member-id="memberId"
    @closed="memberDialogVisible = false"
  />
</template>

<style scoped>
.memberSearch {
  display: flex;
  float: right;
  align-items: center;
  margin-bottom: 10px;
  gap: 15px;
}
</style>
