<template>
  <div class="result-panels">
    <div class="main-grid">
      <div class="plot-area"><RamachandranPlot :result="result" :batch-id="batchId" /></div>
      <div class="viewer-area"><ProteinViewer3D :result="result" :batch-id="batchId" /></div>
    </div>
    <ConformationTable :result="result" />
  </div>
</template>

<script setup lang="ts">
import RamachandranPlot from './RamachandranPlot.vue'
import ProteinViewer3D from './ProteinViewer3D.vue'
import ConformationTable from './ConformationTable.vue'
import type { SamplingResult } from '../types'

defineProps<{ result: SamplingResult; batchId: number }>()
</script>
