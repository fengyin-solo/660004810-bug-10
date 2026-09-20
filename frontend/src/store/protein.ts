import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import type { Conformation, SamplingResult, ProteinParams } from '@/types'

export interface StaleBatch {
  batchId: number
  params: ProteinParams
  result: SamplingResult
}

export const useProteinStore = defineStore('protein', () => {
  const loading = ref(false)
  const result = ref<SamplingResult | null>(null)
  const error = ref('')
  const lastParams = ref<ProteinParams | null>(null)
  const batchId = ref(0)
  const staleBatch = ref<StaleBatch | null>(null)
  const selectedConformation = ref<Conformation | null>(null)
  const selectedCluster = ref('all')

  let requestSeq = 0

  function extractError(err: unknown): string {
    if (axios.isAxiosError(err)) {
      const detail = err.response?.data?.detail
      if (typeof detail === 'string' && detail) return detail
      if (err.code === 'ECONNABORTED') return '请求超时，请稍后重试'
      if (err.response) return `服务端返回错误（${err.response.status}）`
      if (err.request) return '无法连接到计算服务，请检查服务后重试'
    }
    return err instanceof Error ? err.message : '构象计算失败，请重试'
  }

  async function runSampling(params: ProteinParams) {
    const seq = ++requestSeq
    // 发起新的一批：当前结果收为“旧批次”，选择状态与筛选复位，保证所有面板同源
    if (result.value) {
      staleBatch.value = { batchId: batchId.value, params: lastParams.value!, result: result.value }
    }
    result.value = null
    selectedConformation.value = null
    selectedCluster.value = 'all'
    error.value = ''
    lastParams.value = { ...params }
    loading.value = true
    try {
      const { data } = await axios.post<SamplingResult>('/api/sample', params)
      if (seq !== requestSeq) return // 已被更新的请求取代，丢弃过期响应
      result.value = data
      staleBatch.value = null
      batchId.value += 1
    } catch (err) {
      if (seq !== requestSeq) return
      error.value = extractError(err)
    } finally {
      if (seq === requestSeq) loading.value = false
    }
  }

  function retry() {
    if (lastParams.value) return runSampling(lastParams.value)
  }

  function selectConformation(conf: Conformation) { selectedConformation.value = conf }
  function filterByCluster(cluster: string) { selectedCluster.value = cluster }

  return {
    loading, result, error, lastParams, batchId, staleBatch,
    selectedConformation, selectedCluster,
    runSampling, retry, selectConformation, filterByCluster
  }
})
