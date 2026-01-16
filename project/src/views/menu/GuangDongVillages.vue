<template>
  <div>
    <h2>数据库 1: 语料库 (yc_spoken.db)</h2>
    <UniversalTable
        db-key="spoken"
        table-name="words"
        :columns="spokenColumns"
    />
  </div>
</template>

<script setup>
import UniversalTable from '@/components/UniversalTable.vue';
const spokenColumns = [
  { key: '本字考', label: '本字考', filterable: false },
  { key: 'IPA', label: 'IPA', filterable: false },
  { key: '粤拼', label: '粵拼', filterable: false },
  { key: '来源', label: '來源', filterable: true },
  { key: '声母', label: '聲母', filterable: true},
  { key: '韵母', label: '韻母', filterable: true},
  { key: '音调', label: '聲調', filterable: true},
  { key: '词性', label: '詞性', filterable: true},
  { key: '例词例句', label: '例詞例句', filterable: false },
  { key: '待校及说明', label: '待校', filterable: true },
];
</script>