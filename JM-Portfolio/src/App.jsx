import React, { lazy, Suspense } from "react";
import Home from "./Home.jsx";

const ServiceDetail = lazy(() => import("./ServiceDetail.jsx"));
const WorkPage = lazy(() => import("./WorkPage.jsx"));
const CaseStudy = lazy(() => import("./CaseStudy.jsx"));

export default function App() {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";

  let page;

  if (path === "/work") {
    page = <WorkPage />;
  } else if (path.startsWith("/work/")) {
    const slug = decodeURIComponent(path.slice("/work/".length));
    page = <CaseStudy slug={slug} />;
  } else if (path.startsWith("/services/")) {
    const slug = decodeURIComponent(path.slice("/services/".length));
    page = <ServiceDetail slug={slug} />;
  } else {
    return <Home />;
  }

  return (
    <Suspense fallback={null}>
      {page}
    </Suspense>
  );
}