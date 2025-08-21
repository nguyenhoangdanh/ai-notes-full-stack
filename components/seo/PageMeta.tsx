'use client'

import Head from 'next/head'
import { usePathname } from 'next/navigation'

interface PageMetaProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  type?: 'website' | 'article' | 'profile'
  author?: string
  publishedTime?: string
  modifiedTime?: string
  section?: string
  tags?: string[]
  canonical?: string
  noindex?: boolean
  nofollow?: boolean
  schema?: object
}

const defaultMeta = {
  title: 'AI Notes - Intelligent Note Taking & Productivity Platform',
  description: 'Transform your productivity with AI-powered note taking. Features offline capabilities, semantic search, intelligent organization, collaboration tools, and advanced analytics for modern professionals.',
  image: '/og-image.png',
  type: 'website' as const,
  siteName: 'AI Notes',
  twitterHandle: '@ainotes',
  locale: 'en_US',
  themeColor: '#3b82f6'
}

export function PageMeta({
  title,
  description = defaultMeta.description,
  keywords = [],
  image = defaultMeta.image,
  type = defaultMeta.type,
  author,
  publishedTime,
  modifiedTime,
  section,
  tags = [],
  canonical,
  noindex = false,
  nofollow = false,
  schema
}: PageMetaProps) {
  const pathname = usePathname()
  
  // Construct full URLs
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ainotes.app'
  const fullUrl = `${baseUrl}${pathname}`
  const fullImageUrl = image.startsWith('http') ? image : `${baseUrl}${image}`
  const canonicalUrl = canonical || fullUrl

  // Construct page title
  const pageTitle = title 
    ? `${title} | ${defaultMeta.siteName}`
    : defaultMeta.title

  // Combine keywords
  const allKeywords = [
    'AI notes', 'intelligent note taking', 'productivity platform',
    'semantic search', 'offline notes', 'collaboration',
    'knowledge management', 'digital workspace', 'smart organization',
    ...keywords
  ]

  // Generate robots content
  const robotsContent = [
    noindex ? 'noindex' : 'index',
    nofollow ? 'nofollow' : 'follow',
    'max-image-preview:large',
    'max-snippet:-1',
    'max-video-preview:-1'
  ].join(', ')

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords.join(', ')} />
      <meta name="author" content={author || 'AI Notes Team'} />
      <meta name="robots" content={robotsContent} />
      <meta name="googlebot" content={robotsContent} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Language and Locale */}
      <meta httpEquiv="content-language" content="en" />
      <meta name="language" content="English" />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:image:alt" content={title || defaultMeta.title} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={defaultMeta.siteName} />
      <meta property="og:locale" content={defaultMeta.locale} />
      
      {/* Article-specific Open Graph tags */}
      {type === 'article' && (
        <>
          {author && <meta property="article:author" content={author} />}
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {section && <meta property="article:section" content={section} />}
          {tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={defaultMeta.twitterHandle} />
      <meta name="twitter:creator" content={defaultMeta.twitterHandle} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullImageUrl} />
      <meta name="twitter:image:alt" content={title || defaultMeta.title} />

      {/* Mobile Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta name="theme-color" content={defaultMeta.themeColor} />
      <meta name="msapplication-TileColor" content={defaultMeta.themeColor} />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={defaultMeta.siteName} />
      
      {/* PWA Meta Tags */}
      <link rel="manifest" href="/manifest.json" />
      <meta name="application-name" content={defaultMeta.siteName} />
      <meta name="msapplication-config" content="/browserconfig.xml" />
      
      {/* Favicons and Icons */}
      <link rel="icon" href="/favicon.ico" sizes="any" />
      <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      <link rel="mask-icon" href="/safari-pinned-tab.svg" color={defaultMeta.themeColor} />
      
      {/* DNS Prefetch for Performance */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      
      {/* Security Headers */}
      <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
      <meta httpEquiv="X-Frame-Options" content="DENY" />
      <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
      <meta name="referrer" content="strict-origin-when-cross-origin" />
      
      {/* Additional SEO Meta Tags */}
      <meta name="format-detection" content="telephone=no" />
      <meta name="pinterest" content="nopin" />
      <meta name="skype_toolbar" content="skype_toolbar_parser_compatible" />
      
      {/* Rich Snippets / Schema.org */}
      {schema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema)
          }}
        />
      )}
      
      {/* Default Schema for the site */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: defaultMeta.siteName,
            description: description,
            url: fullUrl,
            applicationCategory: 'ProductivityApplication',
            operatingSystem: 'Web Browser',
            browserRequirements: 'Requires JavaScript. Requires HTML5.',
            softwareVersion: '1.0.0',
            author: {
              '@type': 'Organization',
              name: 'AI Notes Team',
              url: baseUrl
            },
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
              category: 'free'
            },
            featureList: [
              'AI-powered note taking',
              'Offline capabilities',
              'Semantic search',
              'Real-time collaboration',
              'Advanced analytics',
              'Mobile support',
              'Voice notes',
              'Template system'
            ],
            screenshot: fullImageUrl,
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: '4.8',
              ratingCount: '150',
              bestRating: '5',
              worstRating: '1'
            }
          })
        }}
      />
    </Head>
  )
}

// Specific meta components for different page types
export function ArticleMeta({
  title,
  description,
  author,
  publishedTime,
  modifiedTime,
  image,
  tags = [],
  section,
  readingTime,
  wordCount
}: {
  title: string
  description: string
  author: string
  publishedTime: string
  modifiedTime?: string
  image?: string
  tags?: string[]
  section?: string
  readingTime?: number
  wordCount?: number
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    author: {
      '@type': 'Person',
      name: author
    },
    datePublished: publishedTime,
    dateModified: modifiedTime || publishedTime,
    image: image,
    publisher: {
      '@type': 'Organization',
      name: defaultMeta.siteName,
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_APP_URL}/logo.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': typeof window !== 'undefined' ? window.location.href : ''
    },
    ...(wordCount && { wordCount }),
    ...(readingTime && { 
      timeRequired: `PT${readingTime}M`,
      typicalAgeRange: '18-'
    })
  }

  return (
    <PageMeta
      title={title}
      description={description}
      type="article"
      author={author}
      publishedTime={publishedTime}
      modifiedTime={modifiedTime}
      image={image}
      tags={tags}
      section={section}
      schema={schema}
    />
  )
}

export function ProductMeta({
  name,
  description,
  price,
  currency = 'USD',
  availability = 'InStock',
  brand = defaultMeta.siteName,
  image,
  reviews = []
}: {
  name: string
  description: string
  price?: number
  currency?: string
  availability?: string
  brand?: string
  image?: string
  reviews?: Array<{
    author: string
    rating: number
    reviewBody: string
    datePublished: string
  }>
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    brand: {
      '@type': 'Brand',
      name: brand
    },
    image: image,
    ...(price && {
      offers: {
        '@type': 'Offer',
        price: price.toString(),
        priceCurrency: currency,
        availability: `https://schema.org/${availability}`,
        url: typeof window !== 'undefined' ? window.location.href : ''
      }
    }),
    ...(reviews.length > 0 && {
      review: reviews.map(review => ({
        '@type': 'Review',
        author: {
          '@type': 'Person',
          name: review.author
        },
        reviewRating: {
          '@type': 'Rating',
          ratingValue: review.rating.toString(),
          bestRating: '5'
        },
        reviewBody: review.reviewBody,
        datePublished: review.datePublished
      })),
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: (reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length).toFixed(1),
        reviewCount: reviews.length.toString(),
        bestRating: '5',
        worstRating: '1'
      }
    })
  }

  return (
    <PageMeta
      title={name}
      description={description}
      image={image}
      schema={schema}
    />
  )
}

// FAQ Schema component
export function FAQMeta({ 
  faqs 
}: { 
  faqs: Array<{ question: string; answer: string }> 
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema)
      }}
    />
  )
}

// Breadcrumb Schema component
export function BreadcrumbMeta({ 
  items 
}: { 
  items: Array<{ name: string; url: string }> 
}) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema)
      }}
    />
  )
}
