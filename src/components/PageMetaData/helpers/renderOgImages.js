import React from 'react';
import _isArray from 'lodash/isArray';

export default images => {
  if (_isArray(images) && images.length > 0) {
    return images.map(image => {
      return <meta key={image} property="og:image" content={image} />;
    });
  }
  if (images) {
    return <meta property="og:image" content={images} />;
  }
};
