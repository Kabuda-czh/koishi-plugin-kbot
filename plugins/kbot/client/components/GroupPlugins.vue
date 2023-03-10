<!--
 * @Author: Kabuda-czh
 * @Date: 2023-01-31 16:17:01
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-03-10 16:25:52
 * @FilePath: \KBot-App\plugins\kbot\client\components\GroupPlugins.vue
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
-->
<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { computed, ref } from 'vue'
import { fetchDisabledCommands, fetchSwitchCommands } from '../api'
import type { GroupCommand } from '../interface'
import FuzzySearch from './FuzzySearch.vue'

interface Props {
  visible?: boolean
  groupId?: string | number
  commands?: GroupCommand[]
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  groupId: 0,
  commands: () => [],
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
const dialogLoading = ref<boolean>(false)

// commands
const commandId = ref<number>(1)
const commands = ref<GroupCommand[]>([])
const defaultCommands = ref<GroupCommand[]>([])

const getCommandList = async () => {
  const setDisable = (commands: GroupCommand[], disables: string[]) => {
    for (const command of commands) {
      command.id = commandId.value++
      command.disable = disables.includes(command.name)
      setDisable(command.children, disables)
    }
  }

  await fetchDisabledCommands(props.groupId).then((res: string[]) => {
    const sliceCommands = props.commands.slice()
    setDisable(sliceCommands, res)
    defaultCommands.value = commands.value = sliceCommands
  })
}

const selectData = (item: { label: string; value: string }) => {
  dialogLoading.value = true
  const filterList = defaultCommands.value.filter(
    commands => commands.name === item.value,
  )

  setTimeout(() => {
    commands.value = filterList
    dialogLoading.value = false
  }, 1000)
}

const dataChange = (value: string | number) => {
  if (!value) {
    dialogLoading.value = true
    setTimeout(() => {
      commands.value = defaultCommands.value
      dialogLoading.value = false
    }, 1000)
  }
}

const findParentCommand = (command: GroupCommand, commands: GroupCommand[]): GroupCommand => {
  const parentName = command.parent
  if (!parentName)
    return null

  for (const cmd of commands) {
    if (cmd.name === parentName)
      return cmd

    if (cmd.children) {
      const parent = findParentCommand(command, cmd.children)
      if (parent)
        return parent
    }
  }

  return null
}

const commandSwitch = (command: GroupCommand) => {
  if (command.hasChildren)
    command.children.map(child => child.disable = command.disable)
  if (command.parent) {
    const parent = findParentCommand(command, commands.value)
    let disabled = 0
    parent.children.forEach(child => child.disable && disabled++)
    parent.disable = disabled === parent.children.length
  }
}

const getAllDisable = (commands: GroupCommand[]): string[] => {
  const disables: string[] = []

  for (const cmd of commands) {
    if (cmd.disable)
      disables.push(cmd.name)

    if (cmd.children.length)
      disables.push(...getAllDisable(cmd.children))
  }

  return disables
}

const setCommands = async () => {
  const disabledCommands = getAllDisable(commands.value)
  await fetchSwitchCommands(String(props.groupId), disabledCommands).then((res: boolean) => {
    if (res)
      ElMessage.success('设置成功')

    else
      ElMessage.error('设置失败')
  })
}

const init = async () => {
  dialogLoading.value = true
  await getCommandList()
  dialogLoading.value = false
}

init()
</script>

<template>
  <el-dialog
    v-model="dialogVisible" width="30%" title="群指令管理" destroy-on-close @open="getCommandList"
    @closed="dialogVisible = false"
  >
    <div v-loading="dialogLoading" class="dialogContainer">
      <div class="commandSearch">
        <FuzzySearch
          :options="defaultCommands" label-key="name" value-key="name" @select-data="selectData"
          @data-change="dataChange"
        />
        <p>搜索指令</p>
      </div>
      <el-scrollbar height="40vh">
        <el-tree
          :data="commands"
          node-key="id"
          :expand-on-click-node="false"
        >
          <template #default="{ data }">
            <div class="custom-tree-node">
              <span>{{ data.name }}</span>
              <ElSwitch
                v-model="data.disable"
                style="--el-switch-on-color: #ff4949; --el-switch-off-color: #13ce66"
                @change="commandSwitch(data)"
              />
            </div>
          </template>
        </el-tree>
      </el-scrollbar>
    </div>
    <template #footer>
      <ElButton type="primary" @click="setCommands">
        确认设置
      </ElButton>
    </template>
  </el-dialog>
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
