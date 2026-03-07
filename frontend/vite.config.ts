import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import fs from "node:fs";

function socialSvgAsReact() {
    return {
        name: "social-svg-as-react",
        enforce: "pre" as const,
        load(id: string) {
            const [filePath, query] = id.split("?")

            if (query || !filePath.endsWith(".svg") || !filePath.includes("/src/shared/assets/social/")) {
                return null
            }

            const svg = fs.readFileSync(filePath, "utf-8")
            const jsx = svg
                .replace(/<\?xml[\s\S]*?\?>/g, "")
                .replace(/<!--([\s\S]*?)-->/g, "")
                .replace("<svg", "<svg {...props}")
                .replace(/stroke-linecap=/g, "strokeLinecap=")
                .replace(/stroke-linejoin=/g, "strokeLinejoin=")
                .replace(/stroke-width=/g, "strokeWidth=")

            return `import type { SVGProps } from "react"

export default function SocialIcon(props: SVGProps<SVGSVGElement>) {
    return (${jsx})
}`
        },
    }
}

export default defineConfig({
    plugins: [socialSvgAsReact(), react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        host: "0.0.0.0",
        port: 5173,
        strictPort: true,
        proxy: {
            "/static": {
                target: "http://127.0.0.1:3001",
                changeOrigin: true
            }
        }
    }
});
