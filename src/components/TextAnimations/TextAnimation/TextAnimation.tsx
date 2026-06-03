import style from './TextAnimation.module.scss'
import type {CSSProperties} from "react";

function rng() {
    return Math.random() * 60 - 30
}

function textMoreThanOne(text: string) {
    return text.includes(" ") ? (
        <>
            {text.split(" ")[0]}
            <br/>
            {text.split(" ")[1]}
        </>
    ) : (text)
}

export default function TextAnimation({text}: { text: string }) {
    return (
        <div className={`${style.textAnimationContainer} flex justify-center align-middle`}>
            <div className={style.animatedTextWrapper}
                 style={({'--wrapper-rotation-deg': `${rng()}deg`} as React.CSSProperties)}>
                <div className={style.textContainer}>
                    <span className={style.mainText}>
                        {textMoreThanOne(text)}
                    </span>
                    <span className={style.overlayText}>
                         {textMoreThanOne(text)}
                    </span>
                    <span className={style.blurEffect}>
                        {textMoreThanOne(text)}
                    </span>
                    <div className={style.explosiveLines}>
                        <div
                            className={style.lineWrapper}
                            style={{'--angle': '45deg', '--line-height': '45px'} as React.CSSProperties}
                        >
                            <span className={style.line}/>
                        </div>
                        <div
                            className={style.lineWrapper}
                            style={{'--angle': '90deg', '--line-height': '125px'} as CSSProperties}
                        >
                            <span className={style.line}/>
                        </div>
                        <div
                            className={style.lineWrapper}
                            style={{'--angle': '245deg', '--line-height': '62.5px'} as CSSProperties}
                        >
                            <span className={style.line}/>
                        </div>
                        <div
                            className={style.lineWrapper}
                            style={{'--angle': '290deg', '--line-height': '187.5px'} as CSSProperties}
                        >
                            <span className={style.line}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}