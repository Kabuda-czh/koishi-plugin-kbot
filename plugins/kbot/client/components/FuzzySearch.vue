<!--
 * @Author: Kabuda-czh
 * @Date: 2023-02-14 11:21:29
 * @LastEditors: Kabuda-czh
 * @LastEditTime: 2023-02-14 11:33:45
 * @FilePath: \KBot-App\plugins\kbot\client\components\FuzzySearch.vue
 * @Description: 
 * 
 * Copyright (c) 2023 by Kabuda-czh, All Rights Reserved.
-->
<script setup lang="ts">
import { Search } from "@element-plus/icons-vue";
import { onMounted, ref, watch } from "vue";

type SearchOptionType = {
  label: string;
  value: string;
};

const props = withDefaults(
  defineProps<{
    options: any[];
    value?: "";
    labelKey?: string;
    valueKey?: string;
    isDisabled?: boolean;
    index?: number;
    placeholder?: string;
  }>(),
  {
    options: () => [],
    isDisabled: false,
    value: "",
    labelKey: "label",
    valueKey: "value",
    index: 0,
    placeholder: "请输入查询内容",
  }
);

const emit = defineEmits(["selectData", "dataChange"]);

const state = ref<string>("");

const searchOptions = ref<SearchOptionType[]>([]);
const querySearch = (queryString: string, cb: any) => {
  const results = queryString
    ? searchOptions.value.filter((item) =>
        (item.label + item.value).includes(queryString)
      )
    : searchOptions.value;

  cb(results);
};

const getFuzzySearch = (item: any) => {
  emit("selectData", item, props?.index);
};

const checkValue = (
  options: any[],
  labelKey: string,
  valueKey: string
): SearchOptionType[] => {
  const _options: SearchOptionType[] = options.reduce(
    (pre: SearchOptionType[], cur) => {
      pre.push({
        label: cur[`${labelKey}`],
        value: cur[`${valueKey}`],
      });
      return pre;
    },
    [] as SearchOptionType[]
  );
  return _options;
};

const loadAll = () => {
  const _options = checkValue(props.options, props.labelKey, props.valueKey);
  searchOptions.value = _options;
  if (!props.value) {
    state.value = "";
    if (props.options.length === 1) {
      state.value = props.options[0].label;
      getFuzzySearch({
        label: props.options[0].label,
        value: props.options[0].value,
      });
    }
  } else {
    state.value = props.options.find(
      (option) => option[props.valueKey] === props.value
    )?.[props.labelKey];
  }
};

const changeSearch = (val: string | number) => {
  emit("dataChange", val, props?.index);
};

watch(() => props.options, loadAll, { deep: true });

// watch(() => props.value, loadAll, { deep: true });

onMounted(() => {
  loadAll();
});
</script>

<template>
  <el-autocomplete
    v-model="state"
    highlight-first-item
    value-key="label"
    :fetch-suggestions="querySearch"
    :placeholder="isDisabled ? '暂无数据' : props.placeholder"
    :disabled="isDisabled"
    @select="getFuzzySearch"
    @change="changeSearch"
  >
    <template #suffix>
      <el-icon><Search /></el-icon>
    </template>
    <template #default="{ item }">
      <div class="flex-bc">
        <span style="color: var(--el-text-color-secondary); font-size: 13px">{{
          item.label
        }}</span>
        <span>{{ item.value }}</span>
      </div>
    </template>
  </el-autocomplete>
</template>

<style scoped>
.flex-bc {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>