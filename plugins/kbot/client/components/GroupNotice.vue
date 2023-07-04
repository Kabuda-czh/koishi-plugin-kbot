<!--
 * @Author: Kabuda-czh
 * @Date: 2023-06-28 11:25:26
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-06-29 10:19:00
 * @FilePath: \KBot-App\plugins\kbot\client\components\GroupNotice.vue
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
-->
<script setup lang="ts">
import { computed, ref } from 'vue'
import type { UploadFile, UploadInstance, UploadProps, UploadRawFile } from 'element-plus'
import { ElMessage, genFileId } from 'element-plus'
import { fetchImageInfo, fetchSendGroupNotice } from '../api'
import HistoryDrawer from './HistoryDrawer.vue'

interface Props {
  visible?: boolean
  botId?: string | number
  groupId?: string | number
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  botId: 0,
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

const dialogFile = ref<UploadFile>()

// drawer
const historyVisible = ref<boolean>(false)

const groupNotice = ref<string>('')

const upload = ref<UploadInstance>()

const handleExceed: UploadProps['onExceed'] = (files) => {
  upload.value!.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  upload.value!.handleStart(file)
}

const handleChange: UploadProps['onChange'] = (file) => {
  dialogFile.value = file
}

async function handleFileImage() {
  const fileReader = new FileReader()
  fileReader.readAsDataURL(dialogFile.value!.raw!)
  const base64: string = await new Promise((resolve) => {
    fileReader.onload = (e) => {
      resolve(e.target!.result as string)
    }
  })

  const res = await fetchImageInfo(base64)

  return fetchSendGroupNotice('post', props.botId, props.groupId, groupNotice.value, `${res.data.path}`)
}

async function setNotice() {
  try {
    if (dialogFile.value)
      await handleFileImage()

    else
      await fetchSendGroupNotice('get', props.botId, props.groupId, groupNotice.value)

    ElMessage.success('发送成功')
  }
  finally {
    dialogVisible.value = false
    upload.value!.clearFiles()
    dialogFile.value = null
    groupNotice.value = ''
  }
}
</script>

<template>
  <ElDialog
    v-model="dialogVisible" width="30%" title="发送群公告" destroy-on-close
    @closed="dialogVisible = false"
  >
    <div v-loading="dialogLoading" class="dialogContainer">
      <ElInput
        v-model="groupNotice"
        type="textarea"
        :autosize="{ minRows: 2, maxRows: 10 }"
        placeholder="请输入群公告"
      />
      <ElUpload
        ref="upload"
        style="margin-top: 1rem"
        :on-change="handleChange"
        list-type="picture-card"
        :limit="1"
        :on-exceed="handleExceed"
        :auto-upload="false"
      >
        <template #trigger>
          <ElButton type="primary">
            选择图片
          </ElButton>
        </template>
        <template #tip>
          <div class="el-upload__tip text-red">
            <p>仅支持上传图片, 且不超过 1 张</p>
            <p>注意: 当前因 gocq 原因, 无法携带图片发送群公告</p>
          </div>
        </template>
      </ElUpload>
    </div>
    <template #footer>
      <ElButton type="primary" @click="historyVisible = true">
        查看群公告列表
      </ElButton>
      <ElButton type="primary" @click="setNotice">
        确认设置
      </ElButton>
    </template>
  </ElDialog>

  <HistoryDrawer :visible="historyVisible" :bot-id="props.botId" :group-id="props.groupId" @closed="historyVisible = false" />
</template>

<style scoped>
.dialogContainer {
  display: flex;
  flex-direction: column;
  width: 100%;
}
</style>
