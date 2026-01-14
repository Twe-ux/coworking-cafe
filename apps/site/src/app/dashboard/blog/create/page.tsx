'use client';

import { useEffect } from 'react';
import { useTopbarContext } from '@/context/useTopbarContext';
import CreatePost from "./components/CreatePost";

// Force dynamic rendering
export const dynamic = "force-dynamic";

const PostCreatePage = () => {
  const { setPageTitle, setPageActions } = useTopbarContext();

  useEffect(() => {
    setPageTitle('Blog Create');
    setPageActions(null);

    return () => {
      setPageTitle('Dashboard');
      setPageActions(null);
    };
  }, [setPageTitle, setPageActions]);

  return (
    <>
      <CreatePost />
    </>
  );
};

export default PostCreatePage;
