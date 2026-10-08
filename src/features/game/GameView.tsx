import { useState } from "react";
import { useLocale } from "../../i18n/LocaleContext";
import { findSection } from "../../sections/registry";
import { useTheme } from "../../theme/ThemeContext";
import { RoomView } from "./RoomView";
import { TownView } from "./TownView";

interface GameViewProps {
  roomId?: string;
  onEnterRoom: (sectionId: string) => void;
  onLeaveRoom: () => void;
}

export function GameView({ roomId, onEnterRoom, onLeaveRoom }: GameViewProps) {
  const section = roomId ? findSection(roomId) : undefined;
  // Remember the last room so leaving it puts the player back at that building's door.
  const [lastRoomId, setLastRoomId] = useState(roomId);
  if (section && lastRoomId !== section.id) setLastRoomId(section.id);

  return (
    <>
      {section ? (
        <RoomView key={section.id} section={section} onExit={onLeaveRoom} />
      ) : (
        <TownView arrivingFrom={lastRoomId} onEnter={onEnterRoom} />
      )}
      <SecretBanner />
    </>
  );
}

/** Announces the Konami-code world once, when it opens; it lives here so changing rooms doesn't replay it. */
function SecretBanner() {
  const { secret } = useTheme();
  const { ui } = useLocale();
  if (!secret) return null;
  return (
    <p className="secret-banner" role="status">
      {ui.secretWorld}
      <small>{ui.secretHint}</small>
    </p>
  );
}
