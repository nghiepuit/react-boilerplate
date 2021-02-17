import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // TODO: implement tracking error here
    // getSentry().then((sentry) => {
    //   sentry.withScope((scope) => {
    //     scope.setExtras(info);
    //     sentry.captureException(error.originalError || error.error || error);
    //   });
    // });
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}
