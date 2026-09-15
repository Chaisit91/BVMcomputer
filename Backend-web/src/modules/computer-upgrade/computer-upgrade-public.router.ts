import { Router } from 'express'
import { assertValidComputerUpgradeSubmission } from '../../schemas/computerUpgradePublic.schema'
import { computerUpgradeService } from './computer-upgrade.service'

export const computerUpgradePublicRouter = Router()

// No auth — this is the endpoint a future storefront submission form calls
// directly (no customer login exists yet). Only customer-owned fields are
// ever read from the body; admin/AI-only fields (newProductId,
// newProductPrice, aiRecommendation, verifiedByAdmin, status) are set here
// by the server, never taken from the request, no matter what a caller sends.
computerUpgradePublicRouter.post('/', async (req, res) => {
  const data = assertValidComputerUpgradeSubmission(req.body)

  const created = await computerUpgradeService.create({
    customerNameSnapshot: data.customerName,
    customerPhone: data.customerPhone,
    notes: data.notes,
    status: 'pending_review',
    items: data.items.map((item) => ({
      slot: item.slot,
      oldItemDescription: item.oldItemDescription,
      customerWantsUpgrade: item.customerWantsUpgrade,
    })),
  })

  res.status(201).json({ id: created!.id })
})
