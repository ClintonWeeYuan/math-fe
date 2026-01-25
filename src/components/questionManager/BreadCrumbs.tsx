import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Link } from 'react-router-dom'
import { Fragment } from 'react'

type Crumb = {
    link: string
    text: string
}

type Props = {
    crumbs: Crumb[]
}

export function BreadCrumbs({ crumbs }: Props) {
    return (
        <Breadcrumb className="mb-4">
            <BreadcrumbList>
                {crumbs.map((crumb, index) => (
                    <Fragment key={crumb.link}>
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link to={crumb.link}>{crumb.text}</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        {index < crumbs.length - 1 && <BreadcrumbSeparator />}
                    </Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    )
}
