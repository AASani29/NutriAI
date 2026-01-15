import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useProfile } from '../context/ProfileContext';

export default function Layout() {
  const { isNewUser, loading } = useProfile();
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && isNewUser && location.pathname !== '/onboarding') {
      navigate('/onboarding');
    }
  }, [isNewUser, loading, navigate, location.pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background p-4 gap-4 overflow-hidden">
      <Sidebar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
      
      {/* Spacer to push content away from fixed sidebar */}
      <div 
        className={`flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? 'w-70' : 'w-20 lg:w-24'
        }`}
      />
      
      <div className="flex-1 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}