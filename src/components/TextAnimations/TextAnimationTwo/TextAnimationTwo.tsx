import style from './TextAnimationTwo.module.scss'

export default function TextAnimationTwo({text}: { text: string }) {
    return (
        <div className={style.textAnimationContainer}>
            <div className={style.animatedTextWrapper}>
                <div className={style.textContainer}>
                    <span className={style.mainText}>{text}</span>
                    {/*<span className={style.overlayText}>{text}</span>*/}
                    {/*<span className={style.blurEffect}>{text}</span>*/}
                </div>

                {/*<div className={style.explosiveLines}>*/}
                {/*    <div className={style.lineWrapper}>*/}
                {/*        <span className={style.line}/>*/}
                {/*    </div>*/}
                {/*</div>*/}
            </div>
        </div>
    )
}