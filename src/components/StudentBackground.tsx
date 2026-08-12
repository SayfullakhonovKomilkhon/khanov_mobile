import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { colors } from '@/theme/tokens';

const PARTICLES = [
  { x: 0.08, y: 0.08, size: 72, color: colors.clay, duration: 21000, delay: 0 },
  { x: 0.72, y: 0.12, size: 56, color: colors.blue, duration: 24000, delay: 1300 },
  { x: 0.38, y: 0.24, size: 44, color: colors.teal, duration: 19000, delay: 700 },
  { x: 0.88, y: 0.34, size: 82, color: colors.clay, duration: 26000, delay: 2100 },
  { x: 0.16, y: 0.46, size: 58, color: colors.blue, duration: 22000, delay: 3300 },
  { x: 0.58, y: 0.55, size: 70, color: colors.teal, duration: 25000, delay: 900 },
  { x: 0.83, y: 0.68, size: 48, color: colors.blue, duration: 20000, delay: 2800 },
  { x: 0.28, y: 0.76, size: 76, color: colors.clay, duration: 27000, delay: 1700 },
  { x: 0.64, y: 0.88, size: 62, color: colors.teal, duration: 23000, delay: 4000 },
] as const;

function Glow({
  size,
  color,
  opacity = 0.18,
}: {
  size: number;
  color: string;
  opacity?: number;
}) {
  return (
    <Svg width={size} height={size}>
      <Defs>
        <RadialGradient id="glow" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={color} stopOpacity={opacity} />
          <Stop offset="0.58" stopColor={color} stopOpacity={opacity * 0.42} />
          <Stop offset="1" stopColor={color} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#glow)" />
    </Svg>
  );
}

function Particle({
  x,
  y,
  size,
  color,
  duration,
  delay,
  viewportHeight,
  viewportWidth,
}: (typeof PARTICLES)[number] & { viewportHeight: number; viewportWidth: number }) {
  const translateY = useSharedValue(0);
  const drift = useSharedValue(0);
  const pulse = useSharedValue(0.72);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(withTiming(viewportHeight + size, { duration }), -1, false),
    );
    drift.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(size * 0.22, { duration: duration * 0.45 }),
          withTiming(-size * 0.12, { duration: duration * 0.55 }),
        ),
        -1,
        true,
      ),
    );
    pulse.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 1800 }),
          withTiming(0.62, { duration: 1800 }),
        ),
        -1,
        true,
      ),
    );
  }, [delay, drift, duration, pulse, size, translateY, viewportHeight]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
    transform: [
      { translateX: drift.value },
      { translateY: translateY.value },
      { scale: 0.92 + pulse.value * 0.08 },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.particle,
        {
          left: viewportWidth * x - size / 2,
          top: viewportHeight * y - size / 2 - viewportHeight,
          width: size,
          height: size,
        },
        animatedStyle,
      ]}
    >
      <Glow size={size} color={color} opacity={0.18} />
    </Animated.View>
  );
}

export function StudentBackground({ particleCount = PARTICLES.length }: { particleCount?: number }) {
  const { width, height } = useWindowDimensions();
  const [isFocused, setIsFocused] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, []),
  );
  const visibleParticles = isFocused ? Math.max(0, particleCount) : 0;

  return (
    <View pointerEvents="none" style={styles.fill}>
      <LinearGradient
        colors={[colors.cream, colors.background, colors.background, '#F3FAF8']}
        locations={[0, 0.34, 0.68, 1]}
        style={styles.fill}
      />
      <View style={[styles.heroGlow, { top: -height * 0.16, left: -width * 0.44 }]}>
        <Glow size={Math.max(width * 1.25, 460)} color={colors.clay} opacity={0.16} />
      </View>
      <View style={[styles.heroGlow, { top: height * 0.02, right: -width * 0.58 }]}>
        <Glow size={Math.max(width * 1.4, 520)} color={colors.blue} opacity={0.13} />
      </View>
      <View style={[styles.heroGlow, { bottom: -height * 0.28, left: -width * 0.28 }]}>
        <Glow size={Math.max(width * 1.5, 560)} color={colors.teal} opacity={0.11} />
      </View>
      {PARTICLES.slice(0, visibleParticles).map((particle, index) => (
        <Particle
          key={`${particle.color}-${index}`}
          {...particle}
          viewportHeight={height}
          viewportWidth={width}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, overflow: 'hidden' },
  heroGlow: { position: 'absolute' },
  particle: { position: 'absolute' },
});
