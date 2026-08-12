import { useEffect } from 'react';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { colors, radius, shadows } from '@/theme/tokens';

type NativeTabBarProps = Parameters<
  NonNullable<ComponentProps<typeof Tabs>['tabBar']>
>[0];

type AnimatedTabBarProps = NativeTabBarProps & {
  accent: string;
  activeBackground: string;
};

type TabButtonProps = {
  focused: boolean;
  label: string;
  activeColor: string;
  activeBackground: string;
  accessibilityLabel?: string;
  testID?: string;
  icon?: (props: { focused: boolean; color: string; size: number }) => React.ReactNode;
  onPress: () => void;
  onLongPress: () => void;
};

const SPRING = { damping: 17, stiffness: 230, mass: 0.7 };

function TabButton({
  focused,
  label,
  activeColor,
  activeBackground,
  accessibilityLabel,
  testID,
  icon,
  onPress,
  onLongPress,
}: TabButtonProps) {
  const selected = useSharedValue(focused ? 1 : 0);
  const pressed = useSharedValue(0);

  useEffect(() => {
    selected.value = withTiming(focused ? 1 : 0, { duration: focused ? 220 : 160 });
  }, [focused, selected]);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withSpring(pressed.value ? 0.94 : 1, SPRING) }],
  }));

  const pillStyle = useAnimatedStyle(() => ({
    opacity: selected.value,
    transform: [
      { scaleX: interpolate(selected.value, [0, 1], [0.68, 1]) },
      { scaleY: interpolate(selected.value, [0, 1], [0.82, 1]) },
    ],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: interpolate(selected.value, [0, 1], [0, -2]) },
      { scale: interpolate(selected.value, [0, 1], [1, 1.1]) },
    ],
  }));

  const labelStyle = useAnimatedStyle(() => ({
    color: interpolateColor(selected.value, [0, 1], [colors.inkMuted, activeColor]),
    opacity: interpolate(selected.value, [0, 1], [0.76, 1]),
    transform: [{ translateY: interpolate(selected.value, [0, 1], [1, 0]) }],
  }));

  return (
    <Animated.View style={[styles.item, buttonStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={focused ? { selected: true } : {}}
        accessibilityLabel={accessibilityLabel}
        testID={testID}
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={() => {
          pressed.value = 1;
        }}
        onPressOut={() => {
          pressed.value = 0;
        }}
        style={styles.pressable}
      >
        <Animated.View
          pointerEvents="none"
          style={[styles.pill, { backgroundColor: activeBackground }, pillStyle]}
        />
        <Animated.View style={[styles.icon, iconStyle]}>
          {icon?.({
            focused,
            color: focused ? activeColor : colors.inkMuted,
            size: 21,
          })}
        </Animated.View>
        <Animated.Text numberOfLines={1} style={[styles.label, labelStyle]}>
          {label}
        </Animated.Text>
      </Pressable>
    </Animated.View>
  );
}

export function AnimatedTabBar({
  state,
  descriptors,
  navigation,
  insets,
  accent,
  activeBackground,
}: AnimatedTabBarProps) {
  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key];
          const label =
            typeof options.tabBarLabel === 'string'
              ? options.tabBarLabel
              : options.title ?? route.name;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!focused && !event.defaultPrevented) {
              void Haptics.selectionAsync();
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          return (
            <TabButton
              key={route.key}
              focused={focused}
              label={label}
              activeColor={accent}
              activeBackground={activeBackground}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarButtonTestID}
              icon={options.tabBarIcon as TabButtonProps['icon']}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    ...shadows.floating,
  },
  row: {
    height: 68,
    flexDirection: 'row',
    alignItems: 'stretch',
    paddingHorizontal: 6,
    paddingTop: 5,
    paddingBottom: 5,
  },
  item: {
    flex: 1,
  },
  pressable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    overflow: 'hidden',
    borderRadius: radius.md,
  },
  pill: {
    position: 'absolute',
    top: 1,
    right: 4,
    bottom: 1,
    left: 4,
    borderRadius: radius.md,
  },
  icon: {
    height: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    maxWidth: '96%',
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
});
