import React from "react";
import { useRouter } from 'next/router'
import {ChevronRightIcon} from "@heroicons/react/16/solid";

interface BreadcurmbProps {
    text: string;
    href: string;
}

function Item({ text, href }: BreadcurmbProps) {
    const router = useRouter()
    const isActive = router.asPath === href

    if (!isActive) {
        const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
            e.preventDefault()
            router.push(href).then()
        }
        return (
            <a href={href} onClick={handleClick} >
                {text}
            </a>
        )
    } else {
        return (
            <span>
                {text}
            </span>
        )
    }
}

function Breadcrumb() {
    const { asPath } = useRouter()
    const queryIndex = asPath.indexOf('?')
    const pathway = asPath
        .slice(0, queryIndex !== -1 ? queryIndex : asPath.length)
        .split('/')
        .filter(v => !!v)
        .map((v, i, arr) => ({
            text: v,
            link: '/' + arr.filter((f, j) => j <= i).join('/'),
        }))

    return (
        <ol>
            {pathway.map((v, i) => (
                <li key={i} >
                    {i > 0 ? <ChevronRightIcon /> : ''}
                    <Item text={v.text} href={v.link} />
                </li>
            ))}
        </ol>
    )
}

export default Breadcrumb