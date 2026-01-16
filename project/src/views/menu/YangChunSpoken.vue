<template>
  <div style="width: 100%;justify-content: center;align-items:center;display: flex;flex-direction: column">
    <h2 style="margin: 0;">陽春口語詞</h2>
    <UniversalTable
        db-key="spoken"
        table-name="口语字"
        :columns="spokenColumns"
    />
  </div>
</template>

<script setup>
import UniversalTable from '@/components/UniversalTable.vue';
const spokenColumns = [
  { key: '本字考', label: '字', filterable: false,width:1 },
  { key: 'IPA', label: 'IPA', filterable: false,width:0.8 },
  { key: '粤拼', label: '粵拼', filterable: false,width:0.8 },
  { key: '来源', label: '來源', filterable: true,width:0.8 },
  { key: '声母', label: '聲', filterable: true,width:0.5},
  { key: '韵母', label: '韻', filterable: true,width:0.8},
  { key: '音调', label: '調', filterable: true,width:0.5},
  { key: '词性', label: '詞性', filterable: true,width:1},
  { key: '释义', label: '釋義', filterable: false,width:2 },
  { key: '例词例句', label: '例詞例句', filterable: false,width:2 },
  { key: '待校及说明', label: '待校', filterable: true ,width:0.8},
];
</script>