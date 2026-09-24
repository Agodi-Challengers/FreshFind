import Icon from './Icon.jsx';
import { useBookmarks } from '../context/BookmarksContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

/**
 * Save / unsave a market or produce item.
 * variant: "float" (white circle on photos), "outline" (bordered circle), "button" (pill with text)
 */
export default function BookmarkButton({ type, id, name, variant = 'float', className = '', light = false }) {
  const { isSaved, toggle } = useBookmarks();
  const toast = useToast();
  const saved = isSaved(type, id);

  const onClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nowSaved = toggle(type, id);
    toast(nowSaved ? `Saved ${name}` : `Removed ${name} from saved`);
  };

  const label = saved ? `Remove ${name} from saved` : `Save ${name}`;

  if (variant === 'button') {
    return (
      <button
        type="button"
        className={`ff-btn ${light ? 'ff-btn--outline-light' : 'ff-btn--outline'} ${className}`.trim()}
        aria-pressed={saved}
        aria-label={label}
        onClick={onClick}
      >
        <Icon name={saved ? 'bookmark-check' : 'bookmark'} size={16} />
        {saved ? 'Saved' : 'Save'}
      </button>
    );
  }

  return (
    <button
      type="button"
      className={`ff-bookmark ff-bookmark--${variant}${saved ? ' is-saved' : ''} ${className}`.trim()}
      aria-pressed={saved}
      aria-label={label}
      title={saved ? 'Saved' : 'Save'}
      onClick={onClick}
    >
      <Icon name={saved ? 'bookmark-check' : 'bookmark'} size={16} />
    </button>
  );
}
