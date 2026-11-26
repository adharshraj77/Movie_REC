import {
  Clapperboard,
  Laugh,
  Flame,
  Rocket,
  Film,
  Search,
  Sparkles,
  Compass,
  Shield,
  AlertTriangle,
  Ghost,
  Heart,
  Tv,
} from 'lucide-react';

const ICON_MAP = {
  drama: Clapperboard,
  comedy: Laugh,
  action: Flame,
  scifi: Rocket,
  documentary: Film,
  crime: Search,
  animation: Sparkles,
  western: Compass,
  war: Shield,
  thriller: AlertTriangle,
  horror: Ghost,
  romance: Heart,
  reality: Tv,
};

export default function GenreIcon({ genre, className = 'w-4 h-4' }) {
  const Icon = ICON_MAP[genre?.toLowerCase()] || Film;
  return <Icon className={className} aria-hidden="true" />;
}

