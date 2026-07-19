import type { Metadata, Viewport } from "next";
import "./globals.css";
export const metadata: Metadata = {title:"Green Freedom Academy",description:"เรียน ฝึก เล่น และเติบโต",manifest:"/manifest.webmanifest",appleWebApp:{capable:true,title:"GFA",statusBarStyle:"default"}};
export const viewport: Viewport = {themeColor:"#176b4d",width:"device-width",initialScale:1};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="th"><body>{children}</body></html>}