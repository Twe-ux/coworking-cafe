"use client";

import { Row } from "react-bootstrap";
import Articles from "./components/Articles";
import FreshArticles from "./components/FreshArticles";
import Posts from "./components/Posts";
import { useTopbarContext } from "../../../context/useTopbarContext";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Force dynamic rendering
export const dynamic = "force-dynamic";

const PostPage = () => {
  const { setPageTitle, setPageActions } = useTopbarContext();
  const router = useRouter();

  useEffect(() => {
    setPageTitle("Articles du blog");
    setPageActions(
      <>
        <button
          onClick={() => router.push("/dashboard/blog/create")}
          style={{
            padding: "8px 16px",
            background: "#667eea",
            border: "1px solid #667eea",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 500,
            color: "white",
            cursor: "pointer",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#5568d3";
            e.currentTarget.style.borderColor = "#5568d3";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#667eea";
            e.currentTarget.style.borderColor = "#667eea";
          }}
        >
          + Nouvel article
        </button>
        <button
          onClick={() => router.push("/dashboard/blog/categories")}
          style={{
            padding: "8px 16px",
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: 500,
            color: "#374151",
            cursor: "pointer",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f9fafb";
            e.currentTarget.style.borderColor = "#d1d5db";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "white";
            e.currentTarget.style.borderColor = "#e5e7eb";
          }}
        >
          Catégories
        </button>
      </>,
    );

    return () => {
      setPageTitle("Dashboard");
      setPageActions(null);
    };
  }, [setPageTitle, setPageActions, router]);

  return (
    <>
      <Row>
        <FreshArticles />
        <Articles />
      </Row>
      <Row>
        <Posts />
      </Row>
    </>
  );
};

export default PostPage;
