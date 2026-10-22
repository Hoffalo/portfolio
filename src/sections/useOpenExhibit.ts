import { useCallback } from "react";
import { openExternal } from "../shared/openExternal";
import { usePopups } from "../ui/popup/PopupContext";
import type { Exhibit } from "./types";

/** Opening an exhibit means the same thing in a room, in boring mode, or from inside another popup. */
export function useOpenExhibit() {
  const { open } = usePopups();
  return useCallback(
    (exhibit: Exhibit) => {
      if (exhibit.detail)
        open({
          title: exhibit.label,
          variant: exhibit.detailLayout ?? "dialog",
          content: exhibit.detail,
        });
      else if (exhibit.href) openExternal(exhibit.href);
    },
    [open],
  );
}
