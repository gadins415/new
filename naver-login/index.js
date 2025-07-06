const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/callback', async (req, res) => {
  const code = req.query.code;
  const clientId = 'K4oAfquhJNWQcKSKesc0';
  const clientSecret = 'HSr_jnZeRc';
  const redirectUri = 'http://43.201.146.165:3000/callback';

  console.log('Authorization code received:', code);

  try {
    const tokenResponse = await axios.post('https://nid.naver.com/oauth2.0/token', null, {
      params: {
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        code: code,
      },
    });
    console.log('Token response received:', tokenResponse.data);

    const accessToken = tokenResponse.data.access_token;

    const profileResponse = await axios.get('https://openapi.naver.com/v1/nid/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    console.log('Profile response received:', profileResponse.data);

    const profile = profileResponse.data.response;
    res.send(`이메일: ${profile.email}<br>전화번호: ${profile.mobile}`);
  } catch (error) {
    console.error('Error during authentication:', error);
    res.status(500).send('Error during authentication');
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://43.201.146.165:${port}`);
});
