export interface MenuItem {
  title: string;
  link: string;
  submenu?: { title: string; link: string }[];
}

export const menuData: MenuItem[] = [
  {
    title: "Accueil",
    link: "/",
  },
  {
    title: "Concept",
    link: "#",
    submenu: [
      { title: "Working café", link: "/concept" },
      { title: "Take Away", link: "/take-away" },
      { title: "Notre histoire", link: "/history" },
      { title: "Manifeste", link: "/manifest" },
    ],
  },
  {
    title: "Espaces",
    link: "/spaces",
  },
  {
    title: "Tarifs",
    link: "#",
    submenu: [
      { title: "Nos offres", link: "/pricing" },
      { title: "Programme membre", link: "/members-program" },
      { title: "Offres étudiantes", link: "/student-offers" },
    ],
  },
  {
    title: "Menu",
    link: "/boissons",
  },
  // {
  //   title: "Menu",
  //   link: "#",
  //   submenu: [
  //     { title: "Boissons", link: "/boissons" },
  //     { title: "Foods", link: "/food" },
  //   ],
  // },
  // {
  //   title: "Professionnels",
  //   link: "/professionnels",
  // },
  {
    title: "Le Mag'",
    link: "/blog",
  },

  // {
  //   title: "admin",
  //   link: "#",
  //   submenu: [
  //     { title: "Promo'", link: "/scan" },
  //     { title: "dashboard", link: "/dashboard" },
  //   ],
  // },
  // {
  //   title: "Pages",
  //   link: "#",
  //   submenu: [
  //     { title: "Faq's", link: "/faq" },
  //     { title: "Pricing", link: "/pricing" },
  //     { title: "Projects", link: "/projects" },
  //     { title: "Project Details", link: "/project-details" },
  //   ],
  // },
  // {
  //   title: "Blog",
  //   link: "#",
  //   submenu: [
  //     { title: "Blog", link: "/blog" },
  //     { title: "Blog Details", link: "/blog-details" },
  //   ],
  // },
  // {
  //   title: "Contact Us",
  //   link: "/contact",
  // },
];
