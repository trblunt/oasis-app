import { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

export const Gradient = () => (
    <Defs key={'gradient'}>
        <LinearGradient id={'gradient'} x1={'0'} y={'0%'} x2={'0%'} y2={'100%'} gradientUnits="userSpaceOnUse">
            <Stop offset={'30%'} stopColor={'rgb(105, 179, 76)'} />
            <Stop offset={'60%'} stopColor={'rgb(250, 183, 51)'} />
            <Stop offset={'100%'} stopColor={'rgb(255, 78, 17)'} />
        </LinearGradient>
    </Defs>
)

export const Decorator = ({ x, y, data }) => {
    return data.map(({ index, value }) => (
        <Circle
            key={index}
            cx={x(index)}
            cy={y(value)}
            r={4}
            stroke={'url(#gradient)'}
            strokeWidth={1}
            fill={'url(#gradient)'}
        />
    ))
}