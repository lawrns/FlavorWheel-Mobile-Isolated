import { supabase } from '@/lib/supabase'

export interface UserMetrics {
  totalTastings: number
  totalReviews: number
  averageRating: number
  favoriteBeverage?: string
}

export async function getUserMetrics(userId: string): Promise<UserMetrics> {
  // Total tastings created by user
  const { count: tastingsCount } = await supabase
    .from('tastings')
    .select('*', { count: 'exact', head: true })
    .eq('created_by', userId)

  // Reviews by user for rating average
  const { data: reviews } = await supabase
    .from('user_reviews')
    .select('rating')
    .eq('user_id', userId)

  const typedReviews: Array<{ rating: number | null }> = (reviews as Array<{ rating: number | null }>) || []
  const totalReviews = typedReviews.length
  const averageRating = totalReviews > 0
    ? typedReviews.reduce((sum: number, r: { rating: number | null }) => sum + (r.rating || 0), 0) / totalReviews
    : 0

  // Favorite beverage (best effort, optional): most frequent item type in tasting_items joined to tastings
  let favoriteBeverage: string | undefined
  try {
    const { data: items } = await supabase
      .from('tasting_items')
      .select('type, tasting_id')

    const { data: tastings } = await supabase
      .from('tastings')
      .select('id, created_by')
      .eq('created_by', userId)

    const typedItems: Array<{ type: string | null; tasting_id: string | null }> = (items as Array<{ type: string | null; tasting_id: string | null }>) || []
    const typedTastings: Array<{ id: string; created_by: string }> = (tastings as Array<{ id: string; created_by: string }>) || []

    const tastingIds = new Set(typedTastings.map((t) => t.id))
    const counts: Record<string, number> = {}
    for (const it of typedItems) {
      if (it.tasting_id && tastingIds.has(it.tasting_id) && it.type) {
        counts[it.type] = (counts[it.type] || 0) + 1
      }
    }
    const top = Object.entries(counts).sort((a: [string, number], b: [string, number]) => b[1] - a[1])[0]
    favoriteBeverage = top?.[0]
  } catch {
    // optional feature, ignore errors
  }

  return {
    totalTastings: tastingsCount || 0,
    totalReviews,
    averageRating,
    favoriteBeverage,
  }
}
