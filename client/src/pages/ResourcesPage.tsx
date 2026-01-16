import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@clerk/clerk-react';
import { BookOpen, Sparkles, Plus, Newspaper, Video as VideoIcon } from 'lucide-react';
import { ResourceCard } from '../components/resources/ResourceCard';
import { ArticleCard } from '../components/resources/ArticleCard';
import { VideoCard } from '../components/resources/VideoCard';
import { SearchBar } from '../components/resources/SearchBar';
import { AddResourceModal } from '../components/resources/AddResourceModal';
import {
  getAllResources,
  getPersonalizedRecommendations,
  searchExternalArticles,
  searchExternalVideos
} from '../services/resources-service';
import type { PersonalizedRecommendations, Article, Video } from '../types/resource-types';

export function ResourcesPage() {
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'personalized' | 'library'>('personalized');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'articles' | 'videos' | 'both'>('both');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    articles: Article[];
    videos: Video[];
  } | null>(null);
  const [resultTab, setResultTab] = useState<'articles' | 'videos'>('articles');

  const { getToken, isSignedIn } = useAuth();

  // Fetch static resources
  const { data: resources = [], isLoading: isLoadingResources, isError: isResourcesError } = useQuery({
    queryKey: ['resources'],
    queryFn: getAllResources,
  });

  // Fetch personalized recommendations
  const { data: recommendations, isLoading: isLoadingRecommendations, isError: isRecommendationsError } = useQuery<PersonalizedRecommendations>({
    queryKey: ['personalizedRecommendations'],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      return getPersonalizedRecommendations(token);
    },
    enabled: isSignedIn && activeTab === 'personalized',
  });

  const allTags = Array.from(new Set(resources.flatMap((r: any) => r.tags as string[]))) as string[];
  const tags: string[] = ['All', ...allTags];

  const filteredResources = resources.filter((resource: any) => {
    const matchesTag = selectedTag === 'All' || (resource.tags as string[]).includes(selectedTag);
    return matchesTag;
  });

  const handleSearch = async (query: string, type: 'articles' | 'videos' | 'both') => {
    setIsSearching(true);
    setSearchQuery(query);
    setSearchType(type);

    try {
      const results: { articles: Article[]; videos: Video[] } = {
        articles: [],
        videos: [],
      };

      if (type === 'articles' || type === 'both') {
        results.articles = await searchExternalArticles(query);
      }

      if (type === 'videos' || type === 'both') {
        results.videos = await searchExternalVideos(query);
      }

      setSearchResults(results);
      // Set initial tab based on what has results
      if (results.articles.length > 0) {
        setResultTab('articles');
      } else if (results.videos.length > 0) {
        setResultTab('videos');
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center shadow-lg shadow-secondary/10">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-foreground tracking-tight">Resources</h1>
          </div>
          <p className="text-muted-foreground font-medium ml-1">
            Master the art of kitchen management, sustainability, and waste reduction.
          </p>
        </div>
        {isSignedIn && activeTab === 'library' && (
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-4 bg-secondary text-white rounded-2xl hover:bg-secondary/90 transition-all font-bold shadow-xl shadow-secondary/10"
          >
            <Plus className="h-5 w-5" />
            Add Resource
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      {isSignedIn && (
        <div className="flex gap-2 p-1.5 bg-gray-50 rounded-2xl border border-gray-100 max-w-fit">
          <button
            onClick={() => setActiveTab('personalized')}
            className={`px-6 py-2.5 font-bold text-sm transition-all rounded-xl flex items-center gap-2 ${activeTab === 'personalized'
                ? 'bg-secondary text-white shadow-lg shadow-secondary/20'
                : 'text-muted-foreground hover:text-secondary hover:bg-secondary/5'
              }`}
          >
            <Sparkles className="h-4 w-4" />
            Recommended For You
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`px-6 py-2.5 font-bold text-sm transition-all rounded-xl flex items-center gap-2 ${activeTab === 'library'
                ? 'bg-secondary text-white shadow-lg shadow-secondary/20'
                : 'text-muted-foreground hover:text-secondary hover:bg-secondary/5'
              }`}
          >
            <BookOpen className="h-4 w-4" />
            Resource Library
          </button>
        </div>
      )}

      {/* Personalized Recommendations Tab */}
      {activeTab === 'personalized' && isSignedIn && (
        <div className="space-y-6">
          {isLoadingRecommendations ? (
            <div className="text-center py-12">
              <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Loading personalized recommendations...</h3>
              <p className="text-gray-600">Analyzing your profile and preferences</p>
            </div>
          ) : isRecommendationsError ? (
            <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6">
              <h3 className="text-lg font-medium text-secondary mb-2">Unable to load recommendations</h3>
              <p className="text-muted-foreground mb-4">We couldn't fetch personalized content at this time. Please try again later or browse our resource library.</p>
              <button
                onClick={() => setActiveTab('library')}
                className="px-4 py-2 bg-secondary text-white rounded-xl hover:bg-secondary/90 transition-colors"
              >
                Browse Resource Library
              </button>
            </div>
          ) : recommendations ? (
            <>
              {/* User Profile Summary */}
              {recommendations.userProfile && (
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-soft relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 transition-transform group-hover:scale-110" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/30">
                        <Sparkles className="h-5 w-5 text-secondary" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground tracking-tight">Your Personalized Feed</h3>
                    </div>
                    <p className="text-muted-foreground font-medium leading-relaxed max-w-2xl">
                      Optimized for your <span className="text-secondary font-bold">{recommendations.userProfile.wasteReductionPercentage}% waste reduction rate</span>
                      {recommendations.userProfile.budgetRange && <> and <span className="text-secondary font-bold">৳{recommendations.userProfile.budgetRange} monthly budget</span></>}.
                      {recommendations.userProfile.primaryConcerns.length > 0 && (
                        <> Focusing on: <span className="text-secondary font-bold uppercase tracking-wider text-xs">{recommendations.userProfile.primaryConcerns.join(', ')}</span>.</>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Articles Section */}
              {recommendations.articles && recommendations.articles.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Newspaper className="h-4 w-4 text-secondary" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground tracking-tight">Recommended Articles</h2>
                    <span className="bg-gray-50 text-muted-foreground text-xs font-bold px-3 py-1 rounded-full border border-gray-100">{recommendations.articles.length}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendations.articles.map((article) => (
                      <ArticleCard key={article.id} article={article} />
                    ))}
                  </div>
                </div>
              )}

              {/* Videos Section */}
              {recommendations.videos && recommendations.videos.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                      <VideoIcon className="h-4 w-4 text-secondary" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground tracking-tight">Recommended Videos</h2>
                    <span className="bg-gray-50 text-muted-foreground text-xs font-bold px-3 py-1 rounded-full border border-gray-100">{recommendations.videos.length}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendations.videos.map((video) => (
                      <VideoCard key={video.id} video={video} />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {(!recommendations.articles || recommendations.articles.length === 0) &&
                (!recommendations.videos || recommendations.videos.length === 0) && (
                  <div className="text-center py-12">
                    <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations available</h3>
                    <p className="text-gray-600 mb-4">We're still learning about your preferences. Check back soon!</p>
                    <button
                      onClick={() => setActiveTab('library')}
                      className="px-4 py-2 bg-secondary text-white rounded-xl hover:bg-secondary/90 transition-colors"
                    >
                      Browse Resource Library
                    </button>
                  </div>
                )}
            </>
          ) : null}
        </div>
      )}

      {/* Resource Library Tab */}
      {activeTab === 'library' && (
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="bg-white rounded-3xl shadow-soft border border-gray-100 p-8">
            <h3 className="text-xl font-bold text-foreground mb-6 tracking-tight">Search Knowledge Base</h3>
            <SearchBar
              onSearch={handleSearch}
              onClear={handleClearSearch}
              isSearching={isSearching}
            />
          </div>

          {/* Search Results */}
          {searchResults && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  Search Results for "{searchQuery}"
                </h3>
                <button
                  onClick={handleClearSearch}
                  className="text-sm text-secondary hover:text-secondary/80 font-medium"
                >
                  Clear Results
                </button>
              </div>

              {/* Result Tabs */}
              {searchType === 'both' && (
                <div className="flex gap-2 mb-4 border-b border-gray-200">
                  <button
                    onClick={() => setResultTab('articles')}
                    className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${resultTab === 'articles'
                        ? 'border-secondary text-secondary'
                        : 'border-transparent text-gray-600 hover:text-secondary'
                      }`}
                  >
                    Articles ({searchResults.articles.length})
                  </button>
                  <button
                    onClick={() => setResultTab('videos')}
                    className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${resultTab === 'videos'
                        ? 'border-secondary text-secondary'
                        : 'border-transparent text-gray-600 hover:text-secondary'
                      }`}
                  >
                    Videos ({searchResults.videos.length})
                  </button>
                </div>
              )}

              {/* Articles Results */}
              {(searchType === 'articles' || (searchType === 'both' && resultTab === 'articles')) && (
                <div>
                  {searchResults.articles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {searchResults.articles.map((article) => (
                        <ArticleCard key={article.id} article={article} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Newspaper className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">No articles found for "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              )}

              {/* Videos Results */}
              {(searchType === 'videos' || (searchType === 'both' && resultTab === 'videos')) && (
                <div>
                  {searchResults.videos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {searchResults.videos.map((video) => (
                        <VideoCard key={video.id} video={video} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <VideoIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">No videos found for "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Static Resources */}
          <div className="bg-white rounded-3xl shadow-soft border border-gray-100 p-8">
            <h3 className="text-xl font-bold text-foreground mb-8 tracking-tight">Curated Learning Path</h3>

            <div className="flex flex-wrap gap-2 mb-8">
              {tags.map((tag: string) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setSelectedTag(tag as string)}
                  className={
                    `px-5 py-2 rounded-xl border text-sm font-bold transition-all uppercase tracking-wider ` +
                    (selectedTag === tag
                      ? 'bg-secondary text-white border-secondary shadow-lg shadow-secondary/20'
                      : 'bg-white text-muted-foreground border-gray-100 hover:bg-secondary/10 hover:text-secondary')
                  }
                >
                  {tag as string}
                </button>
              ))}
            </div>

            <div className="mb-4 pb-4 border-b border-gray-200">
              <p className="text-sm text-gray-600">
                {isLoadingResources ? (
                  <>Loading resources...</>
                ) : isResourcesError ? (
                  <>Failed to load resources</>
                ) : (
                  <>Showing <span className="font-semibold text-gray-900">{filteredResources.length}</span> resources</>
                )}
              </p>
            </div>

            {isLoadingResources ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Loading...</h3>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredResources.map((resource: any) => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>

                {filteredResources.length === 0 && (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
                    <p className="text-gray-600">Try adjusting your filters or search term</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Add Resource Modal */}
      <AddResourceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}
