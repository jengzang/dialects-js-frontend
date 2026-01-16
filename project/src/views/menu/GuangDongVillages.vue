<template>
  <div style="width: 100%;justify-content: center;align-items:center;display: flex;flex-direction: column">
    <h2 style="margin: 0;">全粵村情</h2>
    <UniversalTable
        db-key="village"
        table-name="广东省自然村"
        :columns="spokenColumns"
    />
  </div>
</template>

<script setup>
import UniversalTable from '@/components/UniversalTable.vue';

const spokenColumns = [
  {key: '市级', label: '地级', filterable: false, width: 0.8},
  {key: '区县级', label: '縣級', filterable: false, width: 0.8},
  {key: '乡镇级', label: '鎮級', filterable: false, width: 0.8},
  {key: '行政村', label: '行政村', filterable: true, width: 0.8},
  {key: '自然村', label: '自然村', filterable: true, width: 1.5},
  {key: '方言分布', label: '方言', filterable: true, width: 1},
  {key: 'longitude', label: '經度', filterable: true, width: 1},
  {key: 'latitude', label: '緯度', filterable: true, width: 1},

];
</script>