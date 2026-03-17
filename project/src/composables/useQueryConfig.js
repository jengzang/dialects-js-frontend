/**
 * 查询配置 Composable
 * 提供统一的查询相关配置访问接口
 */
import { computed } from 'vue'
import {
  column_values,
  AVAILABLE_KEYS,
  KEY_EXCLUSIVE_RULES,
  SINGLE_SELECT_KEYS,
  KEY_GROUPS
} from '@/config'

export function useQueryConfig() {
  // 键值映射数据
  const keyValueMap = computed(() => column_values)

  // 可用的键列表
  const availableKeys = computed(() => AVAILABLE_KEYS)

  // 互斥规则
  const exclusiveRules = computed(() => KEY_EXCLUSIVE_RULES)

  // 单选限制的键
  const singleSelectKeys = computed(() => SINGLE_SELECT_KEYS)

  // 键分组
  const keyGroups = computed(() => KEY_GROUPS)

  /**
   * 获取指定键的所有可选值
   * @param {string} key - 键名
   * @returns {Array<string>} 该键的所有可选值
   */
  const getKeyValues = (key) => {
    return keyValueMap.value[key] || []
  }

  /**
   * 检查两个键是否互斥
   * @param {string} key1 - 第一个键
   * @param {string} key2 - 第二个键
   * @returns {boolean} 是否互斥
   */
  const isExclusive = (key1, key2) => {
    return exclusiveRules.value.groups.some(group =>
      group.includes(key1) && group.includes(key2)
    )
  }

  /**
   * 检查键是否为单选限制
   * @param {string} key - 键名
   * @returns {boolean} 是否为单选
   */
  const isSingleSelect = (key) => {
    return singleSelectKeys.value.includes(key)
  }

  /**
   * 获取键所属的分组
   * @param {string} key - 键名
   * @returns {string|null} 分组名称，如果不属于任何分组则返回 null
   */
  const getKeyGroup = (key) => {
    for (const [groupName, keys] of Object.entries(keyGroups.value)) {
      if (keys.includes(key)) {
        return groupName
      }
    }
    return null
  }

  return {
    // 数据
    keyValueMap,
    availableKeys,
    exclusiveRules,
    singleSelectKeys,
    keyGroups,

    // 方法
    getKeyValues,
    isExclusive,
    isSingleSelect,
    getKeyGroup
  }
}
