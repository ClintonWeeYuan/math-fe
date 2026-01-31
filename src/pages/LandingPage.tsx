import { LandingLayout } from '@/components/layout/landing/LandingLayout.tsx'
import { Button } from '@/components/ui/button.tsx'
import { useNavigate } from 'react-router-dom'

export function LandingPage() {
    const navigate = useNavigate()
    return (
        <LandingLayout>
            <div className="px-4 md:px-[50px] xl:px-[150px] mt-4 md:mt-10 w-full">
                <div className="flex flex-col justify-center w-full">
                    <p className="text-3xl md:text-6xl font-bold mb-6">
                        Turn Your B into an A in SPM Maths — <br />
                        One Question at a Time
                    </p>
                    <p className="text-sm text-slate-500 mb-4 md:mb-12">
                        Exam-aligned Maths practice designed to build
                        confidence, accuracy, and consistency — with more
                        subjects coming soon.
                    </p>
                    <div className="flex flex-col-reverse md:flex-row">
                        <Button
                            className="xl:py-6 cursor-pointer"
                            onClick={() => navigate('questions')}
                        >
                            Start practising now!
                        </Button>
                        <img
                            className="md:w-[700px] xl:w-[900px]"
                            src="/hero.png"
                            alt="Hero"
                        />
                    </div>
                </div>
            </div>
        </LandingLayout>
    )
}
