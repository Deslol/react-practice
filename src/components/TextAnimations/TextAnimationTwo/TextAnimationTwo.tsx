import style from './TextAnimationTwo.module.scss'
import {ExplosiveLines} from "./ExplosiveLines/ExplosiveLines.tsx";

export default function TextAnimationTwo({text}: { text: string }) {

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
            <div className={style.animatedTextWrapper}>
                <div className={style.textContainer}>
                    <span className={style.mainText}>
                            {textMoreThanOne(text)}
                        <span className={style.overlayText}>
                            {textMoreThanOne(text)}
                        </span>
                         <span className={style.blurEffect}>{textMoreThanOne(text)}</span>
                    </span>

                    <ExplosiveLines />
                </div>
            </div>
        </div>
    )
}