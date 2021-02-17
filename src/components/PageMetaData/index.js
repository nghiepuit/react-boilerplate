import _get from 'lodash/get';
import React, { Component, memo } from 'react';
import { Helmet } from 'react-helmet';
import { FB_APP_ID } from './../../helpers/const';
import buildStaticUrl from './../../helpers/url/buildStaticUrl';
import getBaseUrl from './../../helpers/url/getBaseUrl';
import normalizeUrl from './../../helpers/url/normalizeUrl';
import getIndexFollow from './helpers/getIndexFollow';
import renderOgImages from './helpers/renderOgImages';

class Metadata extends Component {
  getTitle(metadata, isOg) {
    if (isOg && metadata.OgTitle) {
      return metadata.OgTitle;
    }
    return metadata.title;
  }
  getDescription(metadata, isOg) {
    if (isOg && metadata.ogDescription) {
      return metadata.ogDescription;
    }
    return metadata.description;
  }
  getKeywords(metadata) {
    return metadata.keywords;
  }
  getCanonicalUrl(metadata) {
    if (metadata.urlCanonical) {
      return normalizeUrl(metadata.urlCanonical, true);
    }
    let currentUrl = _get(this.props, 'location.pathname');
    return normalizeUrl(currentUrl, true);
  }

  render() {
    const { data, location } = this.props;
    if (!data || !location.routeName) return null;
    const fullPath =
      process.env.APP_BASE_DOMAIN + location.pathname + location.search;
    const brandColor = 'green';

    return (
      <Helmet>
        {/**
          |---------------------------------------------------------------------
          | General
          |---------------------------------------------------------------------
        */}
        <link rel="dns-prefetch" href={getBaseUrl()} />
        <title>{this.getTitle(data)}</title>
        <meta name="description" content={this.getDescription(data)} />
        {/**
          |---------------------------------------------------------------------
          | render meta based on agent
          |---------------------------------------------------------------------
        */}
        <meta name="theme-color" content={brandColor} />
        <meta name="msapplication-navbutton-color" content={brandColor} />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content={brandColor}
        />
        {/**
          |---------------------------------------------------------------------
          | Mobile App - Android
          |---------------------------------------------------------------------
        */}

        <meta property="al:android:url" content={'fundoo://' + fullPath} />
        <meta property="al:android:package" content="com.fundoo" />
        <meta property="al:android:app_name" content="fundoo.me App" />
        <link rel="alternate" href={'fundoo://me.fundoo/fundoo/' + fullPath} />

        {/**
          |---------------------------------------------------------------------
          | Mobile App - IOs
          |---------------------------------------------------------------------
        */}

        <meta property="al:ios:url" content={'fundoo://' + fullPath} />
        <meta property="al:ios:app_store_id" content="" />
        <meta property="al:ios:app_name" content="fundoo.me App" />
        <link rel="alternate" href={'fundoo://' + fullPath} />

        {/**
          |---------------------------------------------------------------------
          | SEO
          |---------------------------------------------------------------------
        */}
        <meta name="robots" content={getIndexFollow(data)} />
        <meta name="revisit" content="1 days" />
        <meta name="geo.placename" content="Vietnamese" />
        <meta name="geo.region" content="VN" />
        <meta name="dc.creator" content="Fundoo" />
        <meta name="generator" content="fundoo.me" />
        <meta name="tt_category_id" content="1002592" />
        <meta name="tt_article_id" content="1002592" />
        <meta name="msvalidate.01" content="43C7783BB799E592C63714B2FADC730F" />
        {/**
          |---------------------------------------------------------------------
          | Open Graph - Facebook Share
          |---------------------------------------------------------------------
        */}
        <meta property="fb:app_id" content={FB_APP_ID} />
        <meta property="og:url" content={this.getCanonicalUrl(data)} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={this.getTitle(data, true)} />
        <meta
          property="og:description"
          content={this.getDescription(data, true)}
        />
        {renderOgImages(data.images)}
        <meta property="og:image:width" content="640" />
        <meta property="og:image:height" content="442" />

        <meta property="keywords" content={data.keywords} />
        {/**
          |---------------------------------------------------------------------
          | Specifying a Webpage Icon for Web Clip
          |---------------------------------------------------------------------
        */}
        <link
          rel="apple-touch-icon"
          href={buildStaticUrl('/static/icons/apple-touch-icon-152x152.png')}
        />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href={buildStaticUrl(
            '/static/icons/touch-icon-iphone-retina-180x180.png',
          )}
        />
        {/* Specifying a Launch Screen Image */}
        <link
          rel="apple-touch-startup-image"
          href={buildStaticUrl('/static/icons/icon-large-512x512.png')}
        />
        {/* Adding a Launch Icon Title */}
        <meta name="apple-mobile-web-app-title" content="fundoo.me" />
        {/* Hiding Safari User Interface Components */}
        <meta name="apple-mobile-web-app-capable" content="yes" />

        {/**
          |---------------------------------------------------------------------
          | Others
          |---------------------------------------------------------------------
        */}
        <link rel="canonical" href={this.getCanonicalUrl(data)} />
        <link rel="alternate" hreflang="x-default" href={getBaseUrl()} />
        <link rel="alternate" hreflang="vi" href={getBaseUrl()} />
        <link href="your plus google official" rel="publisher" />
        <link href="your plus google official/posts" rel="author" />
        {/**
          |---------------------------------------------------------------------
          | JSON-LD here
          |---------------------------------------------------------------------
        */}
        {/* TODO: define JSON LD */}
        {/**
          |---------------------------------------------------------------------
          | Override by child components
          |---------------------------------------------------------------------
        */}
        {this.props.children}
      </Helmet>
    );
  }
}

export default memo(() => {
  return <Metadata />;
});
