let mytoken = 'VIP4001177';
let BotToken = '';
let ChatID = '';
let TG = 1;
let FileName = 'SUB';
let SUBUpdateTime = 24;

let MainData = `
www.40011.cloud
`;

let urls = [];
let subconverter = "sub.45090135.xyz";
let subconfig = "https://raw.githubusercontent.com/VIP4001177/sub/main/sub.ini";

export default {
    async fetch(request, env) {
        const userAgentHeader = request.headers.get('User-Agent') || "null";
        const userAgent = userAgentHeader.toLowerCase();
        const url = new URL(request.url);
        const token = url.searchParams.get('token');

        mytoken = env.TOKEN || mytoken;
        BotToken = env.TGTOKEN || BotToken;
        ChatID = env.TGID || ChatID; 
        TG = env.TG || TG; 
        subconverter = env.SUBAPI || subconverter;
        subconfig = env.SUBCONFIG || subconfig;
        FileName = env.SUBNAME || FileName;
        MainData = env.LINK || MainData;

        if (env.LINKSUB) urls = await ADD(env.LINKSUB);

        let links = await ADD(MainData + '\n' + urls.join('\n'));
        let link = "", linksub = "";

        for (let x of links) {
            if (x.toLowerCase().startsWith('http')) {
                linksub += x + '\n';
            } else {
                link += x + '\n';
            }
        }
        MainData = link;
        urls = await ADD(linksub);
        let sublinks = request.url;

        let warp = env.WARP;
        if (warp && warp != "") sublinks += '|' + (await ADD(warp)).join('|');

        if (!(token == mytoken || url.pathname == ("/" + mytoken) || url.pathname.includes("/" + mytoken + "?"))) {
            return new Response(`
            <!DOCTYPE html>
            <html>
            <head>
            <title>Welcome to nginx!</title>
            <style>
                body { width: 35em; margin: 0 auto; font-family: Tahoma, Verdana, Arial, sans-serif; }
            </style>
            </head>
            <body>
            <h1>Welcome to nginx!</h1>
            <p>If you see this page, the nginx web server is successfully installed and working. Further configuration is required.</p>
            <p>For online documentation and support please refer to
            <a href="http://nginx.org/">nginx.org</a>.<br/>
            Commercial support is available at
            <a href="http://nginx.com/">nginx.com</a>.</p>
            <p><em>Thank you for using nginx.</em></p>
            </body>
            </html>
            `, { headers: { 'Content-Type': 'text/html; charset=UTF-8' } });
        } 
        else if (TG == 1 && !userAgent.includes('subconverter') && userAgent !== "null") {
            await sendMessage("获取订阅", request.headers.get('CF-Connecting-IP'),
                `${userAgentHeader}\n${url.hostname}\n${mytoken}`);
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 1618);

        let req_data = MainData;

        try {
            const responses = await Promise.allSettled(urls.map(url =>
                fetch(url, {
                    method: 'get',
                    headers: {
                        'Accept': 'text/html,application/xhtml+xml,application/xml;',
                        'User-Agent': `v2rayn/6.42 cmliu/CF-Workers-SUB ${userAgentHeader}`
                    },
                    signal: controller.signal
                }).then(response => {
                    if (response.ok) {
                        return response.text().then(content => {
                            if ((content.includes('dns') && content.includes('proxies') && content.includes('proxy-groups') && content.includes('rules')) ||
                                (content.includes('dns') && content.includes('outbounds') && content.includes('inbounds'))) {
                                sublinks += "|" + url;
                            } else {
                                return content;
                            }
                        });
                    } else return "";
                })
            ));

            for (const response of responses) {
                if (response.status === 'fulfilled') {
                    const content = response.value;
                    if (content) req_data += safeBase64Decode(content) + '\n';
                }
            }
        } catch (error) { } finally { clearTimeout(timeout); }

        const uniqueLines = new Set(req_data.split('\n'));
        const result = [...uniqueLines].join('\n');
        const base64Data = btoa(result);

        let target = "v2ray";
        if (userAgent.includes('clash') && !userAgent.includes('nekobox')) target = "clash";
        else if (userAgent.includes('sing-box') || userAgent.includes('singbox')) target = "singbox";
        else return new Response(base64Data ,{
            headers: { 
                "content-type": "text/plain; charset=utf-8",
                "Profile-Update-Interval": `${SUBUpdateTime}`,
            }
        });

        const subconverterUrl = `https://${subconverter}/sub?target=${target}&url=${encodeURIComponent(sublinks)}&insert=false&config=${encodeURIComponent(subconfig)}&emoji=true&list=false&tfo=false&scv=true&fdn=false&sort=false&new_name=true`;

        try {
            const subconverterResponse = await fetch(subconverterUrl);
            if (!subconverterResponse.ok) throw new Error(`Error fetching subconverterUrl: ${subconverterResponse.status} ${subconverterResponse.statusText}`);
            const subconverterContent = await subconverterResponse.text();
            return new Response(subconverterContent ,{
                headers: { 
                    "Content-Disposition": `attachment; filename*=utf-8''${encodeURIComponent(FileName)}; filename=${FileName}`,
                    "content-type": "text/plain; charset=utf-8",
                    "Profile-Update-Interval": `${SUBUpdateTime}`,
                }
            });
        } catch (error) {
            return new Response(`Error: ${error.message}`, {
                status: 500,
                headers: { 'content-type': 'text/plain; charset=utf-8' },
            });
        }
    }
};

async function sendMessage(type, ip, add_data = "") {
    if (BotToken !== '' && ChatID !== '') {
        if (type.startsWith("#")) type = type.replace(/^#/, "").trim();
        let msg = "";
        try {
            const response = await fetch(`http://ip-api.com/json/${ip}?lang=zh-CN`);
            const lines = add_data.split("\n");
            if (response.status == 200) {
                const ipInfo = await response.json();
                msg = `${type}\n\nIP: <code>${ip}</code>\n\n` +
                      `国家: <code>${ipInfo.country}</code>\n\n` +
                      `城市: <code>${ipInfo.city}</code>\n\n` +
                      `ASN: <code>${ipInfo.as}</code>\n\n` +
                      `UA: <code>${lines[0] || ''}</code>\n\n` +
                      `域名: <code>${lines[1] || ''}</code>\n\n` +
                      `入口: <code>${lines[2] || ''}</code>`;
            } else {
                msg = `${type}\n\nIP: <code>${ip}</code>\n\n${add_data}`;
            }
        } catch (e) {
            msg = `${type}\n\nIP: <code>${ip}</code>\n\n${add_data}`;
        }
        const url = `https://api.telegram.org/bot${BotToken}/sendMessage?chat_id=${ChatID}&text=${encodeURIComponent(msg)}&parse_mode=HTML`;
        return fetch(url, { method: 'get' });
    }
}

function safeBase64Decode(str) {
    try {
        const bytes = new Uint8Array(atob(str).split('').map(c => c.charCodeAt(0)));
        const decoder = new TextDecoder('utf-8');
        return decoder.decode(bytes);
    } catch (e) {
        return str;
    }
}

async function ADD(envadd) {
    var addtext = envadd.replace(/[ \t"'|\r\n]+/g, ',').replace(/,+/g, ',');  
    if (addtext.charAt(0) == ',') addtext = addtext.slice(1);
    if (addtext.charAt(addtext.length -1) == ',') addtext = addtext.slice(0, addtext.length - 1);
    return addtext.split(',');
}
