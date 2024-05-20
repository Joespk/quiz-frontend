import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./", // ถ้าโปรเจคของคุณจะถูก deploy ใน subdirectory ให้ตั้งค่า base ให้ถูกต้อง
});
