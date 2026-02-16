"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

const PathNameLoad = (): null => {
  const pathName = usePathname();
  useEffect(() => {
    const body = document.querySelector("body");
    if (body) {
      body.classList.remove("home1", "home2", "about__page");
      if (pathName === "/" || "/professional") {
        body.classList.add("home1");
      } else if (pathName === "/home-2") {
        body.classList.add("home2");
      } else if (pathName === "/about") {
        body.classList.add("about__page");
      }
    }
  }, [pathName]);

  return null;
};
export default PathNameLoad;
