import { Routes, Route } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import Home from './pages/Home';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import OnboardingPage from './pages/OnboardingPage';
// Layout
import Layout from './components/Layout';

// Pages with Layout
import Dashboard from './pages/Dashboard';
import DailyLogPage from './pages/DailyLogPage';
import NeighbourhoodPage from './pages/NeighbourhoodPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import { ProfileProvider } from './context/ProfileContext';
import { ResourcesPage } from './pages/ResourcesPage';
import InventoryPage from './pages/InventoryPage';
import InventoryDetailPage from './pages/InventoryDetailPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ProfileProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />

          {/* Protected routes */}
          <Route
            path="/onboarding"
            element={
              <SignedIn>
                <OnboardingPage />
              </SignedIn>
            }
          />
          {/* Protected routes with layout */}
        <Route
          path="/"
          element={
            <SignedIn>
              <Layout />
            </SignedIn>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="daily-log" element={<DailyLogPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="inventory/:inventoryId" element={<InventoryDetailPage />} />
          <Route path="resources" element={<ResourcesPage />} />
          <Route path="neighbourhood" element={<NeighbourhoodPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/edit" element={<EditProfilePage />} />
        </Route>

          {/* Redirect to sign in when signed out */}
          <Route
            path="*"
            element={
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            }
          />
        </Routes>
      </ProfileProvider>
    </QueryClientProvider>
  );
}