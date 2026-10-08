import type { VideoWork } from "../../content/videos";
import { thumbnailUrl } from "../../services/videoSources";

/** An explicit thumbnail wins over the one the hosting provider generates. */
export const videoThumbnail = (video: VideoWork) =>
  video.thumbnail ?? (video.source && thumbnailUrl(video.source));
