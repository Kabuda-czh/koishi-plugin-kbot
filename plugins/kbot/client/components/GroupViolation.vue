<!--
 * @Author: Kabuda-czh
 * @Date: 2023-07-04 10:31:36
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-07-13 13:05:25
 * @FilePath: \KBot-App\plugins\kbot\client\components\GroupViolation.vue
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
-->
<script setup lang="ts">
import type { Column } from 'element-plus'
import { ElAutoResizer, ElButton } from 'element-plus'
import { computed, h, reactive, ref } from 'vue'
import { message, messageBox } from '@koishijs/client'
import { fetchGetViolationList, fetchSetViolationList } from '../api'
import FuzzySearch from './FuzzySearch.vue'
import TableBottomButton from './TableBottomButton.vue'

interface Props {
  visible?: boolean
  groupId?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  groupId: 0,
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

interface IViolationList {
  label: string
  value: string
}

interface IViolationRes {
  id: number
  guildId: string | number
  handleWay: 'mute' | 'kick'
  count: number
  violations: string[]
}

// violationConfig
const violationCount = ref<IViolationRes['count']>(3)
const violationHandleWay = ref<IViolationRes['handleWay']>('mute')

// violationList
const violationList = ref<IViolationList[]>([])
const defaultViolationList = ref<IViolationList[]>([])

// ElTableV2 columns
const columns = reactive<Column<any>[]>([
  {
    key: 'index',
    cellRenderer: ({ rowIndex }) => {
      return h(
        'div',
        {
          class: 'index',
        },
        rowIndex + 1,
      )
    },
    title: '序号',
    width: 150,
    align: 'center',
  },
  {
    key: 'value',
    dataKey: 'value',
    title: '屏蔽词',
    width: 350,
    align: 'center',
  },
  {
    key: 'operation',
    title: '操作',
    width: 350,
    align: 'center',
    cellRenderer: ({ rowIndex }) => {
      return h(
        'div',
        {
          class: 'operation',
        },
        [
          h(
            ElButton,
            {
              type: 'primary',
              size: 'default',
              onClick: () => {
                messageBox
                  .prompt('编辑屏蔽词', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    inputType: 'textarea',
                    inputPlaceholder: '请输入修改后的屏蔽词',
                    inputPattern: /\S/,
                    inputErrorMessage: '屏蔽词不能为空',
                  })
                  .then(({ value }) => {
                    if (value) {
                      const filterList = defaultViolationList.value.filter(
                        violation => violation.value === value,
                      )
                      if (filterList.length) {
                        message.error('该屏蔽词已存在')
                      }
                      else {
                        violationList.value.splice(rowIndex, 1, {
                          label: value.trim(),
                          value: value.trim(),
                        })
                        defaultViolationList.value.splice(rowIndex, 1, {
                          label: value.trim(),
                          value: value.trim(),
                        })
                      }
                    }
                  })
              },
            },
            {
              default: () => '编辑',
            },
          ),
          h(
            ElButton,
            {
              type: 'danger',
              size: 'default',
              onClick: () => {
                violationList.value.splice(rowIndex, 1)
                defaultViolationList.value.splice(rowIndex, 1)
              },
            },
            {
              default: () => '删除',
            },
          ),
        ],
      )
    },
  },
])

async function getViolationList() {
  dialogLoading.value = true
  await fetchGetViolationList(props.groupId).then((res: IViolationRes) => {
    const violations = res?.violations?.map((item) => {
      return {
        label: item,
        value: item,
      }
    }) || []
    defaultViolationList.value = violations
    violationList.value = violations.slice(0)

    violationCount.value = res?.count || 3
    violationHandleWay.value = res?.handleWay || 'mute'
  })
  dialogLoading.value = false
}

function selectData(item: { label: string; value: string }) {
  dialogLoading.value = true
  const filterList = defaultViolationList.value.filter(
    violation => violation.value === item.value,
  )

  setTimeout(() => {
    violationList.value = filterList
    dialogLoading.value = false
  }, 1000)
}

function dataChange(value: string | number) {
  if (!value) {
    dialogLoading.value = true
    setTimeout(() => {
      violationList.value = defaultViolationList.value.slice(0)
      dialogLoading.value = false
    }, 1000)
  }
}

function addViolation() {
  messageBox
    .prompt('请输入要添加的屏蔽词', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputType: 'textarea',
      inputPlaceholder: '请输入要添加的屏蔽词',
      inputPattern: /\S/,
      inputErrorMessage: '屏蔽词不能为空',
    })
    .then(({ value }) => {
      if (value) {
        const filterList = defaultViolationList.value.filter(
          violation => violation.value === value,
        )
        if (filterList.length) {
          message.error('该屏蔽词已存在')
        }
        else {
          violationList.value.push({
            label: value.trim(),
            value: value.trim(),
          })
          defaultViolationList.value.push({
            label: value.trim(),
            value: value.trim(),
          })
        }
      }
    })
}

async function setViolationList() {
  const violationList = defaultViolationList.value.map(item => item.value)
  await fetchSetViolationList(props.groupId, violationCount.value, violationHandleWay.value, violationList).then((res) => {
    if (res.code === 0) {
      message.success('设置成功')
      dialogVisible.value = false
    }
    else {
      message.error(`设置失败${res.msg}`)
    }
  })
}
</script>

<template>
  <ElDialog
    v-model="dialogVisible" width="40%" title="群屏蔽词管理" destroy-on-close @open="getViolationList"
    @closed="dialogVisible = false"
  >
    <div v-loading="dialogLoading" class="dialogContainer">
      <div>
        <ElForm>
          <ElRow>
            <ElCol :span="12">
              <ElFormItem label="每日违规次数">
                <ElInputNumber v-model="violationCount" :controls="false" :precision="0" :min="3" :max="100" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="处理方式">
                <ElSelect v-model="violationHandleWay" placeholder="请选择处理方式">
                  <ElOption label="禁言" value="mute" />
                  <ElOption label="踢出" value="kick" />
                </ElSelect>
              </ElFormItem>
            </ElCol>
          </ElRow>
          <ElRow>
            <ElCol :span="24">
              <ElFormItem label="搜索屏蔽词">
                <FuzzySearch
                  :options="defaultViolationList" @select-data="selectData"
                  @data-change="dataChange"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>
        </ElForm>
      </div>
      <ElAutoResizer>
        <template #default="{ width, height }">
          <ElTableV2 :data="violationList" :columns="columns" :height="600" :width="width" :max-height="height - 80" />
          <TableBottomButton @add-row="addViolation" />
        </template>
      </ElAutoResizer>
    </div>
    <template #footer>
      <ElButton type="primary" @click="setViolationList">
        确认设置
      </ElButton>
    </template>
  </ElDialog>
</template>

<style scoped>
.dialogContainer {
  display: flex;
  flex-direction: column;
  width: 100%;
}
</style>
