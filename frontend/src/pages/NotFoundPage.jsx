import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb.jsx';

export default function NotFoundPage() {
  return (
    <section className="ff-container ff-page-header ff-notfound">
      <Breadcrumb items={[{ label: 'Home', to: '/' }, { label: 'Page not found' }]} />
      <div className="ff-page-header__copy">
        <span className="ff-eyebrow">404</span>
        <h1 className="ff-page-title">We couldn’t find that page</h1>
        <p className="ff-lead">The link may be old, or the market may have moved. Try the directory instead.</p>
        <div className="d-flex flex-wrap gap-2 mt-3">
          <Link to="/directory" className="ff-btn ff-btn--primary ff-btn--lg">
            Browse the directory
          </Link>
          <Link to="/" className="ff-btn ff-btn--outline ff-btn--lg">
            Go home
          </Link>
        </div>
      </div>
    </section>
  );
}
