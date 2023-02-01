<!--
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:28:53
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-01 18:23:18
 * @FilePath: \KBot-App\plugins\kbot\client\index.vue
 * @Description: 
 * 
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
-->
<template>
  <k-layout v-loading="loading" element-loading-text="加载中....">
    <div class="manage__layout">
      <div style="margin-bottom: 20px">
        <el-button
          type="primary"
          @click="broadcast"
          :disabled="guildList.length <= 1"
          >向所有群广播消息</el-button
        >
      </div>
      <el-form>
        <el-table :data="guildList" height="250" style="width: 100%">
          <el-table-column
            align="center"
            prop="guildId"
            label="群号"
            width="100"
          />
          <el-table-column align="center" prop="guildName" label="群名称" />
          <el-table-column align="center" label="是否开启全员禁言">
            <template #default="{ row }">
              <el-button
                type="primary"
                auto-insert-space
                round
                @click="muteGuild(row, true)"
              >
                开启
              </el-button>
              <el-button
                type="primary"
                auto-insert-space
                round
                @click="muteGuild(row, false)"
              >
                关闭
              </el-button>
            </template>
          </el-table-column>
          <el-table-column align="center" label="查看群内人员">
            <template #default="{ row }">
              <el-button
                :icon="View"
                size="large"
                circle
                @click="checkGuildInfo(row.guildId, row.role)"
              />
            </template>
          </el-table-column>
          <el-table-column align="center" label="操作">
            <template #default="{ row }">
              <el-button @click="sendMessage(row.guildId, row.guildName)"
                >发送消息</el-button
              >
              <el-button
                type="danger"
                @click="groupLeave(row.guildId, row.role === 'owner')"
              >
                {{ row.role === "owner" ? "解散群" : "退出群" }}
              </el-button>
            </template>
          </el-table-column>
          <template #empty>
            <el-empty />
          </template>
        </el-table>
      </el-form>
    </div>
  </k-layout>

  <GuildDialog
    :visible="dialogVisible"
    :guild-id="guildId"
    :bot-id="botId"
    :bot-role="botRole"
    @closed="
      dialogVisible = false;
      guildId = '';
    "
  />
</template>

<script setup lang="ts">
import { View } from "@element-plus/icons-vue";
import { message, messageBox } from "@koishijs/client";
import { Universal } from "koishi";
import { ref } from "vue";
import GuildDialog from "./components/GuildDialog.vue";

const loading = ref<boolean>(true);

interface UserInfo {
  userId: string;
  username: string;
  avatar?: string;
}

interface GuildConfig {
  muteAll: boolean;
  role?: string;
}

type GuildList = Universal.Guild & GuildConfig;

const guildList = ref<GuildList[]>([]);

// dialog
const dialogVisible = ref<boolean>(false);
const guildId = ref<string>("");
const botId = ref<string>("");
const botRole = ref<string>("");

const checkGuildInfo = (id: string, role: string) => {
  guildId.value = id;
  botRole.value = role;
  dialogVisible.value = true;
};

const getBotInfo = async () => {
  const botInfos = await fetch("/self").then((res) => {
    return res.json() as Promise<UserInfo[]>;
  });

  botId.value = botInfos[0].userId;
};

const getGuildList = async () => {
  const listData = await fetch("/guildList").then((res): Promise<Universal.Guild[]> => res.json());

  const role = await Promise.all(
    listData.map(async (guild) =>
      fetch(`/groupMemberList?groupId=${guild.guildId}&noCache=${true}`).then(
        (res) => res.json()
      )
    )
  ).then((res) => {
    return res.flat().filter((item) => item.user_id === +botId.value)[0].role;
  });

  guildList.value = listData.map((guild) => {
    return {
      ...guild,
      muteAll: false,
      role,
    };
  });
};

const muteGuild = (row: GuildList, mute: boolean) => {
  messageBox
    .confirm(
      "<p>全体禁言并不会判断机器人是否为管理/群主</p><p>以及当前群是否已经开启全体禁言</p><p>确定要继续吗?</p>",
      "提醒",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        dangerouslyUseHTMLString: true,
      }
    )
    .then(() => {
      fetch(`/muteGuild?guildId=${row.guildId}&mute=${~~mute}`).then((res) => {
        if (res.status === 200) message.success("操作成功");
        else message.error("操作失败");
      });
    })
    .catch(() => {
      message.success("已取消操作");
    });
};

const broadcast = () => {
  messageBox
    .prompt("请输入要广播的消息", "广播消息", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      inputType: "textarea",
      inputPlaceholder: "请输入要广播的消息",
      inputPattern: /\S/,
      inputErrorMessage: "消息不能为空",
    })
    .then(({ value }) => {
      const channels = guildList.value
        .map((guild) => guild.guildId)
        .join("&channels=");

      fetch(`/broadcast?channels=${channels}&message=${value}`).then((res) => {
        if (res.status === 200) message.success("发送成功");
        else message.error("发送失败");
      });
    })
    .catch(() => {
      message.success("已取消操作");
    });
};

const sendMessage = (guildId: string, guildName: string) => {
  messageBox
    .prompt("请输入要发送的消息", `向群 ${guildName}(${guildId}) 发送消息`, {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      inputType: "textarea",
      inputPlaceholder: "请输入要发送的消息",
      inputPattern: /\S/,
      inputErrorMessage: "消息不能为空",
    })
    .then(({ value }) => {
      fetch(`/sendMessage?guildId=${guildId}&message=${value}`).then((res) => {
        if (res.status === 200) message.success("发送成功");
        else message.error("发送失败");
      });
    })
    .catch(() => {
      message.success("已取消发送");
    });
};

const groupLeave = (guildId: string, isOwner: boolean) => {
  messageBox
    .confirm(
      `<strong>确定要${isOwner ? "解散群" : "退群"}吗?</strong>
      <br />
      <strong style="color: red">该操作无法撤回!</strong>`,
      "提醒",
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "error",
      }
    )
    .then(() => {
      fetch(`/groupLeave?groupId=${guildId}&isDismiss=${isOwner}`).then(
        (res) => {
          if (res.status === 200) message.success("操作成功");
          else message.error("操作失败");
        }
      );
    })
    .catch(() => {
      message.success("已取消操作");
    });
};

const init = async () => {
  await Promise.all([getBotInfo(), getGuildList()]);
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
