import type Video from '#models/video'
import storage from '#services/storage/index'

export default function toVideoCard(video: Video, { relativeDate = true }) {
  return {
    id: video.id,
    title: video.title,
    views: Number(video.$extras.views_count),
    thumbnailUrl: video.thumbnailKey ? storage.url(video.thumbnailKey) : null,
    url: storage.url(video.storageKey),
    channelId: video.user.id,
    channel: video.user.fullName ?? video.user.email,
    postedAt: relativeDate
      ? (video.createdAt?.toRelative() ?? '')
      : (video.createdAt?.toISO() ?? ''),
  }
}
