import React from 'react';
import PropTypes from 'prop-types';

/**
 * Skeleton loader component for content placeholders
 */
const Skeleton = React.memo(({ 
  width = 'w-full', 
  height = 'h-4', 
  className = '',
  count = 1,
  circle = false 
}) => {
  const baseClass = 'skeleton';
  const circleClass = circle ? 'rounded-full' : 'rounded';
  const combinedClass = `${baseClass} ${width} ${height} ${circleClass} ${className}`;

  if (count > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className={combinedClass} />
        ))}
      </div>
    );
  }

  return <div className={combinedClass} />;
});

Skeleton.displayName = 'Skeleton';

Skeleton.propTypes = {
  width: PropTypes.string,
  height: PropTypes.string,
  className: PropTypes.string,
  count: PropTypes.number,
  circle: PropTypes.bool,
};

/**
 * Card skeleton for loading model cards
 */
export const CardSkeleton = React.memo(() => (
  <div className="card p-6 space-y-4">
    <div className="space-y-2">
      <Skeleton width="w-3/4" height="h-6" />
      <Skeleton width="w-full" height="h-4" />
    </div>
    <div className="space-y-2">
      <Skeleton width="w-full" height="h-3" count={3} />
    </div>
    <div className="flex gap-2 pt-4">
      <Skeleton width="w-20" height="h-9" />
      <Skeleton width="w-20" height="h-9" />
    </div>
  </div>
));

CardSkeleton.displayName = 'CardSkeleton';

/**
 * Grid of skeleton cards
 */
export const GridSkeleton = React.memo(({ count = 3 }) => (
  <div className="grid-responsive">
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
));

GridSkeleton.displayName = 'GridSkeleton';

GridSkeleton.propTypes = {
  count: PropTypes.number,
};

export default Skeleton;
