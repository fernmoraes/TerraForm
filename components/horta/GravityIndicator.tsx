import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { PLANET_IMAGES } from '../../data/seed';

interface Props {
  gravidade: number;
  planetaNome: string;
  planetaId: string;
  onPress?: () => void;
}

export function GravityIndicator({ gravidade, planetaNome, planetaId, onPress }: Props) {
  const img = PLANET_IMAGES[planetaId];
  return (
    <TouchableOpacity
      style={styles.badge}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {img && <Image source={img} style={styles.planetImg} resizeMode="contain" />}
      <Text style={styles.text}>
        {planetaNome}  ·  {gravidade.toFixed(2)} g
      </Text>
      {onPress && <Text style={styles.arrow}>ℹ</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: COLORS.highlightGlass,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderGlass,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planetImg: { width: 28, height: 28, borderRadius: 14 },
  text: { color: COLORS.ciano, fontSize: 12, fontWeight: '600' },
  arrow: { color: COLORS.textSecondary, fontSize: 13 },
});
