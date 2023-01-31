<!--
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:28:53
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-01-31 18:05:36
 * @FilePath: \KBot-App\plugins\kbot\client\index.vue
 * @Description: 
 * 
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
-->
<template>
  <k-layout v-loading="loading" element-loading-text="加载中....">
    <div class="manage__layout">
      <el-form>
        <el-table :data="guildList" height="250" style="width: 100%">
          <el-table-column
            align="center"
            prop="guildId"
            label="群号"
            width="100"
          />
          <el-table-column align="center" prop="guildName" label="群名称" />
          <el-table-column align="center" label="是否开启全员禁言" width="180">
            <template #default="{ row }">
              <el-switch v-model="row.muteAll" @change="muteGuild(row)" />
            </template>
          </el-table-column>
          <el-table-column align="center" label="查看详细信息">
            <template #default="{ row }">
              <el-icon
                style="cursor: pointer"
                @click="checkGuildInfo(row.guildId)"
              >
                <Search />
              </el-icon>
            </template>
          </el-table-column>
          <template #empty>
            <el-empty />
          </template>
        </el-table>
      </el-form>
    </div>
  </k-layout>

  <GuildMemberDialog
    :visible="dialogVisible"
    :guild-id="guildId"
    @closed="
      dialogVisible = false;
      guildId = '';
    "
  />
</template>

<script setup lang="ts">
import { Search } from "@element-plus/icons-vue";
import { message } from "@koishijs/client";
import { Universal } from "koishi";
import { ref } from "vue";
import GuildMemberDialog from "./components/GuildMemberDialog.vue";

const loading = ref<boolean>(true);

interface GuildConfig {
  muteAll: boolean;
}

type GuildList = Universal.Guild & GuildConfig;

const guildList = ref<GuildList[]>([]);

// dialog
const dialogVisible = ref<boolean>(false);
const guildId = ref<string>("");

const checkGuildInfo = (id: string) => {
  guildId.value = id;
  dialogVisible.value = true;
};

const getGuildList = async () => {
  const listData = await fetch("/guildList").then((res) => {
    return res.json() as Promise<Universal.Guild[]>;
  });

  guildList.value = listData.map((guild) => {
    return {
      ...guild,
      muteAll: false,
    };
  });
};

const muteGuild = (row: GuildList) => {
  fetch(`/muteGuild?guildId=${row.guildId}&mute=${~~row.muteAll}`).then(res => {
    if (res.status === 200) message.success("操作成功")
    else message.error("操作失败")
  })
}

const init = async () => {
  await getGuildList();
};

init().finally(() => {
  loading.value = false;
});
</script>

<style scoped>
.manage__layout {
  margin: 24px;
}
</style>
