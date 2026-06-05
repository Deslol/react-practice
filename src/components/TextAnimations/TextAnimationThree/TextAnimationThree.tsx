import style from "./TextAnimationThree.module.scss";

interface thirdTxtAnimationProp {
    text: string;
    onAnimationEnd?: () => void;
}

export default function TextAnimationThree({text, onAnimationEnd}: thirdTxtAnimationProp
) {
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
            >
                <div className={style.textContainer}>
                    <span className={style.mainText}>
                            {textMoreThanOne(text)}
                        <span
                            className={style.overlayText}
                            onAnimationEnd={(e) => {
                                if (e.target !== e.currentTarget) return;
                                onAnimationEnd?.();
                            }}
                        >
                            {textMoreThanOne(text)}
                        </span>
                         <span className={style.blurEffect}>
                             {textMoreThanOne(text)}
                         </span>
                    </span>

                    {/* Wind Lines*/}
                    <div className={style.windLineContainer}>
                        <div className={style.windLineWrapper}>
                            <div className={style.windLines}>
                                <div className={style.windLine}>
                                    <span className={style.windSegment}></span>
                                    <span className={style.windSegment}></span>
                                    <span className={style.windSegment}></span>
                                </div>
                                <div className={style.windLine}>
                                    <span className={style.windSegment}></span>
                                    <span className={style.windSegment}></span>
                                    <span className={style.windSegment}></span>
                                </div>
                                <div className={style.windLine}>
                                    <span className={style.windSegment}></span>
                                    <span className={style.windSegment}></span>
                                    <span className={style.windSegment}></span>
                                </div>
                                <div className={style.windLine}>
                                    <span className={style.windSegment}></span>
                                    <span className={style.windSegment}></span>
                                    <span className={style.windSegment}></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}