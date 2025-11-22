import { Pressable, StyleSheet, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import Animated, {
  interpolate,
  interpolateColor,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
} from 'react-native-reanimated';

type TabProps = {
  label: string;
  maxWidth: number;
  minWidth: number;
  isActive: boolean;
  onPress: () => void;
  icon: keyof typeof Ionicons.glyphMap;
};

const IconSize = 20;

export const TabItem = ({
  label,
  maxWidth,
  minWidth,
  isActive,
  onPress,
  icon,
}: TabProps) => {
  const progress = useDerivedValue(() => {
    return withSpring(isActive ? 1 : 0, {
      dampingRatio: 1,
      duration: 800,
    });
  }, [isActive]);

  const rTabStyle = useAnimatedStyle(() => {
    return {
      width: interpolate(progress.value, [0, 1], [minWidth, maxWidth]),
      backgroundColor: interpolateColor(progress.value, [0, 1], ['#000000', '#50c8eb']),
    };
  }, [isActive]);

  const gap = useDerivedValue(() => {
    return interpolate(progress.value, [0, 1], [0, 12]);
  }, []);

  const rTextStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(progress.value, [0, 1], [0, 1]),
      marginLeft: gap.value,
    };
  }, [isActive]);

  const rIconStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(progress.value, [0, 1], [0.8, 1]),
    };
  }, [isActive]);

  return (
    <Pressable onPress={onPress}>
      <Animated.View style={[rTabStyle, styles.container]}>
        <View style={styles.innerContainer}>
          <Animated.View style={[styles.iconContainer, rIconStyle]}>
            <Ionicons 
              name={icon} 
              size={IconSize} 
              color={isActive ? '#FFFFFF' : '#9CA3AF'} 
            />
          </Animated.View>
          {isActive && (
            <Animated.Text numberOfLines={1} key={label} style={[styles.label, rTextStyle]}>
              {label}
            </Animated.Text>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderCurve: 'continuous',
    borderRadius: 100,
    height: 60,
    justifyContent: 'center',
  },
  iconContainer: {
    height: IconSize,
    width: IconSize,
    zIndex: 100,
  },
  innerContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    zIndex: 100,
    color: '#FFFFFF',
  },
});

