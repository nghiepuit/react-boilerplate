import { Container } from '@nghiepuit/ui';
import React from 'react';
import BackToTop from './../../../components/BackToTop';
import ErrorBoundary from './../../../components/ErrorBoundary';
import PageFooter from './../../../components/PageFooter';
import PageTopbar from './../../../components/PageTopbar';
import styles from './styles.module.scss';

export default ({ children }) => {
  return (
    <div className={styles['root']}>
      <ErrorBoundary>
        <PageTopbar />
      </ErrorBoundary>
      <Container id="root-container">{children}</Container>
      <ErrorBoundary>
        <PageFooter />
      </ErrorBoundary>
      <BackToTop />
    </div>
  );
};
