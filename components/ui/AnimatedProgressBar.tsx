import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

interface AnimatedProgressBarProps {
  progress: number; // 0-100
  status?: string;
  height?: number;
  showPercentage?: boolean;
}

export default function AnimatedProgressBar({
  progress,
  status,
  height = 8,
  showPercentage = true,
}: AnimatedProgressBarProps) {
  const progressValue = useSharedValue(0);

  useEffect(() => {
    progressValue.value = withTiming(Math.min(Math.max(progress, 0), 100), {
      duration: 300,
    });
  }, [progress]);

  const animatedProgressStyle = useAnimatedStyle(() => {
    return {
      width: `${progressValue.value}%`,
    };
  });

  const animatedPercentageStyle = useAnimatedStyle(() => {
    const percentage = Math.round(progressValue.value);
    return {
      opacity: interpolate(progressValue.value, [0, 10, 100], [0, 1, 1]),
      transform: [
        {
          translateY: interpolate(
            progressValue.value,
            [0, 10, 100],
            [-10, 0, 0]
          ),
        },
      ],
    };
  });

  const animatedTextStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(progressValue.value, [0, 5, 100], [0, 1, 1]),
    };
  });

  return (
    <View style={styles.container}>
      {showPercentage && (
        <Animated.View style={[styles.percentageContainer, animatedPercentageStyle]}>
          <Animated.Text style={[styles.percentageText, animatedTextStyle]}>
            {Math.round(progress)}%
          </Animated.Text>
        </Animated.View>
      )}
      <View style={[styles.progressBarContainer, { height }]}>
        <Animated.View
          style={[
            styles.progressBar,
            { height },
            animatedProgressStyle,
          ]}
        />
      </View>
      {status && (
        <Animated.Text style={[styles.statusText, animatedTextStyle]}>
          {status}
        </Animated.Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 8,
  },
  percentageContainer: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  percentageText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#50c8eb',
    fontFamily: 'Poppins',
  },
  progressBarContainer: {
    width: '100%',
    backgroundColor: '#E5E7EB',
    borderRadius: 100,
    overflow: 'hidden',
  },
  progressBar: {
    backgroundColor: '#50c8eb',
    borderRadius: 100,
    height: '100%',
  },
  statusText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
    fontFamily: 'Poppins',
  },
});















