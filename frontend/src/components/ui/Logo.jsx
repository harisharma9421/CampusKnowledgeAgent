import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * Logo Component
 * Renders the Campus Knowledge Agent brand mark.
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} linkTo - Whether to wrap in a Link to home
 */
const Logo = ({ size = 'md', linkTo = true }) => {
  const sizes = {
    sm: { icon: 'w-7 h-7 text-base', text: 'text-sm', sub: 'hidden' },
    md: { icon: 'w-8 h-8 text-lg', text: 'text-base', sub: 'text-xs' },
    lg: { icon: 'w-10 h-10 text-xl', text: 'text-lg', sub: 'text-sm' },
  };

  const s = sizes[size] || sizes.md;

  const content = (
    <div className="flex items-center gap-2.5">
      {/* Icon mark */}
      <div
        className={`${s.icon} rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center shrink-0 shadow-xs`}
      >
        <span role="img" aria-label="graduation cap">🎓</span>
      </div>

      {/* Text mark */}
      <div className="min-w-0">
        <p className={`${s.text} font-bold text-surface-900 leading-tight`}>
          Campus<span className="text-primary-600">KA</span>
        </p>
        {size !== 'sm' && (
          <p className={`${s.sub} text-surface-500 leading-tight`}>Knowledge Agent</p>
        )}
      </div>
    </div>
  );

  if (linkTo) {
    return (
      <Link to="/" className="focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary-500 rounded-lg">
        {content}
      </Link>
    );
  }

  return content;
};

Logo.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  linkTo: PropTypes.bool,
};

export default Logo;
