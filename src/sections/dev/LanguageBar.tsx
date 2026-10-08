import type { Repo } from "../../services/github";
import { languageColor, languageShares } from "./repoModel";

export function LanguageBar({ repos }: { repos: readonly Repo[] }) {
  const shares = languageShares(repos);
  return (
    <div className="language-bar">
      <div className="language-bar__track" aria-hidden="true">
        {shares.map(({ language, share }) => (
          <span
            key={language}
            style={{ width: `${share * 100}%`, background: languageColor(language) }}
          />
        ))}
      </div>
      <ul className="language-bar__legend">
        {shares.map(({ language, share }) => (
          <li key={language}>
            <span
              className="language-dot"
              style={{ background: languageColor(language) }}
              aria-hidden="true"
            />
            {language} <span className="muted">{Math.round(share * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
