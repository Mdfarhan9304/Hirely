import { useWindowDimensions, View } from 'react-native';

import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabsName } from './tab-constants';
import { TabItem } from './tab-item';

export const CustomTabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
  const currentIndex = state.index;
  const setActiveTabIndex = (index: number) => {
    navigation.navigate(state.routeNames[index]);
  };
  const { width } = useWindowDimensions();
  const { bottom } = useSafeAreaInsets();

  // Filter and map routes to TabsName configs
  const availableTabs = state.routes
    .map((route) => {
      const tabConfig = TabsName.find((tab) => tab.route === route.name);
      return tabConfig ? { route, tabConfig, index: state.routes.indexOf(route) } : null;
    })
    .filter((item): item is { route: any; tabConfig: typeof TabsName[0]; index: number } => item !== null);

  const tabsCount = availableTabs.length;
  // Match reference calculation exactly
  const tabsWidth = width - 14 * (tabsCount - 1);
  const maxWidth = 140;
  const minWidth = tabsCount > 1 ? (tabsWidth - maxWidth) / (tabsCount - 1) : maxWidth;

  return (
    <View
      style={{
        gap: 10,
        flexDirection: 'row',
        paddingBottom: bottom,
        paddingTop: 12,
        backgroundColor: '#000000',
        borderTopColor: '#333333',
        borderTopWidth: 1,
        paddingHorizontal: 12,
      }}>
      {availableTabs.map(({ route, tabConfig, index: routeIndex }) => {
        const isActive = state.index === routeIndex;

        return (
          <TabItem
            onPress={() => {
              setActiveTabIndex(routeIndex);
            }}
            icon={tabConfig.icon}
            key={route.key}
            label={tabConfig.label}
            maxWidth={maxWidth}
            minWidth={minWidth}
            isActive={isActive}
          />
        );
      })}
    </View>
  );
};
