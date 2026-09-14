import { computerUpgradeRepository } from './computer-upgrade.repository'

export const computerUpgradeService = {
  list: () => computerUpgradeRepository.findMany(),
  getById: (id: string) => computerUpgradeRepository.findById(id),
  create: (data: any) => computerUpgradeRepository.create(data),
  update: (id: string, data: any) => computerUpgradeRepository.update(id, data),
  remove: (id: string) => computerUpgradeRepository.remove(id),
  setItemPhoto: (upgradeId: string, slot: string, photoUrl: string) =>
    computerUpgradeRepository.setItemPhoto(upgradeId, slot, photoUrl),
  verifyItem: (upgradeId: string, slot: string, adminId: string) =>
    computerUpgradeRepository.verifyItem(upgradeId, slot, adminId),
}
