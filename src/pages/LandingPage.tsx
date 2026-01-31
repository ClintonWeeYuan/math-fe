import { LandingLayout } from '@/components/layout/landing/LandingLayout.tsx'
import { Button } from '@/components/ui/button.tsx'
import { useNavigate } from 'react-router-dom'

export function LandingPage() {
    const navigate = useNavigate()
    return (
        <LandingLayout>
            <div className="px-[150px] mt-10">
                <div>
                    <p className="text-6xl font-bold mb-6">
                        Turn Your B into an A in SPM Maths — <br />
                        One Question at a Time
                    </p>
                    <p className="text-lg text-slate-500 mb-12">
                        Exam-aligned Maths practice designed to build
                        confidence, accuracy, and consistency — with more
                        subjects coming soon.
                    </p>
                    <div className="flex">
                        <Button
                            className="py-6 cursor-pointer"
                            onClick={() => navigate('questions')}
                        >
                            Start practising now!
                        </Button>
                        <img
                            src="/hero.png"
                            alt="Hero"
                            height={500}
                            width={900}
                        />
                    </div>
                </div>
            </div>
        </LandingLayout>
    )
}
