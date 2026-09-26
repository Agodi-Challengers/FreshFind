import Breadcrumb from "./Breadcrumb.jsx";

/**
 * Photo banner under the navbar (Figma "Breadcrumbs" frame).
 * Shows the breadcrumb and, on some pages, a title, a short text or extra content.
 */
export default function PageBanner({ crumbs, title, text, children }) {
  return (
    <section className={`page-banner${title ? " page-banner--tall" : ""}`}>
      <div className="container page-banner__inner">
        <Breadcrumb items={crumbs} light />
        {title && <h1 className="page-banner__title">{title}</h1>}
        {text && <p className="page-banner__text">{text}</p>}
        {children}
      </div>
    </section>
  );
}
