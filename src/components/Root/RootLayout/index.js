import React from 'react';
import BackToTop from './../../../components/BackToTop';
import ErrorBoundary from './../../../components/ErrorBoundary';
import PageFooter from './../../../components/PageFooter';
import PageTopbar from './../../../components/PageTopbar';

export default ({ children }) => {
  return (
    <div>
      <ErrorBoundary>
        <PageTopbar />
      </ErrorBoundary>
      <div id="root-container">{children}</div>
      <ErrorBoundary>
        <PageFooter />
      </ErrorBoundary>
      <BackToTop />
    </div>
  );
};
