'use client'

import { Mic, MapPin, CloudUpload } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import Link from 'next/link'

export default function MobilePage() {
  const features = [
    {
      title: 'Voice Notes',
      description: 'Record voice notes and convert them to text automatically',
      icon: Mic,
      href: '/mobile/voice-notes',
      color: 'bg-red-500'
    },
    {
      title: 'Location Notes',
      description: 'Add location context to your notes with GPS tagging',
      icon: MapPin,
      href: '/mobile/location-notes',
      color: 'bg-green-500'
    },
    {
      title: 'Offline Sync',
      description: 'Work offline and sync when connection is restored',
      icon: CloudUpload,
      href: '/mobile/sync',
      color: 'bg-blue-500'
    }
  ]

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Mobile Features</h1>
        <p className="text-xl text-muted-foreground">
          Access your notes anywhere with mobile-optimized features
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Card key={feature.title} className="hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className={`${feature.color} w-16 h-16 rounded-lg mx-auto flex items-center justify-center mb-4`}>
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">{feature.description}</p>
              <Link href={feature.href}>
                <Button className="w-full">Try {feature.title}</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
