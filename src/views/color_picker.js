import { useSelector } from 'react-redux';
import {
    store,
    selectColorIndex,
    selectPalette,
    setColorIndex,
    updatePalette,
} from '../database.js';
import { HexColorPicker } from 'react-colorful';

export default function ColorPicker() {
    const colorIndex = useSelector(selectColorIndex);
    const palette = useSelector(selectPalette);
    const currentColor = palette[colorIndex];
    const viewBox = `0 0 ${palette.length} 1`;
    const onClick = (e) => {
        const elem = e.target.parentElement.getBoundingClientRect();
        store.dispatch(setColorIndex(Math.floor(palette.length * ((e.clientX - elem.left) / elem.width))));
    }
    const onColorChange = (color) => {
        store.dispatch(updatePalette({ colorIndex, color }));
    }
    return (
        <div className="ColorPicker">
            <HexColorPicker color={currentColor} onChange={onColorChange} />
            <svg xmlns="http://www.w3.org/2000/svg" viewBox={viewBox} onClick={onClick}>
                {palette.map((color, index) => {
                    const current = (index === colorIndex);
                    return (
                        <rect key={index}
                        width="1" height="1"
                        x={index}
                        fill={color}
                        stroke="orange"
                        strokeWidth={current ? '0.1' : '0'}
                        />
                    );
                })}
            </svg>
        </div>
    );
}
