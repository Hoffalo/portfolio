import { useState } from "react";
import { videos } from "../../content/videos";
import { useLocale } from "../../i18n/LocaleContext";
import { VideoCredits, VideoPlayer, VideoThumbnail } from "./VideoMedia";

export function VideoPage() {
  const { t } = useLocale();
  const [selectedId, setSelectedId] = useState(videos[0]?.id);
  const selected = videos.find((video) => video.id === selectedId);

  return (
    <div className="video-page">
      {selected && (
        <section className="video-stage" aria-live="polite">
          <VideoPlayer key={selected.id} video={selected} />
          <VideoCredits video={selected} />
        </section>
      )}
      <ul className="video-grid">
        {videos.map((video) => (
          <li key={video.id}>
            <button
              type="button"
              className="video-card"
              aria-pressed={video.id === selectedId}
              onClick={() => setSelectedId(video.id)}
            >
              <VideoThumbnail video={video} />
              <span className="video-card__title">{t(video.title)}</span>
              <span className="video-card__meta">
                {video.client} · {video.year}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
