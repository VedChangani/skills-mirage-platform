import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { 
  Settings, 
  Bell, 
  Shield, 
  Moon,
  Mail,
  Smartphone,
  AlertTriangle,
  TrendingUp,
  BookOpen
} from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">
          Manage your preferences and notifications
        </p>
      </div>

      {/* Notification Preferences */}
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose how you want to receive intelligence alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-destructive" />
              </div>
              <div>
                <Label className="text-foreground">Risk Alerts</Label>
                <p className="text-xs text-muted-foreground">
                  Get notified about changes to your automation risk
                </p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div>
                <Label className="text-foreground">Market Updates</Label>
                <p className="text-xs text-muted-foreground">
                  Weekly digest of job market trends
                </p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-chart-2/10 flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-chart-2" />
              </div>
              <div>
                <Label className="text-foreground">Learning Recommendations</Label>
                <p className="text-xs text-muted-foreground">
                  Suggestions for courses and skills to learn
                </p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Delivery Methods */}
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Mail className="w-5 h-5 text-primary" />
            Delivery Methods
          </CardTitle>
          <CardDescription>
            How to receive your notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label className="text-foreground">Email Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Receive alerts via email
                </p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Smartphone className="w-4 h-4 text-muted-foreground" />
              <div>
                <Label className="text-foreground">Push Notifications</Label>
                <p className="text-xs text-muted-foreground">
                  Browser push notifications
                </p>
              </div>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Moon className="w-5 h-5 text-primary" />
            Appearance
          </CardTitle>
          <CardDescription>
            Customize your interface
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-foreground">Dark Mode</Label>
              <p className="text-xs text-muted-foreground">
                Use dark theme (optimized for Intelligence Agency aesthetic)
              </p>
            </div>
            <Badge variant="outline" className="border-primary/30 text-primary">
              Always On
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="border-border/50 bg-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Account
          </CardTitle>
          <CardDescription>
            Account management options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full border-border">
            Export My Data
          </Button>
          <Button variant="outline" className="w-full border-destructive/50 text-destructive hover:bg-destructive/10">
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
