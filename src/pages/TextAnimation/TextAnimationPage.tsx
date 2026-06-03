import style from './TextAnimationPage.module.scss'
import TextAnimation from "../../components/TextAnimation/TextAnimation.tsx";

export default function TextAnimationPage() {

    return (
        <div className={`${style.textAnimationContainer} flex justify-center align-middle flex-col gap-3`}>
            <TextAnimation text='THREE'/>
            {/*<TextAnimation text='TWO'/>*/}
        </div>
    )
}