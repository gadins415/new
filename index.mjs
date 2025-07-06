import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";

const app = express();
app.use(bodyParser.json());

// PayUp API 기본 정보
const PAYUP_API_BASE_URL = "https://standard.testpayup.co.kr";
const MERCHANT_ID = "kanggadin_test";
const API_KEY = "d871410a9c21470996cbe4e8cce796e2"; // PayUp에서 제공된 API Key
let REFRESH_TOKEN = "initial_refresh_token";

// 카드사 스키마 DB
const CARD_SCHEMAS = {
    android: [
        { cardName: "네이버페이", appUrl: "com.nhn.android.search" },
        { cardName: "카카오페이", appUrl: "com.kakao.talk" },
        { cardName: "현대카드", appUrl: "com.hyundaicard.appcard" },
        { cardName: "삼성카드", appUrl: "kr.co.samsungcard.mpocket" },
    ],
    ios: [
        { cardName: "네이버페이 간편결제", appUrl: "naversearchthirdlogin" },
        { cardName: "카카오페이 간편결제", appUrl: "kakaotalk" },
        { cardName: "현대 앱카드", appUrl: "hdcardappcardansimclick" },
        { cardName: "삼성 앱카드", appUrl: "mpocket.online.ansimclick" },
    ],
};


// 1. PayUp 토큰 발행
app.post("/getAccessToken", async (req, res) => {
    try {
        const response = await fetch(`${PAYUP_API_BASE_URL}/auth/v1/refrechToken`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken: REFRESH_TOKEN }),
        });

        const data = await response.json();

        if (response.status === 200 && data.status === "SUCCESS") {
            REFRESH_TOKEN = data.data.refreshToken; // Refresh 토큰 갱신
            res.json({ accessToken: data.data.accessToken });
        } else {
            res.status(400).json({ error: "Failed to obtain access token." });
        }
    } catch (error) {
        console.error("Error generating token:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 2. 결제 승인 및 카드 스키마 반환
app.post("/processPayment", async (req, res) => {
    const { transactionId, platform } = req.body;

    if (!transactionId || !platform) {
        console.error("Missing transactionId or platform in request");
        return res.status(400).json({
            status: "FAILURE",
            message: "Missing transaction ID or platform.",
        });
    }

    try {
        // 1. PayUp API를 사용해 카드 정보 가져오기
        const cardInfoResponse = await fetch(`${PAYUP_API_BASE_URL}/api/v1/transactionInfo`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${API_KEY}`, // API Key 사용
            },
            body: JSON.stringify({ transactionId }),
        });

        if (cardInfoResponse.status !== 200) {
            console.error("PayUp API responded with status:", cardInfoResponse.status);
            return res.status(400).json({ status: "FAILURE", message: "Failed to fetch card info." });
        }

        const cardInfoData = await cardInfoResponse.json();
        console.log("Card Info Data:", cardInfoData);

        if (cardInfoResponse.status !== 200 || cardInfoData.status !== "SUCCESS") {
            console.error("PayUp API returned failure:", cardInfoData.message);
            return res.status(400).json({ status: "FAILURE", message: "Failed to fetch card info." });
        }

        // 카드 이름 가져오기
        const cardName = cardInfoData.data.cardName; // PayUp API 응답 데이터에서 cardName 추출
        console.log("Card Name:", cardName);

        // 2. 플랫폼(Android/iOS)별 스키마 설정
        const schemas = CARD_SCHEMAS[platform.toLowerCase()];
        if (!schemas) {
            console.error("Unsupported platform:", platform);
            return res.status(400).json({ status: "FAILURE", message: "Unsupported platform." });
        }

        const cardSchema = schemas.find((card) => card.cardName === cardName);
        if (!cardSchema) {
            console.error("Card not supported:", cardName);
            return res.status(400).json({ status: "FAILURE", message: "Card not supported." });
        }

        // 3. 설정된 appUrl 반환
        res.json({
            status: "SUCCESS",
            cardName,
            appUrl: cardSchema.appUrl,
        });
    } catch (error) {
        console.error("Payment processing error:", error.message);
        res.status(500).json({ status: "FAILURE", message: "Internal Server Error." });
    }
});

// 서버 실행
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});