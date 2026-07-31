export default function handler(request, response) {
  const country =
    request.headers["x-vercel-ip-country"] || "UNKNOWN";

  response.setHeader(
    "Cache-Control",
    "private, no-store, max-age=0"
  );

  response.status(200).json({
    country: String(country).toUpperCase(),
  });
}
