import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

export const BarComponent = ({ data, wk = 1, hk = 1 }) => {
	const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });

	const handleLayout = event => {
		const { width, height } = event.nativeEvent.layout;
		setContainerDimensions({ width, height });
	};

	const chartConfig = {
		backgroundGradientFrom: '#ffffff',
		backgroundGradientTo: '#eeeeee',
		color: (opacity = 1) => `rgba(75, 192, 192, ${opacity})`,
		labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
	};

	const calculatedWidth = Math.max(containerDimensions.width * wk, 100);
	const calculatedHeight = Math.max(containerDimensions.height * hk, 100);

	return (
		<View style={styles.container} onLayout={handleLayout}>
			{containerDimensions.width > 0 && containerDimensions.height > 0 && (
				<BarChart
					data={data}
					width={calculatedWidth}
					height={calculatedHeight}
					chartConfig={chartConfig}
					verticalLabelRotation={0}
				/>
			)}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
});
