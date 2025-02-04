import App, { AppContext, AppInitialProps, AppProps } from "next/app";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import CssBaseline from "@mui/material/CssBaseline";
import { CacheProvider } from "@emotion/react";
import { muiTheme, joyTheme } from "@/app/theme";
import { deepmerge } from "@mui/utils";

import { Experimental_CssVarsProvider as CssVarsProvider } from "@mui/material/styles";
import createEmotionCache from "@/createEmotionCache";

import "@/locales/i18n";
import { useEffect } from 'react';

const allTheme = deepmerge(joyTheme, muiTheme);
const clientSideEmotionCache = createEmotionCache();

const MainLayout = dynamic(() => import("@/app/main/layout"));
const AccountLayout = dynamic(() => import("@/app/account/layout"));
const ManageLayout = dynamic(() => import("@/app/manage/layout"));

function MyApp({ Component, pageProps }: AppProps) {
	const { pathname } = useRouter();
	const Layout = pathname.startsWith("/account")
		? AccountLayout
		: pathname.startsWith("/manage")
		? ManageLayout
		: MainLayout;

	useEffect(() => {
		const handleBeforeUnload = () => {
			sessionStorage.clear();
		};

		window.addEventListener('beforeunload', handleBeforeUnload);

		return () => {
			window.removeEventListener('beforeunload', handleBeforeUnload);
		};
	}, []);

	return (
		<CacheProvider value={clientSideEmotionCache}>
			<CssVarsProvider theme={allTheme}>
				{/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
				<CssBaseline />
				<Layout>
					<Component {...pageProps} />
				</Layout>
			</CssVarsProvider>
		</CacheProvider>
	);
}

MyApp.getInitialProps = async (context: AppContext): Promise<AppInitialProps> => {
	const ctx = await App.getInitialProps(context);
	return { ...ctx };
};

export default MyApp;
