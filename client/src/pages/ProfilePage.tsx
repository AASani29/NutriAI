import { Link } from 'react-router-dom';
import { 
  User, Mail, Utensils, Edit, ArrowLeft, Ruler, Scale, 
  Target, AlertCircle, Heart, Search, Crown, ShieldCheck, 
  BarChart3, Activity
} from 'lucide-react';
import { useProfile } from '../context/ProfileContext';

export default function ProfilePage() {
  const { profile, loading, error } = useProfile();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-black tracking-widest uppercase text-xs">Synchronizing Profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] border border-gray-100 p-10 text-center shadow-soft">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-black text-black mb-3">System Error</h2>
          <p className="text-muted-foreground font-medium mb-8 leading-relaxed">{error}</p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-3 px-8 py-4 bg-black text-white rounded-full hover:bg-red-500 transition-all font-black uppercase tracking-widest text-xs shadow-xl shadow-black/10 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Base
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-black tracking-tight">Profile Information</h1>
          <p className="text-muted-foreground font-medium mt-1">Manage your personal metrics and wellness preferences.</p>
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:flex-none">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <input 
              className="pl-12 pr-4 py-3 rounded-full border-none bg-white text-gray-700 placeholder-gray-400 shadow-soft focus:ring-2 focus:ring-black w-full md:w-64 font-bold transition-all focus:w-80" 
              placeholder="Search settings..." 
              type="text"
            />
          </div>
          <button className="bg-black text-white px-8 py-4 rounded-full font-black flex items-center gap-2 hover:opacity-90 transition-all active:scale-95 whitespace-nowrap shadow-lg shadow-black/10">
            <Crown className="w-5 h-5 text-primary font-black" />
            Upgrade
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto pb-10">
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Profile Avatar Card */}
            <div className="lg:col-span-4 bg-white rounded-[2.5rem] p-10 shadow-soft border border-gray-50/50 flex flex-col items-center justify-center text-center relative overflow-hidden group min-h-[400px]">
              <div className="absolute top-[-50%] left-[-50%] w-full h-full bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-700"></div>
              
              <div className="relative mb-8">
                <div className="w-40 h-40 rounded-full p-1.5 bg-gradient-to-tr from-primary via-primary-dark to-black/10 shadow-2xl">
                  <div className="w-full h-full rounded-full bg-white p-1">
                    <div className="w-full h-full rounded-full bg-gray-50 flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-200" />
                    </div>
                  </div>
                </div>
                <button className="absolute bottom-2 right-2 bg-black text-white p-3 rounded-full shadow-xl hover:scale-110 transition-transform active:scale-95 border-4 border-white">
                  <Edit className="w-4 h-4" />
                </button>
              </div>

              <h2 className="text-3xl font-black text-black tracking-tight mb-2">{profile?.profile?.fullName || 'Anonymous User'}</h2>
              <p className="text-primary font-black uppercase tracking-[0.2em] text-[10px] bg-primary/10 px-4 py-1.5 rounded-full mb-8">Fitness Enthusiast</p>
              
              <div className="flex gap-4 w-full">
                <Link to="/dashboard" className="flex-1 bg-gray-50 text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-colors border border-gray-100 text-center">
                  Dashboard
                </Link>
                <Link to="/profile/edit" className="flex-1 bg-black text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-opacity shadow-lg shadow-black/10 text-center">
                  Edit Profile
                </Link>
              </div>
            </div>

            {/* Contact & Preferences Column */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Contact Info Card */}
              <div className="bg-white rounded-[2.5rem] p-10 shadow-soft border border-gray-50/50 flex flex-col justify-between group hover:border-black/5 transition-all">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-blue-50 text-blue-500 rounded-2xl">
                    <Mail className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-black tracking-tight">Contact Information</h3>
                </div>
                <div className="space-y-8">
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Primary Email</p>
                    <p className="text-lg font-black text-black tracking-tight truncate">{profile?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Location</p>
                    <p className="text-lg font-black text-black tracking-tight">{profile?.profile?.location || 'Earth'}</p>
                  </div>
                </div>
              </div>

              {/* Preferences Card */}
              <div className="bg-white rounded-[2.5rem] p-10 shadow-soft border border-gray-50/50 flex flex-col justify-between group hover:border-black/5 transition-all">
                <div className="flex items-center gap-4 mb-10">
                  <div className="p-3 bg-purple-50 text-purple-500 rounded-2xl">
                    <Utensils className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-black tracking-tight">User Preferences</h3>
                </div>
                <div className="space-y-8">
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3">Dietary Compass</p>
                    <div className="inline-flex items-center px-4 py-2 rounded-xl bg-primary text-black text-xs font-black uppercase tracking-widest shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-black mr-2 animate-pulse"></span>
                      {profile?.profile?.dietaryPreference || 'Omnivore'}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Economic Target</p>
                    <p className="text-2xl font-black text-black tracking-tighter">
                      ৳{profile?.profile?.budgetRange?.toLocaleString() || '0'}<span className="text-xs text-muted-foreground font-black uppercase tracking-widest ml-2">Monthly</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Metrics Summary Row */}
              <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-[2.5rem] border border-gray-50 shadow-soft flex flex-col items-center justify-center text-center group hover:border-black transition-all">
                  <Ruler className="w-6 h-6 text-gray-400 mb-3 group-hover:text-black transition-colors" />
                  <span className="text-3xl font-black text-black tracking-tighter">{profile?.profile?.height || '--'}</span>
                  <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">cm (Height)</span>
                </div>
                <div className="bg-primary/20 p-6 rounded-[2.5rem] border border-primary/20 flex flex-col items-center justify-center text-center shadow-lg shadow-primary/5 group hover:bg-primary transition-all">
                  <Scale className="w-6 h-6 text-black mb-3" />
                  <span className="text-3xl font-black text-black tracking-tighter">{profile?.profile?.weight || '--'}</span>
                  <span className="text-[10px] text-black font-black uppercase tracking-widest mt-1">kg (Weight)</span>
                </div>
                <div className="bg-white p-6 rounded-[2.5rem] border border-gray-50 shadow-soft flex flex-col items-center justify-center text-center group hover:border-black transition-all">
                  <Target className="w-6 h-6 text-orange-400 mb-3 group-hover:scale-110 transition-transform" />
                  <span className="text-xl font-black text-black uppercase tracking-widest">{profile?.profile?.weightPreference || 'N/A'}</span>
                  <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Weight Goal</span>
                </div>
                <div className="bg-red-50 p-6 rounded-[2.5rem] border border-red-100 flex flex-col items-center justify-center text-center group hover:bg-red-500 hover:text-white transition-all">
                  <Heart className="w-6 h-6 text-red-500 mb-3 group-hover:text-white transition-colors animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-black group-hover:text-white leading-tight">
                    {profile?.profile?.healthConditions ? profile.profile.healthConditions.split(' ').slice(0, 2).join('\n') : 'Healthy'}
                  </span>
                  <span className="text-[10px] text-red-600/60 group-hover:text-white mt-1 font-black">CONDITION</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Health Logs & History */}
            <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-10 shadow-soft border border-gray-50/50">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-2xl font-black text-black tracking-tight">Health Ecosystem</h3>
                  <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-1">Comprehensive Vitals History</p>
                </div>
                <button className="px-6 py-2.5 bg-black text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-primary hover:text-black transition-all shadow-lg active:scale-95">Update Records</button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="flex items-start gap-6 p-6 bg-gray-50 rounded-[2rem] border border-gray-100 group hover:bg-white hover:shadow-xl transition-all">
                  <div className="p-4 bg-yellow-100 text-yellow-600 rounded-2xl group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Active Allergies</p>
                    <p className="text-lg font-black text-black leading-tight">{profile?.profile?.allergies || 'Zero Reported'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-6 p-6 bg-gray-50 rounded-[2rem] border border-gray-100 group hover:bg-white hover:shadow-xl transition-all">
                  <div className="p-4 bg-red-100 text-red-600 rounded-2xl group-hover:bg-red-500 group-hover:text-white transition-colors">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Diagnostic Status</p>
                    <p className="text-lg font-black text-black leading-tight">{profile?.profile?.healthConditions || 'Cleared'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground mb-6 flex items-center gap-3">
                  <BarChart3 className="w-4 h-4" />
                  Weight Trajectory (30D)
                </h4>
                <div className="h-32 w-full flex items-end gap-3 px-4 pb-2 border-b-2 border-gray-50">
                  <div className="flex-1 bg-gray-100 rounded-t-2xl h-[45%] transition-all hover:h-[50%] hover:bg-gray-200"></div>
                  <div className="flex-1 bg-gray-100 rounded-t-2xl h-[55%] transition-all hover:h-[60%] hover:bg-gray-200"></div>
                  <div className="flex-1 bg-gray-100 rounded-t-2xl h-[50%] transition-all hover:h-[55%] hover:bg-gray-200"></div>
                  <div className="flex-1 bg-gray-100 rounded-t-2xl h-[65%] transition-all hover:h-[70%] hover:bg-gray-200"></div>
                  <div className="flex-1 bg-gray-100 rounded-t-2xl h-[60%] transition-all hover:h-[65%] hover:bg-gray-200"></div>
                  <div className="flex-1 bg-black rounded-t-2xl h-[80%] relative group shadow-lg">
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-black py-2 px-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100 whitespace-nowrap">
                      CURRENT: {profile?.profile?.weight}kg
                    </div>
                  </div>
                  <div className="flex-1 bg-primary rounded-t-2xl h-[70%] transition-all hover:h-[75%] shadow-md"></div>
                </div>
              </div>
            </div>

            {/* Account Membership Card */}
            <div className="bg-black text-white rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden flex flex-col justify-between group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/30 transition-all duration-700"></div>
              
              <div className="relative z-10">
                <h3 className="text-2xl font-black mb-10 flex items-center gap-3">
                  <ShieldCheck className="w-8 h-8 text-primary" />
                  Membership Vault
                </h3>
                
                <div className="space-y-8">
                  <div className="relative pl-6 border-l-4 border-primary/30">
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-2">Activated On</p>
                    <p className="text-2xl font-black tracking-tight">
                      {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Alpha Tester'}
                    </p>
                  </div>
                  <div className="relative pl-6 border-l-4 border-primary/30">
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em] mb-2">Sync Integrity</p>
                    <p className="text-2xl font-black tracking-tight">
                      {profile?.updatedAt ? new Date(profile.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Realtime'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-10 border-t border-white/10 relative z-10">
                <p className="text-[10px] text-white/40 mb-3 font-black uppercase tracking-widest">Protocol Status</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-primary">Standard Plan</span>
                  <button className="bg-white text-black text-[10px] font-black py-4 px-8 rounded-full hover:bg-primary transition-all active:scale-95 uppercase tracking-widest shadow-xl">Upgrade</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </main>
  );
}