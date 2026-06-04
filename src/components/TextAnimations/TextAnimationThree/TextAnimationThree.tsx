import style from "./TextAnimationThree.module.scss";
// import type {CSSProperties} from "react";

export default function TextAnimationThree({text}: { text: string })  {
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
                // style={({'--wrapper-rotation-deg': `${rng()}deg`} as CSSProperties)}
            >
                <div className={style.textContainer}>
                    <span className={style.mainText}>
                            {textMoreThanOne(text)}
                        <span className={style.overlayText}>
                            {textMoreThanOne(text)}
                        </span>
                         <span className={style.blurEffect}>
                             {textMoreThanOne(text)}
                         </span>
                    </span>

                    {/*<ExplosiveLines />*/}
                    <div className={style.windLineContainer}>
                        <div className={style.windLineWrapper}>
                            <div className={style.windLines}>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}