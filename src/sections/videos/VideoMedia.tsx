import { useLocale } from "../../i18n/LocaleContext";
import { embedUrl, watchUrl } from "../../services/videoSources";
import { ExternalLink } from "../../ui/ExternalLink";
import type { ShelfItem, VideoWork } from "./catalog/types";

export function VideoPlayer({ video }: { video: VideoWork }) {
  const { t } = useLocale();
  const { source } = video;
  return (
    <div className={`video-player video-player--${video.orientation}`}>
      {source.provider === "file" ? (
        <video src={source.src} poster={video.poster} controls autoPlay playsInline />
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

/** What a video's popup holds; its title is already on the popup's nameplate. */
export function VideoDetail({ video }: { video: VideoWork }) {
  const { t, ui } = useLocale();
  return (
    <div className="video-detail">
      <VideoPlayer video={video} />
      {video.description && <p className="video-detail__description">{t(video.description)}</p>}
      {video.source.provider !== "file" && (
        <ExternalLink href={watchUrl(video.source)}>{ui.watch}</ExternalLink>
      )}
    </div>
  );
}

interface ShelfTileProps {
  item: ShelfItem;
  thumbnail?: string;
  onOpen: () => void;
}

/** A thumbnail with a nameplate. Collections and links say what they are, since they don't play. */
export function ShelfTile({ item, thumbnail, onOpen }: ShelfTileProps) {
  const { t, ui } = useLocale();
  const title = t(item.title);
  return (
    <button
      type="button"
      className="shelf-tile"
      data-kind={item.kind}
      aria-label={item.kind === "link" ? `${title} ↗` : title}
      onClick={onOpen}
    >
      <span className="shelf-tile__frame" data-orientation={orientationOf(item)}>
        {thumbnail ? (
          <img src={thumbnail} alt="" loading="lazy" />
        ) : (
          <span className="shelf-tile__placeholder" aria-hidden="true">
            ▶
          </span>
        )}
        {item.kind === "collection" && (
          <span className="shelf-tile__badge">{ui.videoCount(item.videos.length)}</span>
        )}
        {item.kind === "link" && <span className="shelf-tile__badge">↗</span>}
      </span>
      <span className="shelf-tile__title">{title}</span>
    </button>
  );
}

const orientationOf = (item: ShelfItem) => (item.kind === "video" ? item.orientation : "landscape");
