import Image from 'next/image';

interface CustomIconProps {
  name: string;
  className?: string;
  alt?: string;
}

// Mapping common emoji names to their Unicode filenames
const emojiMap: Record<string, string> = {
  // Events and celebrations
  'party': '1F389', // 🎉
  'calendar': '1F4C5', // 📅
  'search': '1F50D', // 🔍
  'location': '1F4CD', // 📍
  'clock': '1F551', // 🕑
  'ticket': '1F3AB', // 🎫
  'heart': '2764-FE0F', // ❤️
  'star': '2B50', // ⭐
  'fire': '1F525', // 🔥
  'lightning': '26A1', // ⚡
  
  // Activities
  'music': '1F3B5', // 🎵
  'art': '1F3A8', // 🎨
  'sports': '26BD', // ⚽
  'family': '1F46A', // 👪
  'food': '1F374', // 🍴
  
  // Interface
  'clear': '274C', // ❌
  'refresh': '1F504', // 🔄
  'info': '2139', // ℹ️
  'grid': '1F532', // 🔲
  'list': '1F4CB', // 📋
};

// Emoji fallbacks if SVG files aren't found
const emojiFallbacks: Record<string, string> = {
  'party': '🎉',
  'calendar': '📅',
  'search': '🔍',
  'location': '📍',
  'clock': '🕑',
  'ticket': '🎫',
  'heart': '❤️',
  'star': '⭐',
  'fire': '🔥',
  'lightning': '⚡',
  'music': '🎵',
  'art': '🎨',
  'sports': '⚽',
  'family': '👪',
  'food': '🍴',
  'clear': '❌',
  'refresh': '🔄',
  'info': 'ℹ️',
  'grid': '🔲',
  'list': '📋',
};

export default function CustomIcon({ name, className = 'w-5 h-5', alt }: CustomIconProps) {
  const filename = emojiMap[name];
  
  if (!filename) {
    // Fallback to emoji if mapping not found
    return <span className={className}>{emojiFallbacks[name] || alt || name}</span>;
  }

  return (
    <Image
      src={`/images/emojis/${filename}.svg`}
      alt={alt || name}
      width={20}
      height={20}
      className={className}
      onError={(e) => {
        // Fallback to emoji if SVG fails to load
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        const fallbackSpan = document.createElement('span');
        fallbackSpan.className = className;
        fallbackSpan.textContent = emojiFallbacks[name] || alt || name;
        target.parentElement?.insertBefore(fallbackSpan, target);
      }}
    />
  );
}
