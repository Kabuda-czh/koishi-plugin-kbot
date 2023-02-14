<!--
 * @Author: Kabuda-czh
 * @Date: 2023-01-31 16:17:01
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-14 10:53:57
 * @FilePath: \KBot-App\plugins\kbot\client\components\GroupMemberDialog.vue
 * @Description: 
 * 
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
-->
<template>
  <el-dialog
    v-model="dialogVisible"
    width="70%"
    title="群成员详细信息"
    destroy-on-close
    @open="getMemberInfo"
    @closed="dialogVisible = false"
    append-to-body
  >
    <el-form :model="memberInfo" label-width="auto">
      <el-row>
        <el-col :span="8">
          <el-form-item label="群号">
            <el-input v-model="memberInfo.group_id" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="QQ号">
            <el-input v-model="memberInfo.user_id" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="QQ昵称">
            <el-input v-model="memberInfo.nickname" disabled />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="群名片">
            <el-input
              v-model="memberInfo.card"
              :disabled="!memberInfo.card_changeable"
              placeholder="无"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="性别">
            <el-select v-model="memberInfo.sex" style="width: 100%" disabled>
              <el-option
                v-for="item in sexList"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="角色">
            <el-tag :type="RoleObject[memberInfo.role]?.roleType || 'info'">
              {{ RoleObject[memberInfo.role]?.roleName || "群员" }}
            </el-tag>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="入群时间">
            <el-date-picker
              style="width: 100%"
              v-model="joinTime"
              type="datetime"
              placeholder="无"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="最后发言">
            <el-date-picker
              style="width: 100%"
              v-model="lastSentTime"
              type="datetime"
              placeholder="无"
              disabled
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="成员标签">
            <el-tag :type="memberInfo.unfriendly ? 'danger' : 'success'">
              {{ memberInfo.unfriendly ? "危险" : "安全" }}
            </el-tag>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="专属头衔">
            <el-input
              placeholder="无"
              v-model="memberInfo.title"
              :disabled="RoleObject[memberInfo.role]?.role !== 3"
            />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="禁言操作">
            <el-button
              type="danger"
              :disabled="botEditRole"
              @click="muteMember"
            >
              选择禁言时间
            </el-button>
            <el-button
              type="success"
              :disabled="botEditRole"
              @click="cancelMuteMember"
            >
              解除禁言
            </el-button>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="操作">
            <el-button
              type="warning"
              :disabled="
                props.botRole !== 'owner' || +props.botId === memberInfo.user_id
              "
              @click="groupSetAdmin"
            >
              {{
                RoleObject[memberInfo.role]?.role === 2
                  ? "取消管理员"
                  : "设置管理员"
              }}
            </el-button>
            <el-button type="danger" :disabled="botEditRole" @click="groupKick">
              踢出群聊
            </el-button>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </el-dialog>
</template>

<script setup lang="ts">
import { message, messageBox } from "@koishijs/client";
import { ElCol, ElForm, ElFormItem, ElInputNumber, ElRow } from "element-plus";
import { computed, ref, h } from "vue";
import {
  fetchGroupAdmin,
  fetchGroupKick,
  fetchGroupMemberInfo,
  fetchMuteMember,
} from "../api";

interface Props {
  visible?: boolean;
  groupId?: string | number;
  botId?: string | number;
  botRole?: string;
  memberId?: string | number;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  groupId: "",
  botId: "",
  botRole: "member",
  memberId: "",
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

const sexList = [
  {
    label: "男",
    value: "male",
  },
  {
    label: "女",
    value: "female",
  },
  {
    label: "未知",
    value: "unknown",
  },
];

const joinTime = computed(() => memberInfo.value.join_time * 1000);
const lastSentTime = computed(() => memberInfo.value.last_sent_time * 1000);

interface UserInfo {
  group_id: string | number;
  user_id: string | number;
  nickname: string;
  card: string;
  sex: string;
  age: number;
  area: string;
  join_time: number;
  last_sent_time: number;
  level: string;
  role: string;
  unfriendly: boolean;
  title: string;
  title_expire_time: number;
  card_changeable: boolean;
  shut_up_timestamp: number;
}

const RoleObject = {
  owner: { roleName: "群主", roleType: "warning", role: 3 },
  admin: { roleName: "管理员", roleType: "success", role: 2 },
  member: { roleName: "群员", roleType: "info", role: 1 },
};

const botEditRole = computed(() => {
  return (
    RoleObject[props.botRole]?.role === 1 ||
    RoleObject[props.botRole]?.role <= RoleObject[memberInfo.value.role]?.role
  );
});

const memberInfo = ref<Partial<UserInfo>>({});

const getMemberInfo = async () => {
  if (props.groupId && props.botId) {
    dialogLoading.value = true;

    await fetchGroupMemberInfo(props.groupId, props.memberId, true)
      .then((res) => {
        memberInfo.value = res[0];
      })
      .finally(() => {
        setTimeout(() => (dialogLoading.value = false), 1000);
      });
  }
};

// 禁言操作
const muteMember = () => {
  const muteDay = ref<number>(0), // 天
    muteHour = ref<number>(0), // 小时
    muteMinute = ref<number>(1); // 分钟

  const muteMemberDiv = {
    style: {
      display: "flex",
      "flex-direction": "column",
      gap: "10px",
    },
  };

  const muteMemberTimeDiv = {
    style: {
      display: "flex",
      width: "100%",
      "align-items": "center",
      "justify-content": "space-between",
    },
  };

  messageBox({
    type: "info",
    title: "禁言操作",
    message: h("div", muteMemberDiv, [
      h("div", muteMemberTimeDiv, [
        h("span", null, "禁言(0 ~ 29)天"),
        h(ElInputNumber, {
          modelValue: muteDay.value,
          min: 0,
          max: 29,
          step: 1,
          controls: false,
          "onUpdate:modelValue": (val) => (muteDay.value = val),
        }),
      ]),
      h("div", muteMemberTimeDiv, [
        h("p", null, "禁言(0 ~ 23)小时"),
        h(ElInputNumber, {
          modelValue: muteHour.value,
          min: 0,
          max: 23,
          step: 1,
          controls: false,
          "onUpdate:modelValue": (val) => (muteHour.value = val),
        }),
      ]),
      h("div", muteMemberTimeDiv, [
        h("p", null, "禁言(0 ~ 59)分钟"),
        h(ElInputNumber, {
          modelValue: muteMinute.value,
          min: 0,
          max: 59,
          step: 1,
          controls: false,
          "onUpdate:modelValue": (val) => (muteMinute.value = val),
        }),
      ]),
    ]),
  })
    .then(() => {
      const duration =
        muteDay.value * 24 * 3600 +
        muteHour.value * 3600 +
        muteMinute.value * 60;
      fetchMuteMember(
        memberInfo.value.group_id,
        memberInfo.value.user_id,
        duration * 1000
      ).then(() => {
        message.success(
          `禁言 ${memberInfo.value.nickname} 成功, 禁言时间: ${
            muteDay.value ? `${muteDay.value}天` : ""
          }${muteHour.value ? `${muteHour.value}小时` : ""}${
            muteMinute.value ? `${muteMinute.value}分钟` : ""
          }`
        );
      });
    })
    .catch(() => message.success("已取消操作"));
};

const cancelMuteMember = () => {
  fetchMuteMember(memberInfo.value.group_id, memberInfo.value.user_id, 0).then(
    () => message.success(`取消禁言 ${memberInfo.value.nickname} 成功`)
  );
};

// 群管理操作
const groupSetAdmin = () => {
  const isSetAdmin = RoleObject[memberInfo.value.role]?.role === 2;

  messageBox
    .confirm(
      `确定要${isSetAdmin ? "取消" : ""}设置 ${memberInfo.value.nickname}(${
        memberInfo.value.user_id
      }) 为管理员吗?`,
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        draggable: true,
      }
    )
    .then(() => {
      fetchGroupAdmin(props.groupId, props.memberId, !isSetAdmin).then(() => {
        message.success(`${isSetAdmin ? "取消" : ""}设置管理员成功`);
        getMemberInfo();
      });
    })
    .catch(() => message.success("已取消操作"));
};

const groupKick = () => {
  // TODO 因为动态渲染的原因，这里的弹窗暂时未开发允许再次加入的选项
  const rejectAddRequest = ref<boolean>(false);

  messageBox
    .confirm(
      `确定要踢出 ${memberInfo.value.nickname}(${memberInfo.value.group_id}) 吗?`,
      "提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        draggable: true,
      }
    )
    .then(() => {
      fetchGroupKick(
        props.groupId,
        props.memberId,
        rejectAddRequest.value
      ).then(() => {
        message.success("踢出成功");
        getMemberInfo();
      });
    })
    .catch(() => message.success("已取消操作"));
};
</script>
