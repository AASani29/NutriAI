import { useState } from 'react';
import { X, Plus, Globe, Lock, Link as LinkIcon, Tag, AlignLeft, Type, FileText, Video as VideoIcon } from 'lucide-react';
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
        <div className="fixed inset-0 bg-foreground/30 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-[2.5rem] shadow-2xl p-0 w-full max-w-xl border border-primary/20 animate-in zoom-in-95 duration-400 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary/10 to-transparent p-8 flex items-center justify-between border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/5 border border-primary/20">
                            <Plus className="h-7 w-7 text-secondary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-foreground tracking-tight">Add Resource</h2>
                            <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-0.5 opacity-70">Expand collective knowledge</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-3 bg-white text-muted-foreground hover:text-secondary hover:shadow-md rounded-xl transition-all border border-gray-100 active:scale-95"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto scrollbar-hide">
                    {/* Basic Information Section */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-1 w-6 bg-secondary rounded-full" />
                            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Base Information</span>
                        </div>

                        {/* Title */}
                        <div className="space-y-2 relative group">
                            <label htmlFor="title" className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                                Resource Title <span className="text-secondary">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none transition-colors group-focus-within:text-secondary">
                                    <Type className="h-4 w-4" />
                                </div>
                                <input
                                    type="text"
                                    id="title"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-border/40 rounded-2xl text-foreground font-bold focus:ring-4 focus:ring-primary/10 focus:bg-white focus:border-secondary transition-all outline-none placeholder:text-gray-300"
                                    placeholder="The Ultimate Guide to Meal Prep"
                                />
                            </div>
                        </div>

                        {/* URL */}
                        <div className="space-y-2 relative group">
                            <label htmlFor="url" className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                                Resource URL <span className="text-secondary">*</span>
                            </label>
                            <div className="relative">
                                <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none transition-colors group-focus-within:text-secondary">
                                    <LinkIcon className="h-4 w-4" />
                                </div>
                                <input
                                    type="url"
                                    id="url"
                                    required
                                    value={formData.url}
                                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                    className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-border/40 rounded-2xl text-foreground font-bold focus:ring-4 focus:ring-primary/10 focus:bg-white focus:border-secondary transition-all outline-none placeholder:text-gray-300"
                                    placeholder="https://example.com/guide"
                                />
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2 relative group">
                            <label htmlFor="description" className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                                Description
                            </label>
                            <div className="relative">
                                <div className="absolute left-5 top-5 text-muted-foreground pointer-events-none transition-colors group-focus-within:text-secondary">
                                    <AlignLeft className="h-4 w-4" />
                                </div>
                                <textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-border/40 rounded-2xl text-foreground font-bold focus:ring-4 focus:ring-primary/10 focus:bg-white focus:border-secondary transition-all outline-none resize-none placeholder:text-gray-300"
                                    placeholder="Learn how to save 10 hours a week with our proven prep methodology..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Categorization & Privacy Section */}
                    <div className="space-y-5">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="h-1 w-6 bg-secondary rounded-full" />
                            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">Classification</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Type Toggle */}
                            <div className="space-y-3">
                                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                                    Format
                                </label>
                                <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-border/40">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'Article' })}
                                        className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all font-bold text-xs ${formData.type === 'Article' ? 'bg-white text-secondary shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        <FileText className="h-4 w-4" />
                                        Article
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, type: 'Video' })}
                                        className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all font-bold text-xs ${formData.type === 'Video' ? 'bg-white text-secondary shadow-md' : 'text-muted-foreground hover:text-foreground'}`}
                                    >
                                        <VideoIcon className="h-4 w-4" />
                                        Video
                                    </button>
                                </div>
                            </div>

                            {/* Tags */}
                            <div className="space-y-3 group">
                                <label htmlFor="tags" className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                                    Tags
                                </label>
                                <div className="relative">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none transition-colors group-focus-within:text-secondary">
                                        <Tag className="h-4 w-4" />
                                    </div>
                                    <input
                                        type="text"
                                        id="tags"
                                        value={formData.tags}
                                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                        className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-border/40 rounded-2xl text-foreground font-bold focus:ring-4 focus:ring-primary/10 focus:bg-white focus:border-secondary transition-all outline-none placeholder:text-gray-300"
                                        placeholder="mealprep, health"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Visibility Switch */}
                        <div className="flex items-center justify-between p-6 bg-background rounded-3xl border-2 border-primary/5 shadow-inner">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${formData.isPublic ? 'bg-secondary/10 text-secondary' : 'bg-gray-100 text-muted-foreground'}`}>
                                    {formData.isPublic ? <Globe className="h-6 w-6" /> : <Lock className="h-6 w-6" />}
                                </div>
                                <div>
                                    <p className="font-bold text-foreground text-sm tracking-tight">{formData.isPublic ? 'Public Visibility' : 'Private Mode'}</p>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                        {formData.isPublic ? 'Visible to community' : 'Personal archives only'}
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
                                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 ${formData.isPublic ? 'bg-secondary' : 'bg-gray-300'}`}
                            >
                                <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-all duration-400 shadow-lg ${formData.isPublic ? 'translate-x-7' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {createMutation.isError && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl animate-in shake duration-500">
                            <p className="text-xs font-bold text-red-600 tracking-tight">
                                {createMutation.error instanceof Error ? createMutation.error.message : 'System failed to finalize resource'}
                            </p>
                        </div>
                    )}
                </form>

                {/* Actions */}
                <div className="p-8 bg-gray-50/50 border-t border-gray-100/60">
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="py-4 bg-white text-muted-foreground rounded-2xl hover:bg-gray-100 transition-all font-bold border border-gray-200 active:scale-95 flex items-center justify-center gap-2"
                        >
                            <X className="h-4 w-4" />
                            Discard
                        </button>
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={createMutation.isPending || !formData.title || !formData.url}
                            className="py-4 bg-secondary text-white rounded-2xl font-bold hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-secondary/20 active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {createMutation.isPending ? (
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Plus className="h-5 w-5" />
                                    Publish
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
