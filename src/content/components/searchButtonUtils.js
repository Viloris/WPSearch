export const calcPosition = (buttonSize, offset, direction) => {
    const half = buttonSize / 2;
    const position = -buttonSize - offset;
    const map = {
        top: { top: position, left: -half },
        bottom: { top: offset, left: -half },
        right: { top: -half, left: offset },
        left: { top: -half, left: position },
        topRight: { top: position, left: offset },
        topLeft: { top: position, left: position },
        bottomLeft: { top: offset, left: position },
        bottomRight: { top: offset, left: offset }
    };

    return map[direction] || map.bottomRight;
};