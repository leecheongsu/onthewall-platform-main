import Document, {DocumentContext, DocumentInitialProps, Head, Html, Main, NextScript,} from 'next/document'

class MyDocument extends Document {
    static async getInitialProps(
        ctx: DocumentContext
    ): Promise<DocumentInitialProps> {
        const originalRenderPage = ctx.renderPage
        // const materialSheets = new ServerStyleSheets();

        // Run the React rendering logic synchronously
        ctx.renderPage = () =>
            originalRenderPage({
                // Useful for wrapping the whole react tree
                enhanceApp: (App) => App,
                // enhanceApp: (App) => props => materialSheets.collect(<App {...props} />),
                // Useful for wrapping in a per-page basis
                enhanceComponent: (Component) => Component,
            })

        const initialProps = await Document.getInitialProps(ctx);

        return {
            ...initialProps,
            styles: <>{initialProps.styles}</>
        }

        // Run the parent `getInitialProps`, it now includes the custom `renderPage`
        // return await Document.getInitialProps(ctx)
    }

    render() {
        return (
            <Html>
                <Head />
                <body>
                <Main />
                <NextScript />
                </body>
            </Html>
        )
    }
}

export default MyDocument