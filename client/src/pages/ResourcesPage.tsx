import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen } from 'lucide-react';
import { ResourceCard } from '../components/resources/ResourceCard';
import { getAllResources } from '../services/resources-service';





export function ResourcesPage() {
  const [selectedTag, setSelectedTag] = useState<string>('All');
  const { data: resources = [], isLoading, isError } = useQuery({
    queryKey: ['resources'],
    queryFn: getAllResources,
  });

  const allTags = Array.from(new Set(resources.flatMap((r: any) => r.tags as string[]))) as string[];
  const tags: string[] = ['All', ...allTags];

  const filteredResources = resources.filter((resource: any) => {
    const matchesTag = selectedTag === 'All' || (resource.tags as string[]).includes(selectedTag);
    return matchesTag;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-2">
        <BookOpen className="h-6 w-6 text-green-600" />
        <h1 className="text-xl font-bold text-gray-900">Food Sustainability Resources</h1>
      </div>
      <p className="text-gray-600 mt-1">Learn best practices for food management and waste reduction</p>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map((tag: string) => (
            <button
              key={tag}
              type="button"
              onClick={() => setSelectedTag(tag as string)}
              className={
                `px-3 py-1 rounded-full border text-sm font-medium transition-colors ` +
                (selectedTag === tag
                  ? 'bg-green-600 text-white border-green-600 shadow'
                  : 'bg-white text-gray-800 border-gray-300 hover:bg-green-50')
              }
            >
              {tag as string}
            </button>
          ))}
        </div>

        <div className="mb-4 pb-4 border-b border-gray-200">
          <p className="text-sm text-gray-600">
            {isLoading ? (
              <>Loading resources...</>
            ) : isError ? (
              <>Failed to load resources</>
            ) : (
              <>Showing <span className="font-semibold text-gray-900">{filteredResources.length}</span> resources</>
            )}
          </p>
        </div>

        {isLoading ? (
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
  );
}

