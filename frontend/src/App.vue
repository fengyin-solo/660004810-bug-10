<template>
  <div class="app-container">
    <header class="app-header">
      <h1>🧬 蛋白质折叠构象采样与分析平台</h1>
      <p class="subtitle">Ramachandran图 · LJ势能计算 · 3D骨架可视化</p>
    </header>
    <main class="app-main">
      <ControlPanel @sample="handleSample" />

      <!-- 计算中：给出明确的加载反馈，旧批次已收起在下方 -->
      <div v-if="store.loading" class="status-card" role="status">
        <el-skeleton :rows="6" animated />
        <p class="status-text">⏳ 正在计算构象采样，请稍候…</p>
      </div>

      <!-- 失败：明确指出错误并提供重新发起的入口 -->
      <el-result
        v-else-if="store.error"
        class="error-result"
        icon="error"
        title="构象计算失败"
        :sub-title="store.error"
      >
        <template #extra>
          <el-button type="primary" @click="store.retry()">🔄 重新发起采样</el-button>
        </template>
      </el-result>

      <!-- 成功：当前批次的所有面板共享同一个 batchId -->
      <ResultPanels
        v-else-if="store.result"
        :key="store.batchId"
        :result="store.result"
        :batch-id="store.batchId"
      />

      <!-- 尚未发起过采样 -->
      <el-empty v-else description="设置残基数与构象数量，点击“生成构象采样”开始" />

      <!-- 本次失败/进行中时，上一批结果默认收起并明确标注为旧数据 -->
      <el-collapse v-if="store.staleBatch" v-model="oldPanels" class="stale-collapse">
        <el-collapse-item :name="store.staleBatch.batchId">
          <template #title>
            <span class="stale-title">
              ⚠ 上一批构象（旧数据，{{ store.staleBatch.params.residues }} 残基 /
              {{ store.staleBatch.params.conformations }} 个构象）
            </span>
          </template>
          <ResultPanels
            :key="store.staleBatch.batchId"
            :result="store.staleBatch.result"
            :batch-id="store.staleBatch.batchId"
          />
        </el-collapse-item>
      </el-collapse>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ControlPanel from './components/ControlPanel.vue'
import ResultPanels from './components/ResultPanels.vue'
import { useProteinStore } from './store/protein'
import type { ProteinParams } from './types'

const store = useProteinStore()
const oldPanels = ref<number[]>([])
function handleSample(params: ProteinParams) { store.runSampling(params) }
</script>

<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:system-ui,sans-serif;background:#f0f2f5}
.app-container{min-height:100vh}
.app-header{background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;padding:24px 40px}
.app-header h1{font-size:1.8rem;line-height:1.3}
.subtitle{opacity:.85;margin-top:4px;font-size:.9rem}
.app-main{padding:20px 40px}
.main-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:16px;margin-top:20px}
.main-grid > div{min-width:0}
.status-card{background:#fff;border-radius:8px;padding:24px;box-shadow:0 2px 8px rgba(0,0,0,.08)}
.status-text{text-align:center;color:#909399;font-size:14px;margin-top:8px}
.error-result{background:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,.08);margin-top:4px}
.stale-collapse{margin-top:16px;background:#fff;border-radius:8px;padding:0 16px;box-shadow:0 2px 8px rgba(0,0,0,.08)}
.stale-title{color:#e6a23c;font-size:14px;font-weight:600}
.stale-collapse .main-grid{margin-top:0}

@media (max-width:900px){
  .app-header{padding:16px 20px}
  .app-header h1{font-size:1.25rem}
  .subtitle{font-size:.8rem}
  .app-main{padding:12px}
  .main-grid{grid-template-columns:minmax(0,1fr);gap:12px}
}
</style>
