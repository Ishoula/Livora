const fs = require('fs');

const homePath = 'c:/Users/HP/Documents/Business/Livora/livora-frontend/app/tabs/home.tsx';

function assert(condition, message) {
  if (!condition) {
    console.error(message);
    process.exit(1);
  }
}

const raw = fs.readFileSync(homePath, 'utf8');
const nlRaw = raw.includes('\r\n') ? '\r\n' : '\n';
let c = raw.replace(/\r\n/g, '\n');
const orig = c;

// 1) Ensure Alert is imported from react-native
c = c.replace(
  /import\s*\{([\s\S]*?)\}\s*from 'react-native';/m,
  (full, inner) => {
    if (inner.includes('Alert')) return full;
    // append Alert right before closing brace to preserve formatting as much as possible
    return `import {${inner.trimEnd()}, Alert\n} from 'react-native';`;
  }
);

// 2) PropertyCardProps: add onToggleFavorite
c = c.replace(
  /interface\s+PropertyCardProps\s*\{([\s\S]*?)\n\}/m,
  (full, inner) => {
    if (inner.includes('onToggleFavorite')) return full;
    if (!inner.includes('isFavorite')) return full;
    const cleaned = inner.replace(/\s+$/g, '');
    return `interface PropertyCardProps {${cleaned}\n  onToggleFavorite: (propertyId: number, isFavorite: boolean) => void;\n}`;
  }
);

// 3) PropertyCard signature: include onToggleFavorite
c = c.replace(
  /const\s+PropertyCard:\s+React\.FC<PropertyCardProps>\s*=\s*\(\{\s*item,\s*isFavorite\s*\}\)\s*=>\s*\(/,
  'const PropertyCard: React.FC<PropertyCardProps> = ({ item, isFavorite, onToggleFavorite }) => ('
);

// 4) Favorite icon onPress
c = c.replace(
  /<TouchableOpacity\s+style=\{styles\.favoriteIcon\}>/,
  '<TouchableOpacity style={styles.favoriteIcon} onPress={() => onToggleFavorite(item.id, isFavorite)}>'
);

// 5) Add toggleFavorite helpers inside HomePage after favoriteIds state
if (!c.includes('const toggleFavorite')) {
  c = c.replace(
    /(const \[favoriteIds, setFavoriteIds\] = useState<Set<number>>\(new Set\(\)\);\n)/,
    `$1\n  const setFavoriteId = (propertyId: number, nextIsFavorite: boolean) => {\n    setFavoriteIds((prev) => {\n      const next = new Set(prev);\n      if (nextIsFavorite) next.add(propertyId);\n      else next.delete(propertyId);\n      return next;\n    });\n  };\n\n  const toggleFavorite = async (propertyId: number, isFavorite: boolean) => {\n    const session = getSession();\n    if (!session?.tokens?.accessToken) {\n      Alert.alert('Login required', 'Please log in to manage favorites.');\n      return;\n    }\n\n    const nextIsFavorite = !isFavorite;\n    setFavoriteId(propertyId, nextIsFavorite);\n\n    try {\n      if (nextIsFavorite) {\n        await apiRequestAuth({ method: 'POST', path: '/api/favorites/' + propertyId });\n      } else {\n        await apiRequestAuth({ method: 'DELETE', path: '/api/favorites/' + propertyId });\n      }\n    } catch (e) {\n      setFavoriteId(propertyId, isFavorite);\n      Alert.alert('Favorites', e instanceof Error ? e.message : 'Failed to update favorites');\n    }\n  };\n\n`
  );
}

// 6) Fetch favorites on load when logged in (Promise.all)
// Replace the properties-only fetch block inside the try
const fetchRe = /const apiProperties = await apiRequest<ApiProperty\[]>\(\{\s*\n\s*path: '\/api\/properties'\s*\n\s*\}\);\s*\n\s*\n\s*if \(cancelled\) return;\s*\n\s*setProperties\(apiProperties\.map\(mapApiPropertyToUi\)\);/m;

if (fetchRe.test(c)) {
  c = c.replace(
    fetchRe,
    `const [apiProperties, favorites] = await Promise.all([\n          apiRequest<ApiProperty[]>({\n            path: '/api/properties'\n          }),\n          (async () => {\n            if (!session?.tokens?.accessToken) return [] as ApiFavorite[];\n            return apiRequestAuth<ApiFavorite[]>({\n              path: '/api/favorites'\n            });\n          })()\n        ]);\n\n        if (cancelled) return;\n        setProperties(apiProperties.map(mapApiPropertyToUi));\n        setFavoriteIds(new Set(favorites.map((f) => f.property.id)));`
  );
}

// 7) Pass onToggleFavorite to PropertyCard
c = c.replace(
  /renderItem=\{\(\{ item \}\) => <PropertyCard item=\{item\} isFavorite=\{favoriteIds\.has\(item\.id\)\} \/>\}/,
  'renderItem={({ item }) => <PropertyCard item={item} isFavorite={favoriteIds.has(item.id)} onToggleFavorite={toggleFavorite} />}'
);

assert(c !== orig, 'No changes made (already applied or patterns not found).');

fs.writeFileSync(homePath, c.replace(/\n/g, nlRaw), 'utf8');
console.log('Updated home.tsx favorites toggle successfully.');
