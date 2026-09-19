import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'
import type { Conformation, SamplingResult, ProteinParams } from '@/types'

export const useProteinStore = defineStore('protein', () => {
  const loading = ref(false)
  const result = ref<SamplingResult | null>(null)
  const selectedConformation = ref<Conformation | null>(null)
  const selectedCluster = ref('all')

  async function runSampling(params: ProteinParams) {
    loading.value = true
    try {
      const { data } = await axios.post('/api/sample', params)
      result.value = data
      selectedConformation.value = null
      selectedCluster.value = 'all'
    } finally { loading.value = false }
  }

  function selectConformation(conf: Conformation) { selectedConformation.value = conf }
  function filterByCluster(cluster: string) { selectedCluster.value = cluster }

  return { loading, result, selectedConformation, selectedCluster, runSampling, selectConformation, filterByCluster }
})
