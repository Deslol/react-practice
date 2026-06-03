import style from './TextAnimationPage.module.scss'
import TextAnimation from "../../components/TextAnimations/TextAnimation/TextAnimation.tsx";
import TextAnimationTwo from "../../components/TextAnimations/TextAnimationTwo/TextAnimationTwo.tsx";
import TextAnimationThree from "../../components/TextAnimations/TextAnimationThree/TextAnimationThree.tsx";

export default function TextAnimationPage() {

    return (
        <div className={`${style.textAnimationContainer} flex justify-center align-middle flex-col gap-10`}>
            <TextAnimation text='Animation ONE'/>

            <TextAnimationTwo text="Animation TWO" />

            <TextAnimationThree text="Animation Three" />

            {/*<TextAnimation text='TWO'/>*/}
        </div>
    )
}