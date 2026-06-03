import style from './TextAnimationTwo.module.scss'

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
                        {/*<div className={style.explosiveLines}>*/}
                        {/*    <div className={style.lineWrapper}>*/}
                        {/*        <span className={style.line}/>*/}
                        {/*    </div>*/}
                        {/*</div>*/}
                    </span>
                </div>
            </div>
        </div>
    )
}