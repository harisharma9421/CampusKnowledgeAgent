import PropTypes from 'prop-types';

/**
 * LoadingSpinner — Reusable loading indicator
 * @param {'sm'|'md'|'lg'} size
 * @param {string} label - Accessible label
 * @param {boolean} fullScreen - Center in full viewport
 */
const LoadingSpinner = ({ size = 'md', label = 'Loading...', fullScreen = false }) => {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-2',
    lg: 'w-12 h-12 border-4',
  };

  const spinner = (
    <div role="status" aria-label={label} className="flex flex-col items-center gap-3">
      <div
        className={`${sizes[size] || sizes.md} rounded-full border-surface-200 border-t-primary-600 animate-spin`}
      />
      {size !== 'sm' && (
        <p className="text-sm text-surface-500 animate-pulse">{label}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-xs z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
};

LoadingSpinner.propTypes = {
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  label: PropTypes.string,
  fullScreen: PropTypes.bool,
};

export default LoadingSpinner;
