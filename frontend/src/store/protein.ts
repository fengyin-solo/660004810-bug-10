import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import type { Conformation, SamplingResult, ProteinParams } from '@/types'

export const useProteinStore = defineStore('protein', () => {
  const loading = ref(false)
  const result = ref<SamplingResult | null>(null)
  const error = ref<string | null>(null)
  // true 表示当前展示的 result 是上一批次的旧数据（新请求进行中或已失败）
  const stale = ref(false)
  const lastParams = ref<ProteinParams | null>(null)
  const selectedConformation = ref<Conformation | null>(null)
  const selectedCluster = ref('all')

  async function runSampling(params: ProteinParams) {
    lastParams.value = { ...params }
    loading.value = true
    error.value = null
    if (result.value) stale.value = true
    try {
      const { data } = await axios.post('/api/sample', params)
      result.value = data
      stale.value = false
      selectedConformation.value = null
      selectedCluster.value = 'all'
    } catch (e: any) {
      error.value = e?.response?.data?.detail || e?.message || '采样请求失败，请检查后端服务'
    } finally {
      loading.value = false
    }
  }

  function retry() {
    if (lastParams.value) return runSampling(lastParams.value)
  }

  function selectConformation(conf: Conformation) { selectedConformation.value = conf }
  function filterByCluster(cluster: string) { selectedCluster.value = cluster }

  return { loading, result, error, stale, lastParams, selectedConformation, selectedCluster, runSampling, retry, selectConformation, filterByCluster }
})
