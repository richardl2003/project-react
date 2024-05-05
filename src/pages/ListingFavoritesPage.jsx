import { useMemo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchListings } from '@/state/listings/listingsSlice';

import ListingList from '@/components/ListingList';

const ListingFavoritesPage = () => {
  const { listings, favoriteListingIds } = useSelector(
    (state) => state.listings,
  );

  const dispatch = useDispatch();

  const favoriteListings = useMemo(
    () => listings.filter((listing) => favoriteListingIds.includes(listing.id)),
    [listings, favoriteListingIds],
  );

  useEffect(() => {
    const request = dispatch(fetchListings());

    return () => {
      request.abort();
    };
  }, [dispatch]);

  return (
    <div className='container py-4'>
      <ListingList listings={favoriteListings} />
    </div>
  );
};

export default ListingFavoritesPage;
