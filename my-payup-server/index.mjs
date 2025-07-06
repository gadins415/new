import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
app.use(bodyParser.json());

// PayUp API 기본 정보
const PAYUP_API_BASE_URL = "https://standard.testpayup.co.kr";
const MERCHANT_ID = "kanggadin_test";
const API_KEY = "d871410a9c21470996cbe4e8cce796e2"; // PayUp에서 제공된 API Key
// let REFRESH_TOKEN = "initial_refresh_token";

// 1. 인증 토큰 발행
async function generateAccessToken() {
    const response = await fetch(`${PAYUP_API_BASE_URL}/auth/v1/accessToken`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ merchantId: MERCHANT_ID, apiKey: API_KEY }),
    });

    const data = await response.json();
    if (data.status !== "SUCCESS") throw new Error("Token generation failed.");
    return data.data.accessToken;
}

// 2. 결제 승인 요청
async function processPayment(transactionId, orderNumber, amount) {
    const accessToken = await generateAccessToken();
    const response = await fetch(`${PAYUP_API_BASE_URL}/api/v1/payment`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: accessToken,
        },
        body: JSON.stringify({ transactionId, merchantId: MERCHANT_ID, orderNumber, amount }),
    });

    const data = await response.json();
    if (data.status !== "SUCCESS") throw new Error("Payment processing failed.");
    return data.data; // 카드 정보 포함
}

// 3. 앱 실행 처리
function getAppUrl(cardName, platform) {
    const CARD_SCHEMAS = {
        Android: {
            "네이버페이": "com.nhn.android.search",
            "카카오페이": "com.kakao.talk",
            "현대카드": "com.hyundaicard.appcard",
            "삼성카드": "kr.co.samsungcard.mpocket",
        },
        iOS: {
            "네이버페이 간편결제": "naversearchthirdlogin",
            "카카오페이 간편결제": "kakaotalk",
            "현대 앱카드": "hdcardappcardansimclick",
            "삼성 앱카드": "mpocket.online.ansimclick",
        },
    };

    const appUrl = CARD_SCHEMAS[platform]?.[cardName] || null;

    // 디버깅 로그 추가
    console.log(`AppUrl for ${cardName} (${platform}):`, appUrl);

    return appUrl;
}

// 엔드포인트: 결제 처리
app.post("/processPayment", async (req, res) => {
    const { transactionId, orderNumber, amount, platform } = req.body;

    try {
        const paymentData = await processPayment(transactionId, orderNumber, amount);
        const appUrl = getAppUrl(paymentData.cardName, platform);

         // 디버깅 로그: 결제 승인 후 앱 URL 확인
         console.log("Transaction ID:", transactionId);
         console.log("Card Name:", paymentData.cardName);
         console.log("App URL:", appUrl);

        if (!appUrl) throw new Error("App URL not found for this card.");

        res.json({ status: "SUCCESS", appUrl, cardName: paymentData.cardName });
    } catch (error) {
        console.error("Error processing payment:", error.message);
        res.status(500).json({ status: "FAILURE", message: error.message });
    }
});

// POST 요청 처리: PayUp 결제 완료 리디렉션
app.post("/return.html", (req, res) => {
    const { transactionId } = req.body;

    if (!transactionId) {
        res.status(400).send("Transaction ID missing.");
        return;
    }

    console.log("Transaction ID received:", transactionId);

    res.send(`
        <script>
            window.postMessage("SUCCESS: Transaction ${transactionId}", "*");
        </script>
    `);
});

// 엔드포인트: PayUp 결제 완료 처리
app.get("/return.html", (req, res) => {
    const { transactionId } = req.query;

    // 결제 완료 상태를 클라이언트(WebViewer)로 전송
    res.send(`
        <script>
            window.postMessage("SUCCESS: Transaction ${transactionId}", "*");
        </script>
    `);
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));