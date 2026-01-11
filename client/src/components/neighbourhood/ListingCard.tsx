import { useState } from 'react';
import {
  MapPin,
  Clock,
  Package,
  AlertCircle,
  CheckCircle,
  Star,
  MessageSquare,
  ArrowDownCircle,
  Trash2
} from 'lucide-react';
import type { FoodListing, ClaimListingRequest } from './types';
import { ListingStatus } from './types';
import { useClaimListing, useCompleteListing, useDeleteListing } from './sharing-service';
import ReceiveListingModal from './ReceiveListingModal';
import ClaimModal from './modal/ClaimModal';
import CompleteModal from './modal/CompleteModal';
import DeleteListingModal from './modal/DeleteListingModal';
import { useAuth } from "@clerk/clerk-react";
import { NeighborhoodMap } from './NeighborhoodMap';

interface ListingCardProps {
  listing: FoodListing;
  showActions?: boolean;
  isOwner?: boolean;
  isClaimer?: boolean;
  onUpdate?: () => void;
}

export default function ListingCard({
  listing,
  showActions = true,
  isOwner = false,
  isClaimer: propIsClaimer = false,
  onUpdate
}: ListingCardProps) {
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);

  const claimMutation = useClaimListing();
  const completeMutation = useCompleteListing();
  const deleteMutation = useDeleteListing();
  const { userId } = useAuth();

  // Use prop if provided, otherwise fallback to check (note: check might be flawed if userId is Clerk ID vs internal ID)
  // For MyBookings, we will explicitly pass true.
  const isClaimer = propIsClaimer || (userId && listing.sharingLogs?.some(log => log.claimerId === userId));

  const itemName = listing.inventoryItem.customName ||
    listing.inventoryItem.foodItem?.name ||
    'Unknown Item';
  const category = listing.inventoryItem.foodItem?.category || 'Custom';

  const getStatusColor = (status: string) => {
    switch (status) {
      case ListingStatus.AVAILABLE:
        return 'bg-primary/20 text-black border-primary';
      case ListingStatus.CLAIMED:
        return 'bg-black text-white border-black';
      case ListingStatus.COMPLETED:
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case ListingStatus.CANCELLED:
        return 'bg-red-50 text-red-600 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case ListingStatus.AVAILABLE:
        return <Package className="w-3 h-3" />;
      case ListingStatus.CLAIMED:
        return <Clock className="w-3 h-3" />;
      case ListingStatus.COMPLETED:
        return <CheckCircle className="w-3 h-3" />;
      case ListingStatus.CANCELLED:
        return <AlertCircle className="w-3 h-3" />;
      default:
        return <Package className="w-3 h-3" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case ListingStatus.AVAILABLE:
        return 'Listed';
      case ListingStatus.CLAIMED:
        return 'Booked';
      case ListingStatus.COMPLETED:
        if (isOwner) return 'Delivered';
        if (isClaimer) return 'Received';
        return 'Completed';
      case ListingStatus.CANCELLED:
        return 'Cancelled';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleClaim = async (data: ClaimListingRequest) => {
    try {
      await claimMutation.mutateAsync({ id: listing.id, data });
      setShowClaimModal(false);
      onUpdate?.();
    } catch (error) {
      console.error('Error claiming listing:', error);
    }
  };

  const handleComplete = async (notes: string) => {
    try {
      await completeMutation.mutateAsync({ id: listing.id, notes });
      setShowCompleteModal(false);
      onUpdate?.();
    } catch (error) {
      console.error('Error completing listing:', error);
    }
  };

  const handleReceive = async (targetInventoryId: string) => {
    try {
      await completeMutation.mutateAsync({
        id: listing.id,
        targetInventoryId,
        notes: 'Received via app'
      });
      setShowReceiveModal(false);
      onUpdate?.();
    } catch (error) {
      console.error('Error receiving listing:', error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(listing.id);
      setShowDeleteModal(false);
      onUpdate?.();
    } catch (error) {
      console.error('Error deleting listing:', error);
    }
  };

  const isExpiringSoon = listing.availableUntil &&
    new Date(listing.availableUntil) < new Date(Date.now() + 24 * 60 * 60 * 1000);

  return (
    <>
      <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-soft hover:shadow-xl transition-all hover:border-black/5 group">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-black text-lg text-black mb-1 group-hover:text-primary transition-colors">
              {listing.title}
            </h3>
            <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">
              {itemName} • {category}
            </p>
          </div>
          <div className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${getStatusColor(listing.status)}`}>
            {getStatusIcon(listing.status)}
            {getStatusText(listing.status)}
          </div>
        </div>

        {/* Description */}
        {listing.description && (
          <p className="text-muted-foreground text-sm mb-6 line-clamp-2 font-medium leading-relaxed">
            {listing.description}
          </p>
        )}

        {/* Quantity and Details */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2 text-sm bg-gray-50 p-2.5 rounded-xl border border-gray-100/50">
            <Package className="w-4 h-4 text-black" />
            <span className="text-black font-bold">
              {listing.quantity} {listing.unit || 'units'}
            </span>
          </div>
          {listing.pickupLocation && (
            <div className="flex items-center justify-between text-sm bg-gray-50 p-2.5 rounded-xl border border-gray-100/50">
              <div className="flex items-center gap-2 truncate flex-1 mr-2">
                <MapPin className="w-4 h-4 text-black" />
                <span className="text-black font-bold truncate">
                  {listing.pickupLocation}
                </span>
              </div>
              {listing.latitude && listing.longitude && (
                <button
                  onClick={() => setShowMapModal(true)}
                  className="text-[10px] text-primary hover:text-black font-black uppercase tracking-widest bg-white border border-gray-100 px-2 py-1 rounded-lg shadow-sm transition-all active:scale-95"
                  title="View on Map"
                >
                  Map
                </button>
              )}
            </div>
          )}
        </div>

        {/* Expiry Warning */}
        {isExpiringSoon && listing.status === ListingStatus.AVAILABLE && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <span className="text-orange-800 text-sm font-medium">
                Expires soon: {formatDate(listing.availableUntil!)}
              </span>
            </div>
          </div>
        )}

        {/* Lister Info */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-6 pt-4 border-t border-gray-50">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-black rounded-full flex items-center justify-center text-[8px] text-white">
              {listing.lister.profile?.fullName?.[0] || 'A'}
            </div>
            <span>
              {listing.lister.profile?.fullName || 'Anonymous'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{formatDate(listing.createdAt)}</span>
          </div>
        </div>

        {/* Claims Info - Only visible to owner or claimer */}
        {listing.sharingLogs.length > 0 && (isOwner || isClaimer) && (
          <div className="bg-secondary/10 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-foreground/60" />
              <span className="text-sm font-medium text-foreground">
                {listing.sharingLogs.length} booking(s)
              </span>
            </div>
            {listing.sharingLogs.slice(0, 2).map(log => (
              <div key={log.id} className="text-sm text-foreground/70 mb-1">
                <span className="font-medium">{log.claimerName || 'Anonymous'}</span>
                {log.claimedAt && (
                  <span className="text-foreground/50"> • {formatDate(log.claimedAt)}</span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        {showActions && (
          <div className="flex gap-2 flex-wrap">
            {/* Owner Actions */}
            {/* Lister can no longer mark as complete - only Booker can receive */}
            {/* 
            {isOwner && listing.status === ListingStatus.CLAIMED && (
              <button
                onClick={() => setShowCompleteModal(true)}
                disabled={completeMutation.isPending}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-smooth font-medium flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                {completeMutation.isPending ? 'Completing...' : 'Mark Complete'}
              </button>
            )} 
            */}

            {/* Owner Delete Action - Visible if not completed */}
            {isOwner && listing.status !== ListingStatus.COMPLETED && (
              <button
                onClick={() => setShowDeleteModal(true)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-smooth font-medium flex items-center justify-center gap-2"
                title="Delete Listing"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            {/* Claimer Actions - Receive (Visible when Booked) */}
            {isClaimer && listing.status === ListingStatus.CLAIMED && (
              <button
                onClick={() => setShowReceiveModal(true)}
                disabled={completeMutation.isPending}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-smooth font-medium flex items-center justify-center gap-2"
              >
                <ArrowDownCircle className="w-4 h-4" />
                {completeMutation.isPending ? 'Receiving...' : 'Receive'}
              </button>
            )}

            {/* Booking Action for non-owner, non-claimer, available items */}
            {!isOwner && !isClaimer && listing.status === ListingStatus.AVAILABLE && (
              <button
                onClick={() => setShowClaimModal(true)}
                disabled={claimMutation.isPending}
                className="flex-1 px-4 py-3 bg-primary text-black rounded-2xl hover:bg-black hover:text-white disabled:opacity-50 transition-all font-black flex items-center justify-center gap-2 shadow-xl shadow-primary/10"
              >
                <Star className="w-4 h-4" />
                {claimMutation.isPending ? 'Booking...' : 'Book Now'}
              </button>
            )}

            {listing.status === ListingStatus.COMPLETED && (
              <div className="flex-1 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg text-center font-medium">
                <CheckCircle className="w-4 h-4 inline mr-2" />
                {isOwner ? 'Delivered' : isClaimer ? 'Received' : 'Completed'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Claim/Book Modal */}
      {showClaimModal && (
        <ClaimModal
          listing={listing}
          onClose={() => setShowClaimModal(false)}
          onClaim={handleClaim}
          isLoading={claimMutation.isPending}
        />
      )}

      {/* Complete Modal */}
      {showCompleteModal && (
        <CompleteModal
          listing={listing}
          onClose={() => setShowCompleteModal(false)}
          onComplete={handleComplete}
          isLoading={completeMutation.isPending}
        />
      )}

      {/* Receive Modal */}
      {showReceiveModal && (
        <ReceiveListingModal
          listingTitle={listing.title}
          onClose={() => setShowReceiveModal(false)}
          onReceive={handleReceive}
          isLoading={completeMutation.isPending}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <DeleteListingModal
          listing={listing}
          onClose={() => setShowDeleteModal(false)}
          onDelete={handleDelete}
          isLoading={deleteMutation.isPending}
        />
      )}

      {/* Map Modal */}
      {showMapModal && listing.latitude && listing.longitude && (
        <div className="fixed inset-0 bg-background/60 backdrop-blur-md flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-2xl p-6 w-full max-w-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-black text-black">Pickup Location</h3>
                <p className="text-xs text-muted-foreground font-medium">{listing.pickupLocation}</p>
              </div>
              <button
                onClick={() => setShowMapModal(false)}
                className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center text-muted-foreground hover:text-black transition-colors"
              >
                ✕
              </button>
            </div>

            <NeighborhoodMap
              listings={[listing]}
              userLat={listing.latitude}
              userLng={listing.longitude}
              height="400px"
            />

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowMapModal(false)}
                className="px-8 py-3 bg-black text-white rounded-2xl hover:bg-primary hover:text-white transition-all font-black uppercase tracking-widest text-xs"
              >
                Close Map
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}