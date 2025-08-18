'use client'

import Head from 'next/head'
import { useRouter } from 'next/navigation'

interface PageMetaProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  type?: 'website' | 'article' | 'profile'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  section?: string
  tags?: string[]
  noIndex?: boolean
  canonical?: string
}

export function PageMeta({
  title,
  description = 'AI-powered note taking with offline capabilities, semantic search, and intelligent organization.',
  keywords = [],
  image = '/og-image.png',
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  section,
  tags = [],
  noIndex = false,
  canonical
}: PageMetaProps) {
  const router = useRouter()
  const currentUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:5000'}${router.asPath || ''}`
  
  const fullTitle = title 
    ? `${title} | AI Notes - Intelligent Note Taking Platform`
    : 'AI Notes - Intelligent Note Taking Platform'
  
  const fullImage = image.startsWith('http') ? image : `${process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:5000'}${image}`
  
  const allKeywords = [
    'AI notes',
    'intelligent note taking',
    'productivity platform',
    'semantic search',
    'offline notes',
    'knowledge management',
    ...keywords
  ].join(', ')

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': type === 'article' ? 'Article' : 'WebPage',
    name: fullTitle,
    description,
    url: currentUrl,
    image: fullImage,
    ...(type === 'article' && {
      headline: title,
      author: {
        '@type': 'Person',
        name: author || 'AI Notes Team',
      },
      publisher: {
        '@type': 'Organization',
        name: 'AI Notes',
        logo: {
          '@type': 'ImageObject',
          url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://localhost:5000'}/icon-512.png`,
        },
      },
      datePublished: publishedTime,
      dateModified: modifiedTime || publishedTime,
      articleSection: section,
      keywords: tags.join(', '),
    }),
  }

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords} />
      <meta name="author" content={author || 'AI Notes Team'} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonical || currentUrl} />
      
      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="AI Notes" />
      <meta property="og:locale" content="en_US" />
      
      {/* Article specific OG tags */}
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      {type === 'article' && section && (
        <meta property="article:section" content={section} />
      )}
      {type === 'article' && tags.map((tag) => (
        <meta key={tag} property="article:tag" content={tag} />
      ))}
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={currentUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImage} />
      <meta property="twitter:site" content="@ainotes" />
      <meta property="twitter:creator" content="@ainotes" />
      
      {/* Additional SEO tags */}
      <meta name="theme-color" content="#7c3aed" />
      <meta name="msapplication-TileColor" content="#7c3aed" />
      <meta name="application-name" content="AI Notes" />
      <meta name="apple-mobile-web-app-title" content="AI Notes" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="mobile-web-app-capable" content="yes" />
      
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
    </Head>
  )
}

// Higher-order component for easy SEO integration
export function withSEO<T extends object>(
  Component: React.ComponentType<T>,
  seoProps: Partial<PageMetaProps>
) {
  return function SEOWrappedComponent(props: T) {
    return (
      <>
        <PageMeta {...seoProps} />
        <Component {...props} />
      </>
    )
  }
}
