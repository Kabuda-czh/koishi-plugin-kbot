<!--
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:28:53
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-07-04 10:30:44
 * @FilePath: \KBot-App\plugins\kbot\client\index.vue
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
-->
<script setup lang="ts">
import { View } from '@element-plus/icons-vue'
import { message, messageBox } from '@koishijs/client'
import {
  ElButton,
  ElEmpty,
  ElForm,
  ElTable,
  ElTableColumn,
} from 'element-plus'
import type { Ref } from 'vue'
import { nextTick, onMounted, ref } from 'vue'
import {
  fetchBroadcast,
  fetchCommands,
  fetchGetBots,
  fetchGroupList,
  fetchGroupMemberList,
  fetchMuteGuild,
  fetchSendMessage,
} from './api'
import FuzzySearch from './components/FuzzySearch.vue'
import GroupDialog from './components/GroupDialog.vue'

import type { Group, GroupCommand, GroupList, GuildWatch, UserInfo } from './interface'
import { fetchGuildWatchList } from './api/guild'
import GroupConfig from './components/GroupConfig.vue'

const loading = ref<boolean>(true)

// bots
const botList = ref<UserInfo[]>([])

// GroupList
const defaultGroupList = ref<GroupList[]>([])
const groupList = ref<GroupList[]>([])
const sendGroupListDisable = ref<boolean>(true)

// pagination
const currentPage = ref<number>(1)
const pageSize = ref<number>(10)

// dialog
const dialogVisible = ref<boolean>(false)
const groupId = ref<string | number>('')
const groupName = ref<string>('')
const botId = ref<string | number>('')
const botRole = ref<string>('')

// config dialog
const configDialogVisible = ref<boolean>(false)
const commands = ref<GroupCommand[]>([])

// bot dialog
const botDialogLoading = ref<boolean>(false)
const botDialogVisible = ref<boolean>(false)

function checkGuildInfo(id: number, role: string) {
  groupId.value = id
  botRole.value = role
  dialogVisible.value = true
}

async function getCommands() {
  await fetchCommands().then((res: { [key: string]: GroupCommand }) => {
    commands.value = Object.values(res)
  })
}

async function getGroupList() {
  const groupDatas = await fetchGroupList(botId.value).then(res => res as Promise<Group[]>)
  const watchList = await fetchGuildWatchList().then(res => res as Promise<GuildWatch[]>)

  defaultGroupList.value = []

  if (groupDatas.length === 1 && !groupDatas[0])
    return

  const groupMemberList = await Promise.all(
    groupDatas.map(async group => fetchGroupMemberList(botId.value, group.group_id, true)),
  )

  groupMemberList.flat().forEach((member) => {
    if (member.user_id === +botId.value) {
      const groupInfo = {
        ...groupDatas.find(data => data.group_id === member.group_id),
        role: member.role,
        isWatch: watchList.find(watch => watch.guildId === member.group_id)?.isWatch || false,
      }
      defaultGroupList.value.push(groupInfo)
    }
  })

  defaultGroupList.value = defaultGroupList.value.sort((a, b) => +a.group_id - +b.group_id)

  groupList.value = defaultGroupList.value.slice(0, pageSize.value)
}

function muteGuild(row: GroupList, mute: boolean) {
  messageBox
    .confirm(
      '<p>全体禁言并不会判断机器人是否为管理/群主</p><p>以及当前群是否已经开启全体禁言</p><p>确定要继续吗?</p>',
      '提醒',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        dangerouslyUseHTMLString: true,
      },
    )
    .then(() => {
      fetchMuteGuild(botId.value, row.group_id, ~~mute)
    })
    .catch(() => {
      message.success('已取消操作')
    })
}

function sendGroupMessage() {
  const sendGroupList = defaultGroupList.value.filter(group => group.checked)
  messageBox
    .prompt('请输入要发送的消息', '指定群广播', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputType: 'textarea',
      inputPlaceholder: '请输入要发送的消息',
      inputPattern: /\S/,
      inputErrorMessage: '消息不能为空',
    })
    .then(({ value }) => {
      Promise.all(sendGroupList.map(groupInfo => fetchSendMessage(botId.value, groupInfo.group_id, value)))
    })
    .catch(() => {
      message.success('已取消发送')
    })
}

function groupCheck(val: boolean, index: number) {
  const defaultListIndex = index + (currentPage.value - 1) * pageSize.value
  defaultGroupList.value[defaultListIndex].checked = val
  sendGroupListDisable.value = defaultGroupList.value.filter(group => group.checked).length < 2
}

function broadcast() {
  messageBox
    .prompt('请输入要广播的消息', '广播消息', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputType: 'textarea',
      inputPlaceholder: '请输入要广播的消息',
      inputPattern: /\S/,
      inputErrorMessage: '消息不能为空',
    })
    .then(({ value }) => {
      const channels = groupList.value.map(group => group.group_id)

      fetchBroadcast(botId.value, channels, value)
    })
    .catch(() => {
      message.success('已取消操作')
    })
}

async function changeBot(userId: string | number) {
  botDialogLoading.value = true
  botId.value = userId
  await Promise.all([getGroupList(), getCommands()])
  botDialogLoading.value = false
}

function createManageFunction(dialog: Ref<boolean>) {
  return function (group_id: string | number, group_name: string, bot_role: string) {
    dialog.value = true
    groupId.value = group_id
    groupName.value = group_name
    botRole.value = bot_role
  }
}

const manageGroupConfig = createManageFunction(configDialogVisible)

function selectData(item: { label: string; value: string | number }) {
  loading.value = true
  const filterList = defaultGroupList.value.filter(
    group => group.group_id === +item.value,
  )

  setTimeout(() => {
    groupList.value = filterList
    loading.value = false
  }, 1000)
}

function dataChange(value: string | number) {
  if (!value) {
    loading.value = true
    setTimeout(() => {
      groupList.value = defaultGroupList.value
      loading.value = false
    }, 1000)
  }
}

// const setGuildWatch = (row: GroupList) => {
//   row.isWatch = !row.isWatch
//   fetchSetGuildWatch(row.group_id, row.isWatch).then((res: boolean) => {
//     if (!res) {
//       message.error('操作失败')
//       return
//     }
//     message.success(row.isWatch ? '开启成功' : '关闭成功')
//   })
// }

function paginationClick(val: number) {
  loading.value = true

  currentPage.value = val

  const start = (val - 1) * pageSize.value

  setTimeout(() => {
    groupList.value = defaultGroupList.value.slice(
      start,
      val * pageSize.value,
    )
    loading.value = false
  }, 1000)
}

async function init() {
  await fetchGetBots().then((res) => {
    botList.value = res
    botId.value = res[0]?.userId
  }).then(async () => {
    if (botList.value.length === 0) {
      message.error('当前没有可用的Bot')
      return
    }
    await Promise.all([getGroupList(), getCommands()])
  })
}

// 提高使用体验
onMounted(async () => {
  await nextTick(() => {
    setTimeout(() => {
      init().finally(() => {
        loading.value = false
      })
    }, 1000)
  })
})
</script>

<template>
  <k-layout v-loading="loading" element-loading-text="加载中....">
    <div class="manage__layout">
      <div class="container__header">
        <div>
          <ElButton type="primary" :disabled="sendGroupListDisable" @click="sendGroupMessage">
            向所选群发送消息
          </ElButton>
          <ElButton type="primary" :disabled="groupList.length <= 1" @click="broadcast">
            向所有群广播消息
          </ElButton>
          <ElButton v-show="botList.length > 1" type="primary" @click="botDialogVisible = true">
            切换 Bot
          </ElButton>
        </div>
        <div style="display: flex; align-items: center; gap: 15px">
          <p>搜索群</p>
          <FuzzySearch
            :options="defaultGroupList" label-key="group_name" value-key="group_id" @select-data="selectData"
            @data-change="dataChange"
          />
        </div>
      </div>
      <ElForm>
        <ElTable :data="groupList" max-height="70vh" style="width: 95vw">
          <ElTableColumn align="center" label="选择" width="80">
            <template #default="{ row, $index }">
              <ElCheckbox v-model="row.checked" @change="groupCheck(row.checked, $index)" />
            </template>
          </ElTableColumn>
          <ElTableColumn align="center" prop="group_id" label="群号" />
          <ElTableColumn align="center" prop="group_name" label="群名称" />
          <ElTableColumn align="center" label="是否开启全员禁言">
            <template #default="{ row }">
              <ElButton type="primary" :disabled="!['owner', 'admin'].includes(row.role)" @click="muteGuild(row, true)">
                开启
              </ElButton>
              <ElButton type="primary" :disabled="!['owner', 'admin'].includes(row.role)" @click="muteGuild(row, false)">
                关闭
              </ElButton>
            </template>
          </ElTableColumn>
          <ElTableColumn align="center" label="查看群内人员">
            <template #default="{ row }">
              <ElButton :icon="View" size="large" circle @click="checkGuildInfo(row.group_id, row.role)" />
            </template>
          </ElTableColumn>
          <ElTableColumn align="center" label="操作">
            <template #default="{ row }">
              <ElButton type="primary" @click="manageGroupConfig(row.group_id, row.group_name, row.role)">
                群管理操作
              </ElButton>
            </template>
          </ElTableColumn>
          <template #empty>
            <ElEmpty />
          </template>
        </ElTable>

        <div class="data__pagination">
          <ElPagination
            background :page-sizes="[10]" layout="prev, pager, next" :total="defaultGroupList.length"
            :current-page="currentPage" :page-size="pageSize" @current-change="paginationClick"
          />
        </div>
      </ElForm>
    </div>
  </k-layout>

  <GroupDialog
    :visible="dialogVisible" :group-id="groupId" :bot-id="botId" :bot-role="botRole" @closed="
      dialogVisible = false;
      groupId = 0;
    "
  />

  <GroupConfig
    :visible="configDialogVisible"
    :group-id="groupId"
    :group-name="groupName"
    :bot-id="botId"
    :bot-role="botRole"
    :commands="commands"
    @closed="
      configDialogVisible = false;
      groupId = 0;
      groupName = '';
    "
  />

  <ElDialog
    v-model="botDialogVisible" width="30%" title="bot 切换管理" destroy-on-close
    @closed="botDialogVisible = false"
  >
    <div v-loading="botDialogLoading" class="dialogContainer">
      <ElTable :data="botList" border style="width: 100%">
        <ElTableColumn align="center" prop="nickname" label="名称" />
        <ElTableColumn align="center" prop="userId" label="qq号" />
        <ElTableColumn align="center" label="头像">
          <template #default="{ row }">
            <img :src="row.avatar" style="width: 30px; height: 30px; border-radius: 50%">
          </template>
        </ElTableColumn>
        <ElTableColumn align="center" label="操作" width="120">
          <template #default="{ row }">
            <ElButton type="primary" :disabled="botId === row.userId" @click="changeBot(row.userId)">
              切换
            </ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
  </ElDialog>
</template>

<style scoped>
.manage__layout {
  margin: 24px;
}

.container__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 20px;
}

.data__pagination {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 5px;
  padding-top: 20px;
}
</style>

<style>
.el-table__cell {
  font-weight: 500;
  text-align: center !important;
  padding: 12px 0 !important;
}

.table-header-cell {
  background-color: #eef6ff !important;
}

.el-col {
  padding: 0 20px;
}

.el-form-item__label {
  width: 150px;
  font-weight: 500;
  font-size: 14px !important;
  line-height: 37px !important;
}

.el-input {
  max-width: 360px !important;
}

.el-select .el-input {
  max-width: 360px !important;
}

.el-select-dropdown__item {
  font-size: 14px !important;
}

.el-input__inner {
  font-size: 14px !important;
  padding: 15px 0 !important;
  text-align: left !important;
}

.el-form-item {
  margin-bottom: 12px !important;
}

.is-disabled .el-input__inner {
  color: #606266 !important;
  -webkit-text-fill-color: #606266 !important;
}

.el-textarea__inner {
  font-size: 14px !important;
  padding: 10px 15px !important;
}

.is-disabled .el-textarea__inner {
  color: #606266 !important;
}

.el-range-editor.el-input__wrapper {
  padding: 20px 10px !important;
}

.el-date-editor .el-input__wrapper,
.el-range-editor.el-input__wrapper {
  padding: 1px 11px !important;
}

.el-tree-node .el-tree-node__label {
  width: 100% !important;
}
</style>
