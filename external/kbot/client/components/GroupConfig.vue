<!--
 * @Author: Kabuda-czh
 * @Date: 2023-01-31 16:17:01
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-07-18 15:42:12
 * @FilePath: \KBot-App\plugins\kbot\client\components\GroupConfig.vue
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
-->
<script setup lang="ts">
import type { Ref } from 'vue'
import { computed, ref } from 'vue'
import { message, messageBox } from '@koishijs/client'
import type { GroupCommand } from '../interface'
import { fetchGroupLeave, fetchSendMessage } from '../api'
import GroupPlugins from './GroupPlugins.vue'
import GroupNotice from './GroupNotice.vue'
import GroupPortrait from './GroupPortrait.vue'
import GroupViolation from './GroupViolation.vue'
import GroupAddValid from './GroupAddValid.vue'

interface Props {
  visible?: boolean
  botId?: string | number
  botRole?: string
  groupId?: string | number
  groupName?: string
  commands?: GroupCommand[]
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  groupId: 0,
  groupName: '',
  commands: () => [],
  botId: 0,
  botRole: '',
})

const emits = defineEmits(['closed'])

// dialog
const dialogVisible = computed({
  get() {
    return props.visible
  },
  set(val) {
    emits('closed', val)
  },
})

const pluginDialogVisible = ref<boolean>(false)
const noticeDialogVisible = ref<boolean>(false)
const portraitDialogVisible = ref<boolean>(false)
const groupViolationVisible = ref<boolean>(false)
const groupAddValidVisible = ref<boolean>(false)

function createManageFunction(dialog: Ref<boolean>) {
  return function () {
    dialog.value = true
  }
}

const manageGroupNotice = createManageFunction(noticeDialogVisible)
const manageGroupPortrait = createManageFunction(portraitDialogVisible)
const manageGroupPlugins = createManageFunction(pluginDialogVisible)
const manageGroupViolation = createManageFunction(groupViolationVisible)
const manageGroupAddValid = createManageFunction(groupAddValidVisible)

function sendMessage(groupId: string | number, groupName: string) {
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
      fetchSendMessage(props.botId, groupId, value)
    })
    .catch(() => {
      message.success('已取消发送')
    })
}

function groupLeave(groupId: string | number, isOwner: boolean) {
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
      fetchGroupLeave(props.botId, groupId, isOwner).then(() => {
        message.success('操作成功')
        // getGroupList()
        location.reload()
      })
    })
    .catch(() => {
      message.success('已取消操作')
    })
}
</script>

<template>
  <ElDialog
    v-model="dialogVisible" width="70%" title="群管理" destroy-on-close
    @closed="dialogVisible = false"
  >
    <ElForm>
      <ElRow align="middle">
        <ElCol :span="24">
          <ElFormItem label="群信息设置">
            <div style="display: flex; align-items: center; gap: 5px;">
              <ElButton :disabled="!['owner', 'admin'].includes(props.botRole)" type="primary" @click="manageGroupNotice">
                发送群公告
              </ElButton>
              <ElButton :disabled="!['owner', 'admin'].includes(props.botRole)" type="primary" @click="manageGroupPortrait">
                更改群头像
              </ElButton>
            </div>
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow align="middle">
        <ElCol :span="24">
          <ElFormItem label="群管理配置">
            <div style="display: flex; align-items: center; gap: 5px;">
              <ElButton type="primary" @click="manageGroupPlugins">
                配置群指令
              </ElButton>
              <ElButton :disabled="!['owner', 'admin'].includes(props.botRole)" type="primary" @click="manageGroupViolation">
                配置屏蔽词
              </ElButton>
              <ElButton :disabled="!['owner', 'admin'].includes(props.botRole)" type="primary" @click="manageGroupAddValid">
                配置群验证
              </ElButton>
              <!-- <ElButton type="primary" @click="setGuildWatch(row)">
                  {{ row.isWatch ? '监控已开启' : '监控未开启' }}
                </ElButton> -->
            </div>
          </ElFormItem>
        </ElCol>
      </ElRow>
      <ElRow align="middle">
        <ElCol :span="24">
          <ElFormItem label="群对应操作">
            <div style="display: flex; align-items: center; gap: 5px;">
              <ElButton @click="sendMessage(props.groupId, props.groupName)">
                发送群消息
              </ElButton>
              <ElButton type="danger" @click="groupLeave(props.groupId, props.botRole === 'owner')">
                {{ props.botRole === "owner" ? "解散群" : "退出群" }}
              </ElButton>
            </div>
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>

    <GroupPlugins
      :visible="pluginDialogVisible" :group-id="groupId" :commands="commands" @closed="
        pluginDialogVisible = false;
      "
    />

    <GroupNotice
      :visible="noticeDialogVisible" :group-id="groupId" :bot-id="botId" @closed="
        noticeDialogVisible = false;
      "
    />

    <GroupPortrait
      :visible="portraitDialogVisible" :group-id="groupId" :bot-id="botId" @closed="
        portraitDialogVisible = false;
      "
    />

    <GroupViolation
      :visible="groupViolationVisible" :group-id="groupId" @closed="groupViolationVisible = false;"
    />

    <GroupAddValid
      :visible="groupAddValidVisible" :group-id="groupId" @closed="groupAddValidVisible = false;"
    />
  </ElDialog>
</template>

<style scoped>
.dialogContainer {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.commandSearch {
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  gap: 15px;
}

.custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;
}
</style>
