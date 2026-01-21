import Link from "next/link";

interface BlogCardProps {
  // author: string;
  // comments: number;
  imgSrc: string;
  title: string;
  slug: string;
  id?: number;
}

const BlogCard = ({ imgSrc, title, slug }: BlogCardProps) => {
  return (
    <div className="blogs__wapper_card">
      <Link href={`/blog/${slug}`}>
        <img src={imgSrc} alt={title} className="card__thumb" />
      </Link>
      <div>
        <Link href={`/blog/${slug}`} className="card__title t__28">
          {title}
        </Link>
        {/* <div className="d-flex card__author">
          <p>
            <img src="/icons/user-black.svg" alt="author" />
            <span> {author}</span>
          </p>
          <p>
            <img src="/icons/comments-black.svg" alt="comments" />
            <span> {comments} Comments</span>
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default BlogCard;
