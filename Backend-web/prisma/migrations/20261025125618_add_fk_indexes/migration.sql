-- CreateIndex
CREATE INDEX "AdminLoginHistory_adminId_idx" ON "AdminLoginHistory"("adminId");

-- CreateIndex
CREATE INDEX "AdminRoleHistory_adminId_idx" ON "AdminRoleHistory"("adminId");

-- CreateIndex
CREATE INDEX "ChatMessage_conversationId_idx" ON "ChatMessage"("conversationId");

-- CreateIndex
CREATE INDEX "ChatMessage_senderAdminId_idx" ON "ChatMessage"("senderAdminId");

-- CreateIndex
CREATE INDEX "DesktopPcHighlight_desktopPcId_idx" ON "DesktopPcHighlight"("desktopPcId");

-- CreateIndex
CREATE INDEX "PromoSetExtraPart_promoSetId_idx" ON "PromoSetExtraPart"("promoSetId");

-- CreateIndex
CREATE INDEX "PromoSetHighlight_promoSetId_idx" ON "PromoSetHighlight"("promoSetId");

-- CreateIndex
CREATE INDEX "PromoSetVideoLink_promoSetId_idx" ON "PromoSetVideoLink"("promoSetId");
