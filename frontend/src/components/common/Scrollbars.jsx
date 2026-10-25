// Drop-in for the subset of react-custom-scrollbars' <Scrollbars> that the app
// used (style, className, children). That package was last released in 2017
// and only supports React <= 16; native overflow with thin, translucent
// scrollbars gives the same look without a dependency.
import React from 'react';
import './Scrollbars.css';

export function Scrollbars({ style, className = '', children, ...rest }) {
  return (
    <div className={`scrollbars ${className}`.trim()} style={style} {...rest}>
      {children}
    </div>
  );
}

export default Scrollbars;
