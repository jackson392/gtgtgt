import express from "express";
import fetch from "node-fetch";
import http from "http";
import https from "https";

const app = express();

// Try HTTP first – your server might redirect to HTTPS
const BACKEND = "http://ecsr.store";

const httpAgent = new http.Agent();
const httpsAgent = new https.Agent({
  secureProtocol: "TLSv1_2_method"
});

app.use(express.raw({ type: "*/*" }));

app.all("*", async (req, res) => {
  try {
    const target = BACKEND + req.originalUrl;

    const response = await fetch(target, {
      method: req.method,
      headers: req.headers,
      body:
        req.method !== "GET" && req.method !== "HEAD"
          ? req.body
          : undefined,
      // 👇 IMPORTANT: choose agent based on *actual* URL (handles redirects)
      agent: (parsedUrl) =>
        parsedUrl.protocol === "http:" ? httpAgent : httpsAgent
    });

    response.headers.forEach((v, k) => res.setHeader(k, v));
    res.status(response.status);
    res.send(Buffer.from(await response.arrayBuffer()));
  } catch (err) {
    console.error(err);
    res.status(500).send("Proxy Error: " + err.message);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Proxy running on port " + PORT));
