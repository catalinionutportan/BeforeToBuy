import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 100,
          background: "linear-gradient(135deg, #059669 0%, #0f172a 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#10b981",
          borderRadius: "36px",
          fontWeight: 900,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        B2B
      </div>
    ),
    { ...size }
  );
}
