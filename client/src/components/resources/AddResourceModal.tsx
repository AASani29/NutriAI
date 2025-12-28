import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { useAuth } from '@clerk/clerk-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createResource } from '../../services/resources-service';

interface AddResourceModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AddResourceModal({ isOpen, onClose }: AddResourceModalProps) {
    const { getToken } = useAuth();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        url: '',
        type: 'Article' as 'Article' | 'Video',
        tags: '',
        isPublic: true,
    });

    const createMutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const token = await getToken();
            if (!token) throw new Error('Not authenticated');

            return createResource(token, {
                ...data,
                tags: data.tags.split(',').map(t => t.trim()).filter(Boolean),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resources'] });
            handleClose();
        },
    });

    const handleClose = () => {
        setFormData({
            title: '',
            description: '',
            url: '',
            type: 'Article',
            tags: '',
            isPublic: true,
        });
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                        <Plus className="h-6 w-6 text-green-600" />
                        <h2 className="text-xl font-bold text-gray-900">Add Resource</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            required
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Enter resource title"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="Brief description of the resource"
                        />
                    </div>

                    {/* URL */}
                    <div>
                        <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">
                            URL <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="url"
                            id="url"
                            required
                            value={formData.url}
                            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="https://example.com/article"
                        />
                    </div>

                    {/* Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Type <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value="Article"
                                    checked={formData.type === 'Article'}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'Article' | 'Video' })}
                                    className="mr-2"
                                />
                                <span className="text-sm text-gray-700">Article</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    value="Video"
                                    checked={formData.type === 'Video'}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'Article' | 'Video' })}
                                    className="mr-2"
                                />
                                <span className="text-sm text-gray-700">Video</span>
                            </label>
                        </div>
                    </div>

                    {/* Tags */}
                    <div>
                        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                            Tags
                        </label>
                        <input
                            type="text"
                            id="tags"
                            value={formData.tags}
                            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            placeholder="meal prep, healthy eating, budget (comma-separated)"
                        />
                        <p className="text-xs text-gray-500 mt-1">Separate multiple tags with commas</p>
                    </div>

                    {/* Public/Private Toggle */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                            <p className="font-medium text-gray-900">Visibility</p>
                            <p className="text-sm text-gray-600">
                                {formData.isPublic ? 'Everyone can see this resource' : 'Only you can see this resource'}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.isPublic ? 'bg-green-600' : 'bg-gray-300'
                                }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.isPublic ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Error Message */}
                    {createMutation.isError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-700">
                                {createMutation.error instanceof Error ? createMutation.error.message : 'Failed to create resource'}
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={createMutation.isPending}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                        >
                            {createMutation.isPending ? 'Adding...' : 'Add Resource'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
