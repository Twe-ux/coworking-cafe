'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import type { ComponentPropsWithoutRef } from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

interface CodeComponentProps extends ComponentPropsWithoutRef<'code'> {
  inline?: boolean;
}

const MarkdownRenderer = ({ content, className = '' }: MarkdownRendererProps) => {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          h1: ({ ...props }) => <h1 className="mb-4 mt-5" {...props} />,
          h2: ({ ...props }) => <h2 className="mb-3 mt-4" {...props} />,
          h3: ({ ...props }) => <h3 className="mb-3 mt-4" {...props} />,
          h4: ({ ...props }) => <h4 className="mb-2 mt-3" {...props} />,
          p: ({ ...props }) => <p className="mb-3" {...props} />,
          ul: ({ ...props }) => <ul className="mb-3 ms-4" {...props} />,
          ol: ({ ...props }) => <ol className="mb-3 ms-4" {...props} />,
          li: ({ ...props }) => <li className="mb-1" {...props} />,
          blockquote: ({ ...props }) => (
            <blockquote className="border-start border-primary border-4 ps-3 py-2 my-4 bg-light" {...props} />
          ),
          code: ({ inline, ...props }: CodeComponentProps) =>
            inline ? (
              <code className="bg-light px-2 py-1 rounded" {...props} />
            ) : (
              <code className="d-block bg-dark text-light p-3 rounded my-3 overflow-auto" {...props} />
            ),
          pre: ({ ...props }) => <pre className="mb-3" {...props} />,
          a: ({ ...props }) => <a className="text-primary text-decoration-underline" target="_blank" rel="noopener noreferrer" {...props} />,
          img: ({ ...props }) => (
            <img className="img-fluid rounded my-3 w-100" style={{ maxHeight: '500px', objectFit: 'cover' }} {...props} />
          ),
          table: ({ ...props }) => (
            <div className="table-responsive my-3">
              <table className="table table-bordered table-striped" {...props} />
            </div>
          ),
          thead: ({ ...props }) => <thead className="table-dark" {...props} />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
