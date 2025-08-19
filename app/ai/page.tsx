import { PageMeta } from '../../components/seo/PageMeta'

export const metadata = {
  title: 'AI Assistant - AI Notes',
  description: 'Enhance your productivity with AI-powered features. Get intelligent suggestions, automated summaries, and smart content generation.',
  keywords: ['AI assistant', 'artificial intelligence', 'smart suggestions', 'content generation', 'productivity', 'automation'],
  openGraph: {
    title: 'AI Assistant - AI Notes',
    description: 'Enhance your productivity with AI-powered features and intelligent automation.',
    type: 'website',
  },
}

export default function AIPage() {
  return (
    <>
      <PageMeta
        title="AI Assistant"
        description="Enhance your productivity with AI-powered features. Get intelligent suggestions, automated summaries, and smart content generation."
        keywords={['AI assistant', 'artificial intelligence', 'smart suggestions', 'content generation', 'productivity', 'automation']}
        type="website"
      />
      <div role="main" aria-label="AI Assistant">
        <h1 className="text-3xl font-bold mb-6">AI Assistant</h1>
        <p className="text-muted-foreground">
          Enhance your note-taking with intelligent AI features.
        </p>
      </div>
    </>
  )
}
