import { experiences } from "../../content/career";
import { ExperienceCard } from "./ExperienceCard";

export function CareerPage() {
  return (
    <ol className="timeline">
      {experiences.map((experience) => (
        <li key={experience.id} className="timeline__item">
          <ExperienceCard experience={experience} />
        </li>
      ))}
    </ol>
  );
}
