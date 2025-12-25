import { FileText, Video, ExternalLink } from 'lucide-react';

export interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  type: string;
  tags: string[];
}

export function ResourceCard({ resource }: { resource: Resource }) {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Article': return FileText;
      case 'Video': return Video;
      default: return FileText;
    }
  };
  const getTypeBgColor = (type: string) => {
    switch (type) {
      case 'Article': return 'bg-blue-600';
      case 'Video': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };
  const TypeIcon = getTypeIcon(resource.type);
  return (
    <div
      className="bg-gradient-to-br from-white to-gray-50 rounded-lg p-5 border-2 border-gray-200 hover:border-green-300 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${getTypeBgColor(resource.type)}`}> 
            <TypeIcon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{resource.title}</h3>
            <div className="flex items-center space-x-2 mb-2">
              {resource.tags.map(tag => (
                <span key={tag} className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full border border-gray-200">
                  {tag}
                </span>
              ))}
              <span className={`px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded-full border border-gray-200`}>
                {resource.type}
              </span>
            </div>
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-700 mb-4 leading-relaxed">
        {resource.description}
      </p>
      {resource.url && (
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 text-sm font-medium text-green-600 hover:text-green-700 transition-colors"
        >
          <span>Learn more</span>
          <ExternalLink className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}
