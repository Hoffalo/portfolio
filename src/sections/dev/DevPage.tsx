import { useLocale } from "../../i18n/LocaleContext";
import { AsyncContent } from "../../ui/AsyncContent";
import { Block } from "../../ui/Block";
import { ContributionGraph } from "./ContributionGraph";
import { GitHubHeader } from "./GitHubHeader";
import { LanguageBar } from "./LanguageBar";
import { RepoBrowser } from "./RepoBrowser";
import { devLabels } from "./labels";
import { useContributions, useGitHubRepos } from "./useGitHub";

export function DevPage() {
  const { t, ui } = useLocale();
  const repos = useGitHubRepos();
  const contributions = useContributions();

  return (
    <div className="page-grid">
      <Block className="page-grid__wide">
        <AsyncContent state={repos}>{(data) => <GitHubHeader repos={data} />}</AsyncContent>
        <AsyncContent state={contributions}>
          {(calendar) => <ContributionGraph calendar={calendar} />}
        </AsyncContent>
      </Block>
      <Block title={ui.languages} className="page-grid__wide">
        <AsyncContent state={repos}>{(data) => <LanguageBar repos={data} />}</AsyncContent>
      </Block>
      <Block title={t(devLabels.repositories)} className="page-grid__wide">
        <AsyncContent state={repos}>{(data) => <RepoBrowser repos={data} />}</AsyncContent>
      </Block>
    </div>
  );
}
