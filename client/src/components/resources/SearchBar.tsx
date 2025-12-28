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
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={handleClear}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    )}
                </div>
                <button
                    type="submit"
                    disabled={!query.trim() || isSearching}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                >
                    {isSearching ? 'Searching...' : 'Search'}
                </button>
            </div>

            {/* Search Type Tabs */}
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => setSearchType('both')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${searchType === 'both'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Both
                </button>
                <button
                    type="button"
                    onClick={() => setSearchType('articles')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${searchType === 'articles'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Articles Only
                </button>
                <button
                    type="button"
                    onClick={() => setSearchType('videos')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${searchType === 'videos'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                >
                    Videos Only
                </button>
            </div>
        </form>
    );
}
