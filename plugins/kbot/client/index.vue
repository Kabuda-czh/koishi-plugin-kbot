<!--
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:28:53
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-03-10 15:35:09
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
import { nextTick, onMounted, ref } from 'vue'
import {
  fetchBroadcast,
  fetchCommands,
  fetchGroupLeave,
  fetchGroupList,
  fetchGroupMemberList,
  fetchMuteGuild,
  fetchSelf,
  fetchSendMessage,
} from './api'
import GroupDialog from './components/GroupDialog.vue'
import FuzzySearch from './components/FuzzySearch.vue'
import GroupPlugins from './components/GroupPlugins.vue'
import type { Group, GroupCommand, GroupList, UserInfo } from './interface'

const loading = ref<boolean>(true)

// GroupList
const defaultGroupList = ref<GroupList[]>([])
const groupList = ref<GroupList[]>([])

// pagination
const currentPage = ref<number>(1)
const pageSize = ref<number>(10)

// dialog
const dialogVisible = ref<boolean>(false)
const groupId = ref<string | number>('')
const botId = ref<string | number>('')
const botRole = ref<string>('')

// plugin dialog
const commands = ref<GroupCommand[]>([])
const pluginDialogVisible = ref<boolean>(false)

const checkGuildInfo = (id: number, role: string) => {
  groupId.value = id
  botRole.value = role
  dialogVisible.value = true
}

const getBotInfo = async () => {
  const botInfos = await fetchSelf().then(res => res as Promise<UserInfo[]>)

  botId.value = +botInfos?.[0]?.userId ?? ''
}

const getCommands = async () => {
  await fetchCommands().then((res: { [key: string]: GroupCommand }) => {
    commands.value = Object.values(res)
  })
}

const getGroupList = async () => {
  const groupDatas = await fetchGroupList().then(res => res as Promise<Group[]>)

  if (groupDatas.length === 1 && !groupDatas[0])
    return

  const groupMemberList = await Promise.all(
    groupDatas.map(async group => fetchGroupMemberList(group.group_id, true)),
  )

  groupMemberList.flat().forEach((member) => {
    if (member.user_id === +botId.value) {
      const groupInfo = {
        ...groupDatas.find(data => data.group_id === member.group_id),
        role: member.role,
      }
      defaultGroupList.value.push(groupInfo)
    }
  })

  groupList.value = defaultGroupList.value.slice(0, pageSize.value)
}

const muteGuild = (row: GroupList, mute: boolean) => {
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
      fetchMuteGuild(row.group_id, ~~mute)
    })
    .catch(() => {
      message.success('已取消操作')
    })
}

const broadcast = () => {
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

      fetchBroadcast(channels, value)
    })
    .catch(() => {
      message.success('已取消操作')
    })
}

const manageGroupPlugins = (group_id: number) => {
  pluginDialogVisible.value = true
  groupId.value = group_id
}

const selectData = (item: { label: string; value: string | number }) => {
  loading.value = true
  const filterList = defaultGroupList.value.filter(
    group => group.group_id === +item.value,
  )

  setTimeout(() => {
    groupList.value = filterList
    loading.value = false
  }, 1000)
}

const dataChange = (value: string | number) => {
  if (!value) {
    loading.value = true
    setTimeout(() => {
      groupList.value = defaultGroupList.value
      loading.value = false
    }, 1000)
  }
}

const sendMessage = (groupId: number, groupName: string) => {
  messageBox
    .prompt('请输入要发送的消息', `向群 ${groupName}(${groupId}) 发送消息`, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputType: 'textarea',
      inputPlaceholder: '请输入要发送的消息',
      inputPattern: /\S/,
      inputErrorMessage: '消息不能为空',
    })
    .then(({ value }) => {
      fetchSendMessage(groupId, value)
    })
    .catch(() => {
      message.success('已取消发送')
    })
}

const groupLeave = (groupId: number, isOwner: boolean) => {
  messageBox
    .confirm(
      `<strong>确定要${isOwner ? '解散群' : '退群'}吗?</strong>
      <br />
      <strong style="color: red">该操作无法撤回!</strong>
      <br />
      <i style="color: orange">注意: 当前gocq中解散群接口似乎无效</i>
      `,
      '提醒',
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'error',
      },
    )
    .then(() => {
      // TODO 解散群似乎没什么效果
      fetchGroupLeave(groupId, isOwner).then(() => {
        message.success('操作成功')
        groupList.value = defaultGroupList.value.filter(
          group => group.group_id !== groupId,
        ).slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
      })
    })
    .catch(() => {
      message.success('已取消操作')
    })
}

const paginationClick = (val: number) => {
  loading.value = true

  const start = (val - 1) * pageSize.value

  setTimeout(() => {
    groupList.value = defaultGroupList.value.slice(
      start,
      val * pageSize.value,
    )
    loading.value = false
  }, 1000)
}

const init = async () => {
  await Promise.all([getBotInfo(), getGroupList(), getCommands()])
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
          <ElButton type="primary" :disabled="groupList.length <= 1" @click="broadcast">
            向所有群广播消息
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
          <ElTableColumn align="center" prop="group_id" label="群号" width="100" />
          <ElTableColumn align="center" prop="group_name" label="群名称" />
          <ElTableColumn align="center" label="是否开启全员禁言" width="200">
            <template #default="{ row }">
              <ElButton type="primary" :disabled="!['owner', 'admin'].includes(row.role)" @click="muteGuild(row, true)">
                开启
              </ElButton>
              <ElButton type="primary" :disabled="!['owner', 'admin'].includes(row.role)" @click="muteGuild(row, false)">
                关闭
              </ElButton>
            </template>
          </ElTableColumn>
          <ElTableColumn align="center" label="查看群内人员" width="120">
            <template #default="{ row }">
              <ElButton :icon="View" size="large" circle @click="checkGuildInfo(row.group_id, row.role)" />
            </template>
          </ElTableColumn>
          <ElTableColumn align="center" label="操作">
            <template #default="{ row }">
              <ElButton type="primary" @click="manageGroupPlugins(row.group_id)">
                管理群指令
              </ElButton>
              <ElButton @click="sendMessage(row.group_id, row.group_name)">
                发送消息
              </ElButton>
              <ElButton type="danger" @click="groupLeave(row.group_id, row.role === 'owner')">
                {{ row.role === "owner" ? "解散群" : "退出群" }}
              </ElButton>
            </template>
          </ElTableColumn>
          <template #empty>
            <ElEmpty />
          </template>
        </ElTable>

        <div class="data__pagination">
          <el-pagination
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

  <GroupPlugins
    :visible="pluginDialogVisible" :group-id="groupId" :commands="commands" @closed="
      pluginDialogVisible = false;
      groupId = 0;
    "
  />
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
  color: #333;
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
  color: #333;
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
