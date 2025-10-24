'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Badge } from '@/components/ui/badge'
import { Loader2, Check, Cloud, CloudOff } from 'lucide-react'

export function DataSyncIndicator() {
  const { data: session } = useSession()
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'restoring' | 'restored'>('idle')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  useEffect(() => {
    if (!session?.user?.id) return

    const handleProfileAutoSaved = () => {
      setStatus('saved')
      setLastSaved(new Date())
      setTimeout(() => setStatus('idle'), 2000)
    }

    const handleDataRestored = () => {
      setStatus('restored')
      setTimeout(() => setStatus('idle'), 3000)
    }

    const handleTriggerAutoSave = () => {
      setStatus('saving')
    }

    // Listen for auto-save events
    window.addEventListener('profileAutoSaved', handleProfileAutoSaved)
    window.addEventListener('dataRestored', handleDataRestored)
    window.addEventListener('triggerAutoSave', handleTriggerAutoSave)

    return () => {
      window.removeEventListener('profileAutoSaved', handleProfileAutoSaved)
      window.removeEventListener('dataRestored', handleDataRestored)
      window.removeEventListener('triggerAutoSave', handleTriggerAutoSave)
    }
  }, [session?.user?.id])

  if (!session?.user?.id) return null

  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          text: 'Saving...',
          variant: 'secondary' as const,
          className: 'bg-blue-100 text-blue-800 border-blue-200'
        }
      case 'saved':
        return {
          icon: <Check className="h-3 w-3" />,
          text: 'Saved',
          variant: 'secondary' as const,
          className: 'bg-green-100 text-green-800 border-green-200'
        }
      case 'restoring':
        return {
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          text: 'Restoring...',
          variant: 'secondary' as const,
          className: 'bg-purple-100 text-purple-800 border-purple-200'
        }
      case 'restored':
        return {
          icon: <Cloud className="h-3 w-3" />,
          text: 'Data restored',
          variant: 'secondary' as const,
          className: 'bg-purple-100 text-purple-800 border-purple-200'
        }
      default:
        return {
          icon: <Cloud className="h-3 w-3" />,
          text: lastSaved ? `Saved ${lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Synced',
          variant: 'outline' as const,
          className: 'bg-gray-50 text-gray-600 border-gray-200'
        }
    }
  }

  const config = getStatusConfig()

  return (
    <Badge 
      variant={config.variant}
      className={`flex items-center gap-1 text-xs ${config.className}`}
    >
      {config.icon}
      {config.text}
    </Badge>
  )
}
