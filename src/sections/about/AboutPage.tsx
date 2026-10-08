import { useLocale } from "../../i18n/LocaleContext";
import { Block } from "../../ui/Block";
import { EducationList, InterestList, LanguageList, ProfileCard, SkillGroups } from "./AboutBlocks";
import { aboutLabels } from "./labels";

export function AboutPage() {
  const { t } = useLocale();
  return (
    <div className="page-grid">
      <Block className="page-grid__wide">
        <ProfileCard />
      </Block>
      <Block title={t(aboutLabels.skills)}>
        <SkillGroups />
      </Block>
      <Block title={t(aboutLabels.languages)}>
        <LanguageList />
      </Block>
      <Block title={t(aboutLabels.education)}>
        <EducationList />
      </Block>
      <Block title={t(aboutLabels.interests)}>
        <InterestList />
      </Block>
    </div>
  );
}
