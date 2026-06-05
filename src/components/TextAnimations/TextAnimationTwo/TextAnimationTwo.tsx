import style from './TextAnimationTwo.module.scss'
import {ExplosiveLines} from "./ExplosiveLines/ExplosiveLines.tsx";
import type {CSSProperties} from "react";

export default function TextAnimationTwo({
    rotation = 0,
    text,
    onAnimationEnd}:
    {
    text: string;
    rotation?: number;
    onAnimationEnd?: () => void;
}) {

    function textMoreThanOne(text: string) {
        return text.includes(" ") ? (
            <>
                {text.split(" ")[0]}
                <br/>
                {text.split(" ")[1]}
            </>
        ) : (text)
    }

    return (
        <div className={style.textAnimationContainer}>
            <div
                className={style.animatedTextWrapper}
                style={({'--wrapper-rotation-deg': `${rotation}deg`} as CSSProperties)}
            >
                <div className={style.textContainer}>
                    <span
                        className={style.mainText}
                        onAnimationEnd={(e) => {
                            if (e.target !== e.currentTarget) return;
                            onAnimationEnd?.();
                        }}
                    >
                            {textMoreThanOne(text)}
                        <span className={style.overlayText}>
                            {textMoreThanOne(text)}
                        </span>
                         <span className={style.blurEffect}>
                             {textMoreThanOne(text)}
                         </span>
                    </span>

                    <ExplosiveLines/>
                </div>
            </div>
        </div>
    )
}