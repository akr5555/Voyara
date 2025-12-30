import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Loader2, User, Mail, Camera, Save, LogOut, Trash2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<{ id: string; email?: string; user_metadata?: Record<string, unknown> } | null>(null);
  const [profile, setProfile] = useState({
    full_name: "",
    bio: "",
    avatar_url: "",
    language: "en"
  });

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      setUser(user);

      // Fetch user profile from database  
      const result = await (supabase as unknown as {
        from: (table: string) => {
          select: (cols: string) => {
            eq: (col: string, val: string) => {
              single: () => Promise<{ data: UserProfile | null; error: { code?: string } | null }>
            }
          }
        }
      })
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      const { data: profileData, error } = result;

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching profile:', error);
      }

      if (profileData) {
        setProfile({
          full_name: profileData.full_name || '',
          bio: profileData.bio || '',
          avatar_url: profileData.avatar_url || '',
          language: profileData.language || 'en'
        });
      }
    } catch (error: unknown) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load profile data"
      });
    } finally {
      setLoading(false);
    }
  }, [navigate, toast]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleSave = async () => {
    if (!user) return;

    try {
      setSaving(true);

      // Upsert profile data
      const updateData = {
        user_id: user.id,
        full_name: profile.full_name,
        bio: profile.bio,
        avatar_url: profile.avatar_url,
        language: profile.language,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await (supabase as unknown as {
        from: (table: string) => {
          upsert: (data: typeof updateData) => Promise<{ error: Error | null }>
        }
      })
        .from('user_profiles')
        .upsert(updateData);

      if (error) throw error;

      // Dispatch custom event to notify Header to refresh
      window.dispatchEvent(new CustomEvent('profileUpdated', { detail: { full_name: profile.full_name } }));

      toast({
        title: "Success!",
        description: "Your profile has been updated."
      });
    } catch (error: unknown) {
      console.error('Save error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save profile"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  const handleDeleteAccount = async () => {
    try {
      // Note: Deleting user account requires admin API or custom function
      toast({
        title: "Contact Support",
        description: "Please contact support to delete your account."
      });
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary/30 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const initials = profile.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()
    : user?.email?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-secondary/30">
      <Header />
      
      <div className="container mx-auto px-4 py-8 mt-20">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-display text-4xl font-bold mb-8 text-foreground">Profile Settings</h1>

          {/* Profile Card */}
          <Card className="mb-6 bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
              <CardDescription>Update your profile details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Label htmlFor="avatar_url">Avatar URL</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="avatar_url"
                      placeholder="https://example.com/avatar.jpg"
                      value={profile.avatar_url}
                      onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                    />
                    <Button variant="outline" size="icon">
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-secondary/50"
                />
                <p className="text-sm text-muted-foreground">Email cannot be changed</p>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  placeholder="John Doe"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={4}
                />
              </div>

              {/* Language Preference */}
              <div className="space-y-2">
                <Label htmlFor="language">Preferred Language</Label>
                <select
                  id="language"
                  value={profile.language}
                  onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="it">Italiano</option>
                  <option value="ja">日本語</option>
                </select>
              </div>

              {/* Save Button */}
              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full"
                size="lg"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="bg-card">
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
              <CardDescription>Manage your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full justify-start">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      account and remove all your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive">
                      Delete Account
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
