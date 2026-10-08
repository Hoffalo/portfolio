import { certificates, interests, skillGroups, spokenLanguages } from "../../content/about";
import { education } from "../../content/career";
import { profile } from "../../content/profile";
import { useLocale } from "../../i18n/LocaleContext";
import { ExternalLink } from "../../ui/ExternalLink";
import { TagList } from "../../ui/TagList";
import { aboutLabels } from "./labels";

export function ProfileCard() {
  const { t } = useLocale();
  return (
    <div className="profile-card">
      <img className="avatar" src={profile.avatarUrl} alt="" width={96} height={96} />
      <div>
        <h3 className="profile-card__name">{profile.name}</h3>
        <p className="profile-card__headline">{t(profile.headline)}</p>
        <p className="profile-card__location">{t(profile.location)}</p>
      </div>
      <div className="profile-card__bio">
        {profile.bio.map((paragraph) => (
          <p key={paragraph.en}>{t(paragraph)}</p>
        ))}
        <p>
          <a className="text-link" href={`mailto:${profile.email}`}>
            {profile.email}
          </a>
        </p>
      </div>
    </div>
  );
}

export function SkillGroups() {
  const { t } = useLocale();
  return (
    <div className="skill-groups">
      {skillGroups.map((group) => (
        <div key={group.id} className="skill-group">
          <h4 className="skill-group__title">{t(group.title)}</h4>
          <TagList tags={group.skills.map(t)} />
        </div>
      ))}
    </div>
  );
}

export function LanguageList() {
  const { t } = useLocale();
  return (
    <ul className="meters">
      {spokenLanguages.map((language) => (
        <li key={language.name.en} className="meter">
          <span className="meter__label">{t(language.name)}</span>
          <span className="meter__value">{t(language.level)}</span>
          <span className="meter__track" aria-hidden="true">
            <span className="meter__fill" style={{ width: `${language.fluency * 100}%` }} />
          </span>
        </li>
      ))}
    </ul>
  );
}

export function EducationList() {
  const { t } = useLocale();
  return (
    <div className="education">
      {education.map((school) => (
        <article key={school.id} className="education__item">
          <p className="education__years">
            {school.startYear} – {school.endYear}
          </p>
          <h4 className="education__school">{school.institution}</h4>
          <p>{t(school.credential)}</p>
          <p className="muted">{t(school.location)}</p>
          {school.details?.map((detail) => (
            <p key={detail.en}>{t(detail)}</p>
          ))}
        </article>
      ))}
      <div>
        <h4 className="skill-group__title">{t(aboutLabels.certificates)}</h4>
        <TagList tags={certificates} />
      </div>
    </div>
  );
}

export function InterestList() {
  const { t } = useLocale();
  return (
    <ul className="interests">
      {interests.map((interest) => (
        <li key={interest.id} className="interest">
          <strong className="interest__title">{t(interest.title)}</strong>
          <p>
            {t(interest.description)}{" "}
            {interest.url && (
              <ExternalLink href={interest.url}>{new URL(interest.url).hostname}</ExternalLink>
            )}
          </p>
        </li>
      ))}
    </ul>
  );
}
