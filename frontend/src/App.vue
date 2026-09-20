<template>
  <div class="app-container">
    <header class="app-header">
      <h1>🧬 蛋白质折叠构象采样与分析平台</h1>
      <p class="subtitle">Ramachandran图 · LJ势能计算 · 3D骨架可视化</p>
    </header>
    <main class="app-main">
      <ControlPanel @sample="handleSample" />
      <el-alert
        v-if="store.error"
        type="error"
        class="result-alert"
        :closable="false"
        show-icon
      >
        <template #title>
          <span class="alert-title">构象采样失败：{{ store.error }}</span>
          <el-button
            size="small"
            type="danger"
            plain
            class="retry-btn"
            :loading="store.loading"
            @click="handleRetry"
          >重新发起采样</el-button>
        </template>
        <p v-if="store.result" class="alert-note">下方展示的仍是上一批成功的构象数据（旧批次），并非本次请求结果。</p>
      </el-alert>
      <el-alert
        v-else-if="store.stale && store.result"
        type="warning"
        class="result-alert"
        :closable="false"
        show-icon
        :title="store.loading ? '正在生成新一批构象… 下方为上一批数据（旧批次）' : '下方展示的是上一批构象数据（旧批次）'"
      />
      <div class="result-area" :class="{ 'is-stale': store.stale && store.result }">
        <div class="main-grid" v-if="store.result">
          <div class="plot-area"><RamachandranPlot /></div>
          <div class="viewer-area"><ProteinViewer3D /></div>
        </div>
        <ConformationTable v-if="store.result" />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import ControlPanel from "./components/ControlPanel.vue"
import RamachandranPlot from "./components/RamachandranPlot.vue"
import ProteinViewer3D from "./components/ProteinViewer3D.vue"
import ConformationTable from "./components/ConformationTable.vue"
import { useProteinStore } from "./store/protein"
import type { ProteinParams } from "./types"

const store = useProteinStore()
function handleSample(params: ProteinParams) { store.runSampling(params) }
function handleRetry() { store.retry() }
</script>

<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui,sans-serif;background:#f0f2f5}
.app-container{min-height:100vh}
.app-header{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;padding:24px 40px}
.app-header h1{font-size:clamp(1rem,4.5vw,1.8rem);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.subtitle{opacity:.85;margin-top:4px;font-size:.9rem}
.app-main{padding:20px 40px}
.result-alert{margin-top:4px;margin-bottom:16px}
.alert-title{margin-right:12px}
.retry-btn{vertical-align:middle}
.alert-note{margin-top:6px;font-size:13px}
.result-area.is-stale{opacity:.55;filter:saturate(.6)}
.main-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px;margin-top:20px}
.main-grid>*{min-width:0}
@media (max-width:900px){
  .main-grid{grid-template-columns:1fr}
}
@media (max-width:640px){
  .app-header{padding:16px}
  .app-main{padding:16px}
}
</style>
