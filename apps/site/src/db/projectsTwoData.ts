export interface ProjectTwo {
  id: number;
  title: string;
  categories: string[];
  imgSrc: string;
}

export const projectsTwoData: ProjectTwo[] = [
  {
    id: 1,
    title: "Paid Media Solution",
    categories: ["Marketing", "Solution"],
    imgSrc: "/images/projects/project-1.png",
  },
  {
    id: 2,
    title: "Green Minimal & 3d Design",
    categories: ["3D", "Design"],
    imgSrc: "/images/projects/project-2.png",
  },
  {
    id: 3,
    title: "Business Marketing Boosting",
    categories: ["Business", "Boosting"],
    imgSrc: "/images/projects/project-3.png",
  },
  {
    id: 4,
    title: "IT Solution & Business",
    categories: ["Business", "Solution"],
    imgSrc: "/images/projects/project-4.png",
  },
  {
    id: 5,
    title: "Book Cover Design",
    categories: ["Book", "Design"],
    imgSrc: "/images/projects/project-5.png",
  },
  {
    id: 6,
    title: "Tree Plant Design 2023",
    categories: ["Plant", "Design"],
    imgSrc: "/images/projects/project-6.png",
  },
];
