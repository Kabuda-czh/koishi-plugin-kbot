<!--
 * @Author: Kabuda-czh
 * @Date: 2023-01-31 16:17:01
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-02 13:36:05
 * @FilePath: \KBot-App\plugins\kbot\client\components\GroupDialog.vue
 * @Description:
 *
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
-->
<template>
  <el-dialog
    v-model="dialogVisible"
    width="50%"
    title="群信息"
    destroy-on-close
    @open="getMemberList"
    @closed="dialogVisible = false"
  >
    <el-table :data="memberList" v-loading="dialogLoading">
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

<script setup lang="ts">
import { View } from "@element-plus/icons-vue";
import { computed, ref } from "vue";
import { fetchGuildMemberList } from "../api";
import GroupMemberDialog from "./GroupMemberDialog.vue";

interface Props {
  visible?: boolean;
  groupId?: string | number;
  botId?: string | number;
  botRole?: string;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  groupId: 0,
  botId: 0,
  botRole: "member",
});

const dialogVisible = computed({
  get() {
    return props.visible;
  },
  set(val) {
    emits("closed", val);
  },
});
const dialogLoading = ref<boolean>(false);

const emits = defineEmits(["closed"]);

interface UserInfo {
  userId: string;
  username: string;
  avatar?: string;
  nickname: string;
}

const memberList = ref<UserInfo[]>([]);

const getMemberList = async () => {
  if (props.groupId) {
    dialogLoading.value = true;

    memberList.value = await fetchGuildMemberList(props.groupId).finally(() => {
      setTimeout(() => (dialogLoading.value = false), 500);
    });
  }
};

const memberDialogVisible = ref<boolean>(false);
const memberId = ref<string>("");
</script>
