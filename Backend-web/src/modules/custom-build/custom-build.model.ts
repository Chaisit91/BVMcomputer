import { prisma } from '../../lib/prisma'
import type {
  CustomBuild as CustomBuildRecord,
  CustomBuildComponent as CustomBuildComponentRecord,
} from '../../../generated/prisma'

export const CustomBuild = prisma.customBuild
export const CustomBuildComponent = prisma.customBuildComponent
export type { CustomBuildRecord, CustomBuildComponentRecord }
