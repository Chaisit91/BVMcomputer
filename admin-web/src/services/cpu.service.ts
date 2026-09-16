import { api } from '../lib/api'
import { toPromoPriceField } from '../lib/promoPrice'
import type { CpuFormValues } from '../schemas/cpu.schema'
import type { Cpu, CpuBenchmark } from '../types/cpu'

// Prisma Decimal columns (sellingPrice, costPrice, promoPrice,
// baseFrequencyGhz, maxTurboFrequencyGhz, CpuBenchmark.score) serialize to
// JSON as strings, not numbers — normalize them back on every read.
function toNum(value: unknown): number {
  return value == null ? 0 : Number(value)
}

function mapCpu(raw: any): Cpu {
  return {
    ...raw,
    sellingPrice: toNum(raw.sellingPrice),
    costPrice: raw.costPrice == null ? null : toNum(raw.costPrice),
    promoPrice: raw.promoPrice == null ? null : toNum(raw.promoPrice),
    baseFrequencyGhz: toNum(raw.baseFrequencyGhz),
    maxTurboFrequencyGhz: toNum(raw.maxTurboFrequencyGhz),
    benchmarks: (raw.benchmarks ?? []).map((b: any) => ({ ...b, score: toNum(b.score) })),
  }
}

type CpuSubmit = CpuFormValues & { benchmarks: CpuBenchmark[]; videoLinks: string[] }

function toPayload(data: CpuSubmit) {
  const { promoEnabled, promoPrice, benchmarks, videoLinks, ...rest } = data
  return {
    ...rest,
    promoPrice: toPromoPriceField(promoEnabled, promoPrice),
    benchmarks: benchmarks.map(({ name, score, unit }) => ({ name, score, unit })),
    videoLinks,
  }
}

export function getCpus(): Promise<Cpu[]> {
  return api.get<any[]>('/cpus').then((res) => res.data.map(mapCpu))
}

export function getCpuDetail(id: string): Promise<Cpu | null> {
  return api
    .get<any>(`/cpus/${id}`)
    .then((res) => mapCpu(res.data))
    .catch(() => null)
}

export function saveCpu(id: string, data: CpuSubmit): Promise<void> {
  return api.put(`/cpus/${id}`, toPayload(data)).then(() => undefined)
}

export function createCpu(data: CpuSubmit): Promise<{ id: string }> {
  return api.post<{ id: string }>('/cpus', toPayload(data)).then((res) => ({ id: res.data.id }))
}

export function deleteCpu(id: string): Promise<void> {
  return api.delete(`/cpus/${id}`).then(() => undefined)
}
