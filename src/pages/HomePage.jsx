import axios from 'axios';
import { useState, useEffect, useRef } from 'react';

import api from '@/api';
import ListingFilters from '@/components/ListingFilters';
import ListingList from '@/components/ListingList';
import { Separator, Spinner } from '@/components/ui';

const HomePage = () => {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    dates: undefined,
    guests: 0,
    search: '',
  });

  // useRef is used to persist the value between renders
  const abortController = useRef(null);

  useEffect(() => {
    const fetchListings = async () => {
      // Reset to default before new request
      setIsLoading(true);
      setError(null);

      abortController.current = new AbortController();

      try {
        const response = await api.get('/api/listings', {
          params: filters,
          signal: abortController.current.signal,
        });
        setListings(response.data);
      } catch (error) {
        if (axios.isCancel(error)) {
          return;
        }
        setError('Something went wrong. Please try again later.');
      } finally {
        setIsLoading(false);
      }

      return () => {
        abortController.current.abort();
      };
    };

    fetchListings();
  }, [filters]);

  const handleFilters = (filters) => {
    setFilters(filters);
  };

  const renderListingList = () => {
    if (isLoading) {
      return (
        <div className='flex justify-center'>
          <Spinner />
        </div>
      );
    }

    if (error) {
      return <div className='text-center'>{error}</div>;
    }
    return <ListingList listings={listings} />;
  };

  return (
    <div className='container py-4'>
      <div className='mb-4'>
        <ListingFilters onChange={handleFilters} />
        <Separator className='my-4' />
      </div>
      {renderListingList()}
    </div>
  );
};

export default HomePage;
