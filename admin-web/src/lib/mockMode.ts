// Temporary switch so the inventory-category pages can be previewed with
// sample data while the real Supabase catalog is still empty. Every
// inventory service.ts branches on this — flip to `false` to switch all of
// them back to the real backend API in one place, no per-file changes needed.
export const USE_MOCK_DATA = true
