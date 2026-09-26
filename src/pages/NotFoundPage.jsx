import { Link } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb.jsx";

export default function NotFoundPage() {
  return (
    <section className="container page-header notfound">
      <Breadcrumb
        items={[{ label: "Home", to: "/" }, { label: "Page not found" }]}
      />
      <div className="page-header__copy">
        <span className="eyebrow">404</span>
        <h1 className="page-title">We couldn’t find that page</h1>
        <p className="lead">
          The link may be old, or the market may have moved. Try the directory
          instead.
        </p>
        <div className="d-flex flex-wrap gap-2 mt-3">
          <Link to="/directory" className="btn btn--primary btn--lg">
            Browse the directory
          </Link>
          <Link to="/" className="btn btn--outline btn--lg">
            Go home
          </Link>
        </div>
      </div>
    </section>
  );
}
