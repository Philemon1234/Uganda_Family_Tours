import { supabase } from '../lib/supabaseClient'
import type { TripAdvisorReview } from '../data/reviews'

type TripAdvisorReviewRow = {
  review_id: string
  author_name: string | null
  author_image: string | null
  rating: number | null
  review_text: string | null
  review_date: string | null
  created_at: string | null
}

export async function getPublishedTripAdvisorReviews(): Promise<TripAdvisorReview[]> {
  if (!supabase) return []

  const { data, error } = await supabase
    .from('tripadvisor_reviews')
    .select('review_id,author_name,author_image,rating,review_text,review_date,created_at')
    .order('review_date', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(18)

  if (error) {
    console.warn('Unable to load TripAdvisor reviews:', error.message)
    return []
  }

  return ((data ?? []) as TripAdvisorReviewRow[])
    .filter((row) => row.review_id && row.review_text)
    .map((row) => ({
      id: row.review_id,
      name: row.author_name || 'TripAdvisor traveler',
      country: '',
      date: row.review_date || row.created_at || '',
      rating: row.rating || 5,
      profileImage: row.author_image || '/assets/UFT-Favicon.png',
      sourceUrl: 'https://www.tripadvisor.com/Attraction_Review-g608446-d23143576-Reviews-Uganda_Family_Tours_Travel-Fort_Portal_Western_Region.html',
      title: 'TripAdvisor review',
      text: row.review_text || '',
    }))
}
