import { useState } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
    onSearch: (query: string, type: 'articles' | 'videos' | 'both') => void;
    onClear: () => void;
    isSearching: boolean;
}

export function SearchBar({ onSearch, onClear, isSearching }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [searchType, setSearchType] = useState<'articles' | 'videos' | 'both'>('both');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSearch(query.trim(), searchType);
        }
    };

    const handleClear = () => {
        setQuery('');
        onClear();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-2">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search for articles and videos..."
                    className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-border/40 rounded-2xl text-foreground font-bold focus:ring-4 focus:ring-primary/20 focus:bg-white transition-all outline-none placeholder:text-gray-300"
                />
                {query && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-secondary"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>
            <button
                type="submit"
                disabled={!query.trim() || isSearching}
                className="px-8 py-3 bg-secondary text-white rounded-2xl hover:bg-secondary/90 disabled:bg-gray-200 disabled:cursor-not-allowed transition-all font-bold shadow-lg active:scale-95"
            >
                {isSearching ? 'Searching...' : 'Search'}
            </button>
        </div>

        {/* Search Type Tabs */}
        <div className="flex gap-2">
            <button
                type="button"
                onClick={() => setSearchType('both')}
                className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${searchType === 'both'
                        ? 'bg-secondary text-white shadow-md shadow-secondary/10'
                        : 'bg-white text-muted-foreground border border-border/50 hover:text-secondary'
                    }`}
            >
                Both
            </button>
            <button
                type="button"
                onClick={() => setSearchType('articles')}
                className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${searchType === 'articles'
                        ? 'bg-secondary text-white shadow-md shadow-secondary/10'
                        : 'bg-white text-muted-foreground border border-border/50 hover:text-secondary'
                    }`}
            >
                Articles
            </button>
            <button
                type="button"
                onClick={() => setSearchType('videos')}
                className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${searchType === 'videos'
                        ? 'bg-secondary text-white shadow-md shadow-secondary/10'
                        : 'bg-white text-muted-foreground border border-border/50 hover:text-secondary'
                    }`}
            >
                Videos
            </button>
        </div>
    </form>
    );
}
