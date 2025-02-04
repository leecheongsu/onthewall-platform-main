import Breadcrumb from "./Breadcrumb"

interface Props {
    title: string;
}

function PageTitle({title}: Props) {
    return (
        <header className="pageTitle flex items-center">
            <h2>{title}</h2>
            <Breadcrumb/>
        </header>
    )
}

export default PageTitle