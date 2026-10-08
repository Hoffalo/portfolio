import type { VideoWork } from "../../content/videos";
import { useLocale } from "../../i18n/LocaleContext";
import { embedUrl, watchUrl } from "../../services/videoSources";
import { ExternalLink } from "../../ui/ExternalLink";
import { videoThumbnail } from "./videoThumbnail";

function ComingSoon({ video }: { video: VideoWork }) {
  const { t, ui } = useLocale();
  return (
    <div className="video-placeholder">
      <span className="video-placeholder__title">{t(video.title)}</span>
      <span className="video-placeholder__badge">{ui.comingSoon}</span>
    </div>
  );
}

export function VideoThumbnail({ video }: { video: VideoWork }) {
  const src = videoThumbnail(video);
  return (
    <div className={`video-thumb video-thumb--${video.orientation}`}>
      {src ? <img src={src} alt="" loading="lazy" /> : <ComingSoon video={video} />}
    </div>
  );
}

export function VideoPlayer({ video }: { video: VideoWork }) {
  const { t } = useLocale();
  const { source } = video;
  return (
    <div className={`video-player video-player--${video.orientation}`}>
      {!source ? (
        <ComingSoon video={video} />
      ) : source.provider === "file" ? (
        <video src={source.src} poster={source.poster} controls autoPlay playsInline />
      ) : (
        <iframe
          src={embedUrl(source)}
          title={t(video.title)}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      )}
    </div>
  );
}

export function VideoCredits({ video }: { video: VideoWork }) {
  const { t, ui } = useLocale();
  return (
    <div className="video-credits">
      <h3 className="video-credits__title">{t(video.title)}</h3>
      <p className="muted">
        {video.client} · {t(video.role)} · {video.year}
      </p>
      {video.source && <ExternalLink href={watchUrl(video.source)}>{ui.watch}</ExternalLink>}
    </div>
  );
}
