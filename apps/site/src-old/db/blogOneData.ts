export interface BlogPost {
  id: number;
  title: string;
  author: string;
  comments: number;
  imgSrc: string;
  slug: string;
}

export const blogOneData: BlogPost[] = [
  {
    id: 1,
    title: 'Change your life to a get 09 thing with the lifestyle',
    author: 'Danuel Stone',
    comments: 34,
    imgSrc: '/images/blogs/blog-1.png',
    slug: 'change-your-life-to-a-get-09-thing-with-the-lifestyle',
  },
  {
    id: 2,
    title: 'How to increase your business policy for next generation',
    author: 'William Dalton',
    comments: 34,
    imgSrc: '/images/blogs/blog-2.png',
    slug: 'how-to-increase-your-business-policy-for-next-generation',
  },
  {
    id: 3,
    title: 'How to increase in-app purchase why lead generation is key for',
    author: 'Sojol Saiful',
    comments: 3,
    imgSrc: '/images/blogs/blog-3.png',
    slug: 'how-to-increase-in-app-purchase-why-lead-generation-is-key-for',
  },
  {
    id: 4,
    title: 'Beauty Queens Need Beauty Material & Products',
    author: 'Danuel Stone',
    comments: 34,
    imgSrc: '/images/blogs/blog-4.png',
    slug: 'beauty-queens-need-beauty-material-and-products',
  },
  {
    id: 5,
    title: 'Life Health Continues To Spread Rapidly, Are Many People',
    author: 'William Dalton',
    comments: 34,
    imgSrc: '/images/blogs/blog-5.png',
    slug: 'life-health-continues-to-spread-rapidly-are-many-people',
  },
  {
    id: 6,
    title: 'The Secret Math Behind Mind Reading Magic Tricks',
    author: 'Sojol Saiful',
    comments: 3,
    imgSrc: '/images/blogs/blog-6.png',
    slug: 'the-secret-math-behind-mind-reading-magic-tricks',
  },
];
