// src/pages/_app.tsx
import { SessionProvider } from "next-auth/react"; // Import SessionProvider from next-auth
import { AppProps } from "next/app";  // Import AppProps and set types
import "../styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <SessionProvider session={pageProps.session}>
            <Component {...pageProps} />
        </SessionProvider>
    );
}

export default MyApp;
