import type { LocaleContextValue } from "../../i18n/LocaleContext";
import type { Localized } from "../../i18n/locale";
import { shorten } from "../../shared/text";
import type { Exhibit } from "../types";
import { applyRuleFor, type RulesByKind } from "./catalog/byKind";
import type { ShelfItem } from "./catalog/types";
import { ShelfGrid } from "./ShelfGrid";
import { VideoDetail } from "./VideoMedia";

const TEASER_LENGTH = 70;

/** A shelf item next to the exhibit it becomes, so views can draw the item and open the exhibit. */
export interface ShelfEntry {
  item: ShelfItem;
  exhibit: Exhibit;
}

export type ShelfContext = Pick<LocaleContextValue, "t" | "ui">;

/**
 * Factory Method: what an exhibit looks like and does depends on the kind of item, chosen from a
 * table rather than a chain of ifs. Videos hang as paintings and play in a popup; collections are
 * wide screens opening a grid of their videos; links are posters that leave the site.
 */
export function toShelfEntry(item: ShelfItem, context: ShelfContext): ShelfEntry {
  return { item, exhibit: applyRuleFor(exhibitFactories(context), item) };
}

function exhibitFactories({ t, ui }: ShelfContext): RulesByKind<Exhibit> {
  const teaserOf = (description?: Localized) =>
    description ? [shorten(t(description), TEASER_LENGTH)] : [];

  return {
    video: (video) => ({
      id: video.id,
      label: t(video.title),
      furniture: video.orientation === "portrait" ? "painting-tall" : "painting-wide",
      image: video.thumbnail,
      teaser: teaserOf(video.description),
      detail: <VideoDetail video={video} />,
      detailLayout: "theater",
    }),
    collection: (collection) => ({
      id: `collection:${collection.id}`,
      label: t(collection.title),
      furniture: "screen",
      image: collection.thumbnail,
      teaser: [ui.videoCount(collection.videos.length), ...teaserOf(collection.description)],
      detail: (
        <>
          {collection.description && (
            <p className="video-detail__description">{t(collection.description)}</p>
          )}
          <ShelfGrid
            layout="pairs"
            entries={collection.videos.map((video) => toShelfEntry(video, { t, ui }))}
          />
        </>
      ),
      detailLayout: "theater",
    }),
    link: (link) => ({
      id: link.id,
      label: t(link.title),
      furniture: "poster",
      image: link.thumbnail,
      teaser: [new URL(link.url).hostname.replace(/^www\./, ""), ...teaserOf(link.description)],
      href: link.url,
    }),
  };
}
