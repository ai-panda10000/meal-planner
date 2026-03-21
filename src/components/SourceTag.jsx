// Source tag badge component
// Shows a small colored label indicating where a recipe is from:
// - Nadia (blue) - recipes from the Nadia website
// - Instagram (pink) - recipes found on Instagram
// - Free (gray) - custom recipe notes written by the user
import './SourceTag.css';

export default function SourceTag({ source, size = 'normal' }) {
  // Map source names to display labels
  const labels = {
    nadia: 'Nadia',
    instagram: 'Instagram',
    free: 'Free',
  };

  return (
    <span className={`source-tag source-tag-${source} source-tag-${size}`}>
      {labels[source] || source}
    </span>
  );
}
