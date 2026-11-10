import { prisma } from '../../lib/prisma'
import type {
  ComputerUpgrade as ComputerUpgradeRecord,
  ComputerUpgradeItem as ComputerUpgradeItemRecord,
} from '../../../generated/prisma'

export const ComputerUpgrade = prisma.computerUpgrade
export const ComputerUpgradeItem = prisma.computerUpgradeItem
export type { ComputerUpgradeRecord, ComputerUpgradeItemRecord }
