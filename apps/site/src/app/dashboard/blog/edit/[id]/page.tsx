'use client';

import { useEffect } from "react";
import { Col, Row } from "react-bootstrap";
import { useTopbarContext } from "@/context/useTopbarContext";
import EditPost from './components/EditPost';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    id: string;
  };
}

const PostEditPage = ({ params }: PageProps) => {
  const { setPageTitle, setPageActions } = useTopbarContext();

  useEffect(() => {
    setPageTitle("Modifier l'article");
    setPageActions(null);

    return () => {
      setPageTitle('Dashboard');
      setPageActions(null);
    };
  }, [setPageTitle, setPageActions]);

  return (
    <>
      <Row>
        <Col lg={12}>
          <EditPost articleId={params.id} />
        </Col>
      </Row>
    </>
  );
};

export default PostEditPage;
