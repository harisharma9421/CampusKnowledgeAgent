import PropTypes from 'prop-types';

/**
 * Card — Surface container component
 * @param {boolean} hoverable - Adds hover shadow effect
 * @param {string} className - Additional Tailwind classes
 */
const Card = ({ children, hoverable = false, className = '', ...props }) => {
  return (
    <div
      className={`bg-white rounded-xl border border-surface-200 shadow-card ${hoverable ? 'transition-shadow duration-200 hover:shadow-card-hover' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  hoverable: PropTypes.bool,
  className: PropTypes.string,
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-b border-surface-100 ${className}`}>{children}</div>
);
CardHeader.propTypes = { children: PropTypes.node.isRequired, className: PropTypes.string };

export const CardBody = ({ children, className = '' }) => (
  <div className={`px-6 py-4 ${className}`}>{children}</div>
);
CardBody.propTypes = { children: PropTypes.node.isRequired, className: PropTypes.string };

export const CardFooter = ({ children, className = '' }) => (
  <div className={`px-6 py-4 border-t border-surface-100 ${className}`}>{children}</div>
);
CardFooter.propTypes = { children: PropTypes.node.isRequired, className: PropTypes.string };

export default Card;
