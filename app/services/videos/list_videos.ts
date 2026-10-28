import Video from '#models/video'

type ListVideosFilters = {
  userId?: number
  status?: 'ready' | 'processing' | 'failed'
  visibility?: 'public' | 'private'
  course?: boolean
}

type ListVideosOptions = {
  filters?: ListVideosFilters
  withViews?: boolean
}

export default async function listVideos({
  filters = {},
  withViews = false,
}: ListVideosOptions = {}) {
  const query = Video.query()
    .if(filters.userId !== undefined, (q) => q.where('videos.user_id', filters.userId!))
    .if(filters.status, (q) => q.where('videos.status', filters.status!))
    .if(filters.visibility, (q) => q.where('videos.visibility', filters.visibility!))

  if (withViews) {
    query
      .select('videos.*')
      .count('views.id as views_count')
      .leftJoin('views', 'videos.id', 'views.video_id')
      .groupBy('videos.id')
  }

  return query
}
