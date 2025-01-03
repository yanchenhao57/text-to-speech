const express = require("express");
const bodyParser = require("body-parser");
const gTTS = require("gtts");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

// 创建 output-speech 文件夹，如果不存在
const outputDir = path.join(__dirname, "output-speech");
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// 中间件：解析 JSON 数据
app.use(bodyParser.json());
app.use(express.static("public")); // 用于提供静态文件（前端页面）

// 文字转语音接口
app.post("/text-to-speech", (req, res) => {
    const { text, language } = req.body;

    if (!text || !language) {
        return res.status(400).json({ error: "文字或语言代码不能为空。" });
    }

    try {
        const gtts = new gTTS(text, language);

        // 设置响应头，告诉浏览器这是一个音频文件
        res.setHeader("Content-Type", "audio/mpeg");
        res.setHeader("Content-Disposition", 'attachment; filename="speech.mp3"');

        // 将音频文件流直接发送到用户
        gtts.stream().pipe(res).on("finish", () => {
            console.log("语音文件已成功生成并发送给用户。");
        }).on("error", (err) => {
            console.error("生成或发送语音文件时出错：", err);
            res.status(500).json({ error: "生成语音文件失败。" });
        });
    } catch (err) {
        console.error("处理请求时出错：", err);
        res.status(500).json({ error: "服务器内部错误。" });
    }
});

// 获取本机局域网 IP 地址的函数
function getLocalIPAddress() {
    const os = require("os");
    const interfaces = os.networkInterfaces();
    for (const devName in interfaces) {
        const iface = interfaces[devName];
        for (let i = 0; i < iface.length; i++) {
            const alias = iface[i];
            if (alias.family === "IPv4" && !alias.internal) {
                return alias.address;
            }
        }
    }
    return "localhost";
}

// 启动服务
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});