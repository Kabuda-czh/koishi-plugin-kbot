<!--
 * @Author: Kabuda-czh
 * @Date: 2023-01-31 16:17:01
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-01-31 18:10:25
 * @FilePath: \KBot-App\plugins\kbot\client\components\GuildMemberDialog.vue
 * @Description: 
 * 
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
-->
<template>
  <!-- <div> -->
  <el-dialog
    v-model="dialogVisible"
    width="70%"
    title="群信息"
    destroy-on-close
    @open="getMember"
    @closed="dialogVisible = false"
  >
    <el-table :data="memberList" v-loading="dialogLoading">
      <el-table-column align="center" prop="userId" label="QQ号" width="150" />
      <el-table-column align="center" prop="username" label="QQ名称" />
      <el-table-column align="center" prop="nickname" label="群名片">
        <template #default="{ row }">
          <span>{{ row.nickname || row.username }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="头像" width="80">
        <template #default="{ row }">
          <el-image
            style="width: 30px; height: 30px; border-radius: 50%"
            :src="row.avatar"
            fit="fill"
          />
        </template>
      </el-table-column>
      <el-table-column align="center" label="角色" width="80">
        <template #default="{ row }">
          <el-tag :type="RoleObject[row.roles[0]].roleType || 'info'">
            {{ RoleObject[row.roles[0]].roleName || "群员" }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="禁言">
        <template #default="{ row }">
          <el-switch v-model="row.isMute" @change="muteMember(row)" />
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
  <!-- </div> -->
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

interface Props {
  visible?: boolean;
  guildId?: string;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  guildId: "",
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
  roles?: string[];
  isMute?: boolean;
}

const RoleObject = {
  owner: { roleName: "群主", roleType: "warning" },
  admin: { roleName: "管理员", roleType: "success" },
  member: { roleName: "群员", roleType: "info" },
};

const memberList = ref<UserInfo[]>([]);

const getMember = async () => {
  if (props.guildId) {
    dialogLoading.value = true;

    const memberData = await fetch(
      `/guildMemberList?guildId=${props.guildId}`
    ).then((res) => (res.json() as Promise<UserInfo[]>) || []);

    memberList.value = memberData.map((item) => {
      item.roles = item.roles || [];
      item.isMute = item.isMute || false;
      return item;
    });
    dialogLoading.value = false;
  }
};

const muteMember = (member: UserInfo) => {
  // TODO: 禁言人以及时间的设定
  fetch(`/muteMember?guildId=${props.guildId}&userId=${member.userId}`);
};
</script>
