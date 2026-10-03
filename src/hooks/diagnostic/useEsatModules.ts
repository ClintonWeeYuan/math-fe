import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
    ESAT_MODULES_QUERY_KEY,
    fetchMyEsatModules,
    readLocalEsatModules,
    saveMyEsatModules,
    writeLocalEsatModules,
    type EsatModule,
} from '@/lib/esatModules.ts'

/**
 * The ESAT modules this student is sitting, and a way to change them.
 *
 * Signed in, the account is the source of truth. Signed out, the device holds
 * it. A choice made while signed out is copied to the account the first time
 * they are signed in with nothing saved there, so picking before signing up
 * is not wasted.
 *
 * `modules` is null until a choice exists, which is what makes the catalogue
 * show the picker. `isLoading` is true while the account is being asked, so
 * the picker does not flash up for someone who has already chosen.
 */
export default function useEsatModules({
    enabled,
    signedIn,
}: {
    enabled: boolean
    signedIn: boolean
}) {
    const queryClient = useQueryClient()
    const [local, setLocal] = useState<EsatModule[] | null>(() => readLocalEsatModules())

    const account = useQuery({
        queryKey: ESAT_MODULES_QUERY_KEY,
        queryFn: fetchMyEsatModules,
        enabled: enabled && signedIn,
    })

    const save = useMutation({
        mutationFn: saveMyEsatModules,
        onSuccess: (saved) => queryClient.setQueryData(ESAT_MODULES_QUERY_KEY, saved),
    })

    // Carry a signed-out choice over to the account, once.
    const copied = useRef(false)
    useEffect(() => {
        if (
            signedIn &&
            account.isSuccess &&
            account.data === null &&
            local !== null &&
            !copied.current
        ) {
            copied.current = true
            save.mutate(local)
        }
    }, [signedIn, account.isSuccess, account.data, local, save])

    const choose = (modules: EsatModule[]) => {
        writeLocalEsatModules(modules)
        setLocal(modules)
        if (signedIn) save.mutate(modules)
    }

    // A failed account read falls back to the device rather than re-asking.
    const modules = signedIn && account.isSuccess ? (account.data ?? local) : local

    return {
        modules,
        isLoading: enabled && signedIn && account.isLoading,
        choose,
    }
}
