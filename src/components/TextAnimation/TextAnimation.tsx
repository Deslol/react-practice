import style from './TextAnimation.module.scss'

export default function TextAnimation({text}: { text: string }) {

    return (
        <div className={`${style.textAnimationContainer} flex justify-center align-middle`}>
            <div className={style.animatedTextWrapper}>
                <div className={style.textContainer}>
                    <span className={style.mainText}>{text}</span>
                    <span className={style.overlayText}>{text}</span>
                    <span className={style.blurEffect}>{text}</span>
                </div>
                <div className={style.explosiveLines}/>
            </div>
        </div>
    )
}