"use client";

interface AboutHeroProps {
  label: string;
  title: string;
  description?: string;
  subtitle?: string;
  subtext?: string;
}

export default function AboutHero({ label, title, description, subtitle, subtext }: AboutHeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[var(--as-primary-800)] to-[var(--as-primary-600)] py-10 sm:py-14">
      <div className="as-container relative z-10 text-center">
        <p className="text-sm font-medium tracking-widest text-[var(--as-primary-200)]">
          {label}
        </p>
        <h1 className="as-serif mt-2 text-4xl font-bold text-white sm:text-5xl">
          {title}
        </h1>
        {subtitle && (
          <h2 className="as-serif mt-4 text-xl font-semibold text-white/90 sm:text-2xl">
            {subtitle}
          </h2>
        )}
        {subtext && (
          <p className="mx-auto mt-2 max-w-2xl text-base text-white/65">
            {subtext}
          </p>
        )}
        {description && (
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-white/75">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
