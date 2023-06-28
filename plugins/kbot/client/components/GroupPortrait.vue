<!--
 * @Author: Kabuda-czh
 * @Date: 2023-06-28 16:37:42
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-06-28 17:12:55
 * @FilePath: \KBot-App\plugins\kbot\client\components\GroupPortrait.vue
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
-->
<script setup lang="ts">
import { computed, ref } from 'vue'
import type { UploadFile, UploadInstance, UploadProps, UploadRawFile } from 'element-plus'
import { Delete, Plus, ZoomIn } from '@element-plus/icons-vue'
import { ElMessage, genFileId } from 'element-plus'
import { fetchSetGroupPortrait } from '../api/group'
import { fetchImageInfo } from '../api'

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

const imagePreVisible = ref(false)
const imagePreUrl = ref('')

const dialogFile = ref<UploadFile>()

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

  return res.data.path
}
async function setPortrait() {
  dialogLoading.value = true
  await fetchSetGroupPortrait(props.botId, props.groupId, await handleFileImage()).then(() => {
    ElMessage.success('设置成功')
    dialogVisible.value = false
    upload.value!.clearFiles()
  }).finally(() => {
    dialogLoading.value = false
  })
}

function handleRemove(file: UploadFile) {
  upload.value!.clearFiles()
}

function handlePictureCardPreview(file: UploadFile) {
  imagePreUrl.value = file.url!
  imagePreVisible.value = true
}
</script>

<template>
  <el-dialog
    v-model="dialogVisible" width="30%" title="更改群头像" destroy-on-close
    @closed="dialogVisible = false"
  >
    <div v-loading="dialogLoading" class="dialogContainer">
      <el-upload
        ref="upload"
        style="margin-top: 1rem"
        :on-change="handleChange"
        list-type="picture-card"
        :limit="1"
        :on-exceed="handleExceed"
        :auto-upload="false"
      >
        <el-icon><Plus /></el-icon>
        <template #file="{ file }">
          <div>
            <img class="el-upload-list__item-thumbnail" :src="file.url" alt="">
            <span class="el-upload-list__item-actions">
              <span
                class="el-upload-list__item-preview"
                @click="handlePictureCardPreview(file)"
              >
                <el-icon><ZoomIn /></el-icon>
              </span>
              <span
                class="el-upload-list__item-delete"
                @click="handleRemove(file)"
              >
                <el-icon><Delete /></el-icon>
              </span>
            </span>
          </div>
        </template>
        <template #tip>
          <div class="el-upload__tip text-red">
            <p>仅支持上传图片, 且不超过 1 张</p>
            <p>注意: 在 gocq 文档中有说明, 目前这个API在登录一段时间后因cookie失效而失效, 请考虑后使用</p>
          </div>
        </template>
      </el-upload>
    </div>
    <template #footer>
      <ElButton type="primary" @click="setPortrait">
        确认设置
      </ElButton>
    </template>
  </el-dialog>

  <el-dialog v-model="imagePreVisible">
    <img style="width: 100%" :src="imagePreUrl" alt="Preview Image">
  </el-dialog>
</template>

<style scoped>
.dialogContainer {
  display: flex;
  flex-direction: column;
  width: 100%;
}
</style>
