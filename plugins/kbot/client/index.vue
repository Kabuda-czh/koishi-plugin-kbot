<!--
 * @Author: Kabuda-czh
 * @Date: 2023-01-29 14:28:53
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-07 11:52:22
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
          :disabled="groupList.length <= 1"
          >向所有群广播消息</el-button
        >
      </div>
      <el-form>
        <el-table :data="groupList" style="width: 100%">
          <el-table-column
            align="center"
            prop="group_id"
            label="群号"
            width="100"
          />
          <el-table-column align="center" prop="group_name" label="群名称" />
          <el-table-column align="center" label="是否开启全员禁言">
            <template #default="{ row }">
              <el-button
                type="primary"
                auto-insert-space
                round
                @click="muteGuild(row, true)"
                :disabled="['owner', 'admin'].includes(row.role)"
              >
                开启
              </el-button>
              <el-button
                type="primary"
                auto-insert-space
                round
                @click="muteGuild(row, false)"
                :disabled="['owner', 'admin'].includes(row.role)"
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
                @click="checkGuildInfo(row.group_id, row.role)"
              />
            </template>
          </el-table-column>
          <el-table-column align="center" label="操作">
            <template #default="{ row }">
              <el-button @click="sendMessage(row.group_id, row.group_name)">
                发送消息
              </el-button>
              <el-button
                type="danger"
                @click="groupLeave(row.group_id, row.role === 'owner')"
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

  <GroupDialog
    :visible="dialogVisible"
    :group-id="groupId"
    :bot-id="botId"
    :bot-role="botRole"
    @closed="
      dialogVisible = false;
      groupId = 0;
    "
  />
</template>

<script setup lang="ts">
import { View } from "@element-plus/icons-vue";
import { message, messageBox } from "@koishijs/client";
import { ElButton, ElForm, ElTable, ElTableColumn, ElEmpty } from "element-plus";
import { nextTick, onMounted, ref } from "vue";
import {
  fetchBroadcast,
  fetchGroupLeave,
  fetchGroupMemberList,
  fetchMuteGuild,
  fetchSendMessage,
} from "./api";
import GroupDialog from "./components/GroupDialog.vue";

const loading = ref<boolean>(true);

interface UserInfo {
  userId: string;
  username: string;
  avatar?: string;
}

interface Group {
  group_id: number;
  group_name: string;
  member_count: number;
  max_member_count: number;
}

interface GroupConfig {
  muteAll: boolean;
  role?: string;
}

type GroupList = Group & GroupConfig;

const groupList = ref<GroupList[]>([]);

// dialog
const dialogVisible = ref<boolean>(false);
const groupId = ref<string | number>("");
const botId = ref<string | number>("");
const botRole = ref<string>("");

const checkGuildInfo = (id: number, role: string) => {
  groupId.value = id;
  botRole.value = role;
  dialogVisible.value = true;
};

const getBotInfo = async () => {
  const botInfos = await fetch("/self").then((res) => {
    return res.json() as Promise<UserInfo[]>;
  });

  botId.value = +botInfos[0].userId;
};

const getGroupList = async () => {
  const groupDatas = await fetch(`/groupList`).then(
    (res): Promise<Group[]> => res.json()
  );

  const groupMemberList = await Promise.all(
    groupDatas.map(async (group) => fetchGroupMemberList(group.group_id, true))
  );

  groupMemberList.flat().map((member) => {
    if (member.user_id === +botId.value) {
      groupList.value.push({
        ...groupDatas.find((data) => data.group_id === member.group_id),
        muteAll: false,
        role: member.role,
      });
    }
  });
};

const muteGuild = (row: GroupList, mute: boolean) => {
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
      fetchMuteGuild(row.group_id, ~~mute);
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
      const channels = groupList.value.map((group) => group.group_id);

      fetchBroadcast(channels, value);
    })
    .catch(() => {
      message.success("已取消操作");
    });
};

const sendMessage = (groupId: number, groupName: string) => {
  messageBox
    .prompt("请输入要发送的消息", `向群 ${groupName}(${groupId}) 发送消息`, {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      inputType: "textarea",
      inputPlaceholder: "请输入要发送的消息",
      inputPattern: /\S/,
      inputErrorMessage: "消息不能为空",
    })
    .then(({ value }) => {
      fetchSendMessage(groupId, value);
    })
    .catch(() => {
      message.success("已取消发送");
    });
};

const groupLeave = (groupId: number, isOwner: boolean) => {
  messageBox
    .confirm(
      `<strong>确定要${isOwner ? "解散群" : "退群"}吗?</strong>
      <br />
      <strong style="color: red">该操作无法撤回!</strong>
      <br />
      <i style="color: orange">注意: 当前gocq中解散群接口似乎无效</i>
      `,
      "提醒",
      {
        dangerouslyUseHTMLString: true,
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "error",
      }
    )
    .then(() => {
      // TODO 解散群似乎没什么效果
      fetchGroupLeave(groupId, isOwner);
    })
    .catch(() => {
      message.success("已取消操作");
    });
};

const init = async () => {
  await Promise.all([getBotInfo(), getGroupList()]);
};

// 提高使用体验
onMounted( async () => {
  await nextTick(() => {
    setTimeout(() => {
      init().finally(() => {
        loading.value = false;
      })
    }, 1000)
  })
})
</script>

<style scoped>
.manage__layout {
  margin: 24px;
}
</style>
