'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { 
  User, 
  Briefcase, 
  MapPin, 
  Clock, 
  Save,
  Loader2
} from 'lucide-react'

interface Profile {
  id: string
  job_title: string | null
  city: string | null
  years_of_experience: number | null
  daily_tasks: string | null
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [email, setEmail] = useState('')
  const [userId, setUserId] = useState<string | null>(null)
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        toast.error(userError.message)
        setLoading(false)
        return
      }

      if (!user) {
        setLoading(false)
        return
      }

      setUserId(user.id)
      setEmail(user.email || '')

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle()

      if (error) {
        toast.error(error.message)
      } else if (data) {
        setProfile(data)
      } else {
        // Profile row might not exist yet (e.g. trigger not installed). Start with an empty editable profile.
        setProfile({
          id: user.id,
          job_title: null,
          city: null,
          years_of_experience: null,
          daily_tasks: null,
        })
      }
      setLoading(false)
    }
    
    loadProfile()
  }, [supabase])

  const handleSave = async () => {
    if (!profile || !userId) return
    
    setSaving(true)
    
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        job_title: profile.job_title,
        city: profile.city,
        years_of_experience: profile.years_of_experience,
        daily_tasks: profile.daily_tasks,
        updated_at: new Date().toISOString(),
      })
    
    if (error) {
      toast.error(error.message || 'Failed to update profile')
    } else {
      toast.success('Profile updated successfully')
      // Refresh Server Components (e.g. dashboard sidebar) that read profile data.
      router.refresh()
    }
    
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground">
          Manage your worker profile information
        </p>
      </div>

      {/* Account Info */}
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Account Information
          </CardTitle>
          <CardDescription>
            Your account details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label className="text-muted-foreground">Email Address</Label>
            <Input 
              value={email} 
              disabled 
              className="bg-muted/50 border-border"
            />
            <p className="text-xs text-muted-foreground">
              Email cannot be changed. Contact support if you need to update it.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Worker Profile */}
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" />
            Worker Profile
          </CardTitle>
          <CardDescription>
            This information is used to personalize your intelligence briefings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="jobTitle" className="text-foreground">Job Title</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="jobTitle"
                  value={profile?.job_title || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, job_title: e.target.value } : null)}
                  className="pl-10 bg-input border-border"
                  placeholder="e.g. Software Engineer"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-foreground">City</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="city"
                  value={profile?.city || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, city: e.target.value } : null)}
                  className="pl-10 bg-input border-border"
                  placeholder="e.g. San Francisco"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience" className="text-foreground">Years of Experience</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="experience"
                type="number"
                min="0"
                max="50"
                value={profile?.years_of_experience || ''}
                onChange={(e) => setProfile(prev => prev ? { ...prev, years_of_experience: parseInt(e.target.value) || null } : null)}
                className="pl-10 bg-input border-border"
                placeholder="e.g. 5"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tasks" className="text-foreground">Daily Tasks</Label>
            <Textarea
              id="tasks"
              value={profile?.daily_tasks || ''}
              onChange={(e) => setProfile(prev => prev ? { ...prev, daily_tasks: e.target.value } : null)}
              className="bg-input border-border min-h-[120px]"
              placeholder="Describe your typical work day tasks..."
            />
            <p className="text-xs text-muted-foreground">
              This helps us analyze your automation exposure and provide personalized recommendations.
            </p>
          </div>

          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save Changes
              </span>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
