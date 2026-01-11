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
      const { data: profileData, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single() as { data: UserProfile | null; error: { code?: string } | null };

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
      
      console.log('💾 Saving User Profile...', updateData);
      
      const { error } = await supabase
        .from('user_profiles')
        .upsert(updateData as never, {
          onConflict: 'user_id',
          ignoreDuplicates: false
        }) as { error: Error | null };

      if (error) {
        console.error('❌ Supabase error: ', error);
        console.error('Error message:', error.message);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw error;
      }

      console.log('✅ User Profile saved successfully');

      // Dispatch custom event to notify Header to refresh
      window.dispatchEvent(new CustomEvent('profileUpdated', { detail: { full_name: profile.full_name } }));

      toast({
        title: "Success!",
        description: "Your profile has been updated."
      });
    } catch (error: unknown) {
      console.error('🚨 Save Failed:', error);
      
      // Check if it's a table doesn't exist error
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('Full error message:', errorMessage);
      
      const isTableMissing = errorMessage.includes('relation') && errorMessage.includes('does not exist');
      const isPermissionError = errorMessage.includes('permission') || errorMessage.includes('policy');
      
      let description = errorMessage;
      
      if (isTableMissing) {
        description = "Database table 'user_profiles' not found. Please run the migration in Supabase SQL Editor:\n\nsupabase/migrations/002_check_and_fix.sql";
      } else if (isPermissionError) {
        description = "Permission denied. Please check RLS policies in Supabase.";
      }
      
      toast({
        variant: "destructive",
        title: "Failed to save profile",
        description: description
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-indigo-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-400/10 rounded-full blur-2xl animate-pulse delay-500"></div>
        
        {/* 3D Floating Boxes */}
        <div className="absolute top-24 left-[8%] w-24 h-24 bg-gradient-to-br from-indigo-400/20 to-blue-500/20 backdrop-blur-sm border border-white/30 rounded-lg shadow-2xl transform rotate-12 animate-float"></div>
        <div className="absolute top-40 right-[12%] w-32 h-32 bg-gradient-to-br from-blue-400/15 to-purple-500/15 backdrop-blur-sm border border-white/20 rounded-xl shadow-xl transform -rotate-6 animate-float-delay-2"></div>
        <div className="absolute bottom-36 left-[18%] w-20 h-20 bg-gradient-to-br from-purple-400/20 to-indigo-500/20 backdrop-blur-sm border border-white/30 rounded-lg shadow-lg transform rotate-45 animate-float-delay-1"></div>
        <div className="absolute bottom-52 right-[22%] w-28 h-28 bg-gradient-to-br from-indigo-300/15 to-blue-400/15 backdrop-blur-sm border border-white/25 rounded-xl shadow-xl transform -rotate-12 animate-float-delay-3"></div>
        <div className="absolute top-[58%] left-[6%] w-16 h-16 bg-gradient-to-br from-blue-500/20 to-indigo-600/20 backdrop-blur-sm border border-white/30 rounded-md shadow-lg transform rotate-30 animate-float-delay-15"></div>
        <div className="absolute top-[28%] right-[10%] w-20 h-20 bg-gradient-to-br from-purple-400/15 to-blue-500/15 backdrop-blur-sm border border-white/20 rounded-lg shadow-xl transform -rotate-20 animate-float-delay-25"></div>
        <div className="absolute top-[18%] left-[48%] w-12 h-12 bg-gradient-to-br from-indigo-500/10 to-blue-400/10 backdrop-blur-sm border border-white/20 rounded-md shadow-md transform rotate-6 animate-float-delay-05"></div>
        <div className="absolute bottom-[22%] right-[8%] w-14 h-14 bg-gradient-to-br from-blue-400/15 to-purple-500/15 backdrop-blur-sm border border-white/25 rounded-lg shadow-lg transform -rotate-15 animate-float-delay-35"></div>
      </div>

      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 mt-16 sm:mt-20 relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Development Notice */}
        <div className="mb-6 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-3 text-center text-sm text-indigo-700">
           Profile features are under active development. Some options may change.
        </div>

          {/* Header with Gradient Text */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4 bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 bg-clip-text text-transparent px-2">
              Profile Settings
            </h1>
            <p className="text-slate-600 text-base sm:text-lg font-medium px-4">Customize your travel experience</p>
          </div>

          {/* Profile Card */}
          <Card className="mb-4 sm:mb-6 bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-blue-500 to-purple-500"></div>
            <CardHeader className="bg-gradient-to-br from-slate-50 to-blue-50/50 border-b border-slate-100 px-4 sm:px-6 py-4 sm:py-6">
              <CardTitle className="flex items-center gap-2 sm:gap-3 text-xl sm:text-2xl text-slate-800">
                <div className="p-1.5 sm:p-2 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl shadow-lg">
                  <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                Personal Information
              </CardTitle>
              <CardDescription className="text-sm sm:text-base text-slate-600">Update your profile details and make your mark</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6 py-4 sm:py-6">
              {/* Avatar Section */}
              <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <div className="relative group">
                  <Avatar className="w-24 h-24 sm:w-28 sm:h-28 border-4 border-white shadow-xl ring-4 ring-blue-500/20">
                    <AvatarImage src={profile.avatar_url} alt={profile.full_name} />
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-blue-600 text-white text-2xl sm:text-3xl font-bold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Camera className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                </div>
                <div className="flex-1 w-full">
                  <Label htmlFor="avatar_url" className="text-sm font-semibold text-slate-700">Avatar URL</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="avatar_url"
                      placeholder="https://example.com/avatar.jpg"
                      value={profile.avatar_url}
                      onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                      className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20 bg-white text-slate-900 text-sm sm:text-base"
                    />
                    <Button variant="outline" size="icon" className="border-indigo-300 hover:bg-indigo-500 hover:text-white hover:border-indigo-500 transition-all flex-shrink-0">
                      <Camera className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-200" />

              {/* Email (Read-only) */}
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Mail className="w-4 h-4 text-slate-600" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="bg-slate-100 border-slate-300 text-slate-700 text-sm sm:text-base"
                />
                <p className="text-xs sm:text-sm text-slate-500">Email cannot be changed</p>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name" className="text-sm font-semibold text-slate-700">Full Name</Label>
                <Input
                  id="full_name"
                  placeholder="John Doe"
                  value={profile.full_name}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20 bg-white text-slate-900 text-sm sm:text-base"
                />
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-sm font-semibold text-slate-700">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself..."
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  rows={4}
                  className="border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/20 bg-white text-slate-900 text-sm sm:text-base resize-none"
                />
              </div>

              {/* Language Preference */}
              <div className="space-y-2">
                <Label htmlFor="language" className="text-sm font-semibold text-slate-700">Preferred Language</Label>
                <select
                  id="language"
                  value={profile.language}
                  onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                  className="w-full h-10 sm:h-11 rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 text-sm sm:text-base focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none"
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
                className="w-full bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 hover:shadow-2xl transform hover:scale-[1.02] transition-all duration-200 text-white font-semibold shadow-lg h-11 sm:h-12 text-sm sm:text-base"
                size="lg"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                    Saving Your Changes...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="bg-white shadow-2xl border border-slate-200 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900"></div>
            <CardHeader className="bg-gradient-to-br from-slate-50 to-blue-50/50 border-b border-slate-100 px-4 sm:px-6 py-4 sm:py-6">
              <CardTitle className="text-lg sm:text-xl text-slate-800">Account Actions</CardTitle>
              <CardDescription className="text-sm sm:text-base text-slate-600">Manage your account settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 py-4 sm:py-6">
              <Button
                variant="outline"
                className="w-full justify-start border-2 border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all h-10 sm:h-11 text-sm sm:text-base"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-all h-10 sm:h-11 text-sm sm:text-base">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-[90vw] sm:max-w-lg">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-lg sm:text-xl">Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription className="text-sm sm:text-base">
                      This action cannot be undone. This will permanently delete your
                      account and remove all your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
                    <AlertDialogCancel className="mt-0 sm:mt-0">Cancel</AlertDialogCancel>
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
