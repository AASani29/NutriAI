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
    return 'bg-secondary/10';
  };
  const TypeIcon = getTypeIcon(resource.type);
  return (
    <div
      className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-5 border border-gray-100 hover:border-secondary/30 hover:shadow-soft transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${getTypeBgColor(resource.type)}`}> 
            <TypeIcon className="h-6 w-6 text-secondary" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-foreground mb-1 tracking-tight group-hover:text-secondary transition-colors">{resource.title}</h3>
            <div className="flex items-center space-x-2 mb-2">
              {resource.tags.map(tag => (
                <span key={tag} className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-secondary rounded-lg border border-primary/20">
                  {tag}
                </span>
              ))}
              <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-gray-50 text-muted-foreground rounded-lg border border-gray-100`}>
                {resource.type}
              </span>
            </div>
          </div>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed font-medium line-clamp-2">
        {resource.description}
      </p>
      {resource.url && (
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 text-sm font-bold text-secondary hover:text-secondary/80 transition-all group/link"
        >
          <span>Learn more</span>
          <ExternalLink className="h-4 w-4 group-hover/link:translate-x-0.5 transition-transform" />
        </a>
      )}
    </div>
  );
}
