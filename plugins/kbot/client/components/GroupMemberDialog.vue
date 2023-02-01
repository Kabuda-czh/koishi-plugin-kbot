<!--
 * @Author: Kabuda-czh
 * @Date: 2023-01-31 16:17:01
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-02 02:24:11
 * @FilePath: \koishi-plugin-kbot\plugins\kbot\client\components\GuildMemberDialog.vue
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
            <el-input v-model="memberInfo.sex" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="年龄">
            <el-input v-model="memberInfo.age" disabled />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="地区">
            <el-input v-model="memberInfo.area" placeholder="无" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="加入时间戳">
            <el-input v-model="memberInfo.join_time" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="最后发言时间戳">
            <el-input v-model="memberInfo.last_sent_time" disabled />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="成员等级">
            <el-input v-model="memberInfo.level" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="角色">
            <el-tag :type="RoleObject[memberInfo.role]?.roleType || 'info'">
              {{ RoleObject[memberInfo.role]?.roleName || "群员" }}
            </el-tag>
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="是否不良记录成员">
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
          <el-form-item label="专属头衔过期时间戳">
            <el-input v-model="memberInfo.title_expire_time" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="是否允许修改群名片">
            <el-tag :type="memberInfo.card_changeable ? 'info' : 'warning'">
              {{ memberInfo.card_changeable ? "允许" : "不允许" }}
            </el-tag>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="8">
          <el-form-item label="禁言到期时间">
            <el-input v-model="memberInfo.shut_up_timestamp" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="8">
          <el-form-item label="禁言操作">
            <el-button type="danger" :disabled="botEditRole">
              选择禁言时间
            </el-button>
            <el-button type="success" :disabled="botEditRole">
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
import { computed, ref } from "vue";

interface Props {
  visible?: boolean;
  groupId?: string;
  botId?: string;
  botRole?: string;
  memberId?: string;
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

interface UserInfo {
  group_id: number;
  user_id: number;
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

    fetch(
      `/groupMemberInfo?groupId=${props.groupId}&userId=${props.memberId}&noCache=true`
    )
      .then((res) => res.json())
      .then((res) => {
        memberInfo.value = res[0];
      });

    dialogLoading.value = false;
  }
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
      fetch(
        `/groupKick?groupId=${props.groupId}&userId=${props.memberId}&rejectAddRequest=${rejectAddRequest.value}`
      )
        .then((res) => { 
          const data = res.json()
          message.success("操作成功")
          return data;
        })
        .catch((res) => {
          message.error(`操作失败: ${res}`)
        });
    })
    .catch(() => {
      message.success("已取消操作");
    });
};
</script>
