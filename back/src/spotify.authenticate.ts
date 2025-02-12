import "./env.js";
import axios from "axios";

let ACCESS_TOKEN = "";
async function authenticate(callback: Function) {
    if (ACCESS_TOKEN) {
        return callback();
    }

    let data = {
        grant_type: "client_credentials"
    }
    const auth_token = Buffer.from(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`, 'utf-8').toString('base64');
    try {
        let resp = await axios.post("https://accounts.spotify.com/api/token", data, {
            headers: {
                'Authorization': `Basic ${auth_token}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });
        ACCESS_TOKEN = resp.data.access_token;
        callback();
    } catch (err) {
        console.log(err);
    }
}

async function checkToken() {
    if (!ACCESS_TOKEN) {
        try {
            await authenticate(() => {
                console.log('Token is now set:', ACCESS_TOKEN);
            });
        } catch (err) {
            console.log(err);
        }
    }
}

export default authenticate;
export { ACCESS_TOKEN };
export { checkToken }