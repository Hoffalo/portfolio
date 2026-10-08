import type { ReactNode } from "react";

/** A titled group of content on a boring-mode page. */
export function Block({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`block ${className}`}>
      {title && <h2 className="block__title">{title}</h2>}
      {children}
    </section>
  );
}
