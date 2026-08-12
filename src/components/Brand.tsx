import { Image, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/theme/tokens';

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.row}>
      <Image
        source={require('../../assets/khanovmath-icon.png')}
        style={[styles.logo, compact && styles.logoCompact]}
      />
      <View>
        <Text style={[styles.name, compact && styles.nameCompact]}>KhanovMath</Text>
        <Text style={styles.academy}>ACADEMY</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  logo: { width: 60, height: 60, borderRadius: 16 },
  logoCompact: { width: 42, height: 42, borderRadius: 12 },
  name: { color: colors.ink, fontSize: 25, fontWeight: '900', letterSpacing: -1.3 },
  nameCompact: { fontSize: 20 },
  academy: {
    marginLeft: 2,
    color: colors.inkSecondary,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 3,
  },
});
