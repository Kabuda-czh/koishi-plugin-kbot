<!--
 * @Author: Kabuda-czh
 * @Date: 2023-07-04 10:31:52
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-07-13 13:08:04
 * @FilePath: \KBot-App\plugins\kbot\client\components\GroupAddValid.vue
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
-->
<script setup lang="ts">
import type { Column } from 'element-plus'
import { ElAutoResizer, ElButton, ElTableV2 } from 'element-plus'
import { computed, h, reactive, ref } from 'vue'
import { message } from '@koishijs/client'
import { fetchGetAddValid, fetchSetAddValid } from '../api'
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

interface IValidList {
  question: string
  answer: string
}

interface IValidRes {
  id: number
  guildId: string | number
  timer: number
  validObject: Record<string, string>
}

// validConfig
const validTimer = ref<IValidRes['timer']>(60)

// validList
const validList = ref<IValidList[]>([])
const defaultValidList = ref<IValidList[]>([])

// validDialog
const validVisible = ref<boolean>(false)
const validNewQuestion = ref<string>('')
const validNewAnswer = ref<string>('')

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
    key: 'question',
    dataKey: 'question',
    title: '验证问题',
    width: 350,
    align: 'center',
  },
  {
    key: 'answer',
    dataKey: 'answer',
    title: '验证答案',
    width: 350,
    align: 'center',
  },
  {
    key: 'operation',
    title: '操作',
    width: 350,
    align: 'center',
    cellRenderer: ({ rowIndex, rowData }) => {
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
                validVisible.value = true
                validNewQuestion.value = rowData.question
                validNewAnswer.value = rowData.answer
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
                validList.value.splice(rowIndex, 1)
                defaultValidList.value.splice(rowIndex, 1)
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

async function getGroupAddValid() {
  dialogLoading.value = true
  await fetchGetAddValid(props.groupId).then((res: IValidRes) => {
    const list: IValidList[] = []
    for (const key in res?.validObject || {}) {
      list.push({
        question: key,
        answer: res.validObject[key],
      })
    }
    validList.value = list
    defaultValidList.value = list.slice(0)
  })
  dialogLoading.value = false
}

function selectData(item: { label: string; value: string }) {
  dialogLoading.value = true
  const filterList = defaultValidList.value.filter(
    violation => violation.answer === item.value,
  )

  setTimeout(() => {
    validList.value = filterList
    dialogLoading.value = false
  }, 1000)
}

function dataChange(value: string | number) {
  if (!value) {
    dialogLoading.value = true
    setTimeout(() => {
      validList.value = defaultValidList.value.slice(0)
      dialogLoading.value = false
    }, 1000)
  }
}

async function setGroupAddValid() {
  const validObj: Record<string, string> = {}

  validList.value.forEach((violation) => {
    validObj[`${violation.question}`] = violation.answer
  })

  await fetchSetAddValid(props.groupId, validTimer.value, validObj).then((res) => {
    if (res.code === 0) {
      message({
        message: '设置成功',
        type: 'success',
      })
      dialogVisible.value = false
    }
    else {
      message({
        message: '设置失败',
        type: 'error',
      })
    }
  })
}

function addValid() {
  if (!validNewQuestion.value.trim() || !validNewAnswer.value.trim()) {
    message({
      message: '问题或答案不能为空',
      type: 'warning',
    })
    return
  }

  if (validList.value.some(violation => violation.question === validNewQuestion.value.trim())) {
    message({
      message: '问题已存在',
      type: 'warning',
    })
    return
  }

  defaultValidList.value.push({
    question: validNewQuestion.value.trim(),
    answer: validNewAnswer.value.trim(),
  })
  validList.value.push({
    question: validNewQuestion.value.trim(),
    answer: validNewAnswer.value.trim(),
  })

  validVisible.value = false
  validNewQuestion.value = ''
  validNewAnswer.value = ''
}
</script>

<template>
  <ElDialog
    v-model="dialogVisible" width="50%" title="群验证管理" destroy-on-close @open="getGroupAddValid"
    @closed="dialogVisible = false"
  >
    <div v-loading="dialogLoading" class="dialogContainer">
      <div>
        <ElForm>
          <ElRow>
            <ElCol :span="12">
              <ElFormItem label="回答问题超时时间">
                <ElInputNumber v-model="validTimer" :controls="false" :precision="0" :min="60" :max="600" />
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="搜索验证问题">
                <FuzzySearch
                  :options="defaultValidList" label-key="question" value-key="answer" @select-data="selectData"
                  @data-change="dataChange"
                />
              </ElFormItem>
            </ElCol>
          </ElRow>
        </ElForm>
      </div>
      <ElAutoResizer>
        <template #default="{ width, height }">
          <ElTableV2 :data="validList" :columns="columns" :height="600" :width="width" :max-height="height - 80" />
          <TableBottomButton @add-row="validVisible = true" />
        </template>
      </ElAutoResizer>
    </div>
    <template #footer>
      <ElButton type="primary" @click="setGroupAddValid">
        确认设置
      </ElButton>
    </template>
  </ElDialog>

  <ElDialog v-model="validVisible" width="60%" title="配置验证问题" destroy-on-close @close="validNewAnswer = ''; validNewQuestion = '';">
    <ElForm>
      <ElRow>
        <ElCol :span="12">
          <ElFormItem label="问题">
            <ElInput v-model="validNewQuestion" class="w-full" />
          </ElFormItem>
        </ElCol>
        <ElCol :span="12">
          <ElFormItem label="答案">
            <ElInput v-model="validNewAnswer" />
          </ElFormItem>
        </ElCol>
      </ElRow>
    </ElForm>
    <template #footer>
      <ElButton type="primary" @click="addValid">
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

.commandSearch {
  display: flex;
  flex-direction: row-reverse;
  align-items: center;
  gap: 15px;
}

.w-full {
  width: 100% !important;
}
</style>
