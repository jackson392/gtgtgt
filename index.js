import express from "express";
import fetch from "node-fetch";
import http from "http";
import https from "https";

const app = express();

// ⬇️ Try HTTP first (if your server supports it)
const BACKEND = "http://ecsr.store";

// One agent for http, one for https
const httpAgent = new http.Agent();
const httpsAgent = new https.Agent({
  secureProtocol: "TLSv1_2_method"
});

app.use(express.raw({ type: "*/*" }));

app.all("*", async (req, res) => {
  try {
    const target = BACKEND + req.originalUrl;
    const url = new URL(target);

    // Choose correct agent based on protocol
    const agent = url.protocol === "http:" ? httpAgent : httpsAgent;

    const response = await fetch(target, {
      method: req.method,
      headers: req.headers,
      body:
        req.method !== "GET" && req.method !== "HEAD"
          ? req.body
          : undefined,
      agent
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
