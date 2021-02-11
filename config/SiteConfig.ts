export default {
  pathPrefix: '/', // Prefix for all links. If you deploy your site to example.com/portfolio your pathPrefix should be "portfolio"

  siteTitle: 'Tenn25 Blog', // Navigation and Site Title
  siteTitleAlt: 'tenn25備忘録ブログ', // Alternative Site title for SEO
  siteUrl: 'https://tenn25.com', // Domain of your site. No trailing slash!
  siteLanguage: 'ja', // Language Tag on <html> element
  siteBanner: '/assets/banner.jpg', // Your image for og:image tag. You can find it in the /static folder
  defaultBg: '/assets/bg.jpg', // default post background header
  favicon: 'src/favicon.png', // Your image for favicons. You can find it in the /src folder
  siteDescription: 'tenn25備忘録ブログ', // Your site description
  author: 'Majid Hajian', // Author for schemaORGJSONLD
  siteLogo: '/assets/icon.jpg', // Image for schemaORGJSONLD

  // siteFBAppID: '123456789', // Facebook App ID - Optional
  userTwitter: '@tenn_25', // Twitter Username - Optional
  ogSiteName: 'tenn25blog', // Facebook Site Name - Optional
  ogLanguage: 'ja_JP', // Facebook Language

  // Manifest and Progress color
  // See: https://developers.google.com/web/fundamentals/web-app-manifest/
  themeColor: '#3498DB',
  backgroundColor: '#2b2e3c',

  // Settings for typography.ts
  headerFontFamily: 'Bitter',
  bodyFontFamily: 'Open Sans',
  baseFontSize: '13px',

  // Social media
  siteFBAppID: '',

  //
  Google_Tag_Manager_ID: 'GTM-XXXXXXX',
  POST_PER_PAGE: 4,
};
