import { UserLayoutV2 } from '@/components/layout/UserLayoutV2.tsx'
import { SidebarV2 } from '@/components/layout/SidebarV2.tsx'

export function QuestionBankPageV2() {
    return (
        <UserLayoutV2>
            <SidebarV2 />
            <div className="h-full w-[70%] mr-4 bg-white rounded-xl flex justify-center items-center">
                Main Question
            </div>
            <div className="h-full flex-2 bg-white rounded-xl flex justify-center items-center">
                ChatBot
            </div>
        </UserLayoutV2>
    )
}
