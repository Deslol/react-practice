import style from './RandomRenderOverlay.module.css'
import {useEffect, useRef, useState} from "react";

interface Item {
    id: number;
    text: string;
    x: number;
    y: number;
}

const MOCK_ITEM_SIZE = {
    height: 18,
    width: 24
}

function startMockSocket(
    setItems: React.Dispatch<React.SetStateAction<Item[]>>,
    frequency = 100,
    size = {
        width: 300,
        height: 300
    }
){
    const intervalId = setInterval(() => {
        const newItem: Item = {
            id: Math.random()*1000000000000,
            text: 'abc',
            x: Math.random() * Math.max(0, size.width - MOCK_ITEM_SIZE.width),
            y: Math.random() * Math.max(0, size.height - MOCK_ITEM_SIZE.height),
        };
        setItems((prev) => [...prev, newItem]);
    }, frequency);

    return ()=> {
        clearInterval(intervalId);
    }
}

export default function RandomRenderOverlay() {
    function rngRender(length = 10): Item[] {
        return Array.from({length}, (_, i) => {
            return {
                id: i,
                text: i.toString(),
                x: Math.random() * 300,
                y: Math.random() * 300,
            }
        })
    }

    const removeItem = (id: number) => {
        setMockItems((prevItems) => prevItems.filter((item:Item) => item.id !== id));
    };

    const overlayContainerRef = useRef<HTMLDivElement>(null);
    const [size, setSize] = useState({width: 0, height: 0});
    const [mockItems, setMockItems] = useState<Item[]>([]);

    useEffect(() => {
        const containerEl = overlayContainerRef.current;
        if (!containerEl) return;

        const nextSize = {
            width: containerEl.offsetWidth,
            height: containerEl.offsetHeight,
        };

        setSize(nextSize);

        const mockSocketStop = startMockSocket(setMockItems, 25, nextSize);

        return () => {
            mockSocketStop();
        }
    }, []);



    return (
        <div className={style.gameContainer}>
            <div>a</div>
            <div className={style.testLayer}>
                <div className={style.overlayContainer} ref={overlayContainerRef}>
                    {mockItems.map((item) =>
                        <p
                        className={style.randomItem}
                        key={item.id}
                        style={{
                            top: item.y + 'px',
                            left: item.x + 'px',
                        }}
                        onAnimationEnd={() => {
                            removeItem(item.id)
                        }}
                        >
                            {item.text}
                        </p>
                    )}
                </div>
                b
            </div>
            <div>c</div>
        </div>
    )
}