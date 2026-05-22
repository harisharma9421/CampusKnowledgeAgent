/**
 * cn — Class name utility
 * Merges Tailwind class strings, filtering out falsy values.
 * Lightweight alternative to clsx/classnames.
 *
 * @param {...(string|boolean|null|undefined)} classes
 * @returns {string}
 */
const cn = (...classes) => classes.filter(Boolean).join(' ');

export default cn;
