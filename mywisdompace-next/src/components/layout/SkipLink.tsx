/**
 * SkipLink — accessibility skip-to-content link.
 * Visually hidden until focused via keyboard (Tab key).
 * Allows keyboard/screen-reader users to bypass the navigation.
 */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className={[
        // Visually hidden by default
        'sr-only',
        // Visible when focused
        'focus:not-sr-only',
        'focus:fixed focus:left-2 focus:top-2 focus:z-[9999]',
        'focus:rounded-md focus:bg-white focus:px-4 focus:py-2',
        'focus:text-sm focus:font-semibold focus:text-wp-ink',
        'focus:shadow-md focus:outline-none focus:ring-2 focus:ring-wp-accent',
      ].join(' ')}
    >
      跳至主要内容
    </a>
  );
}
