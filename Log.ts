import winston, { format } from 'winston';
import path from 'path';

// 1. 创建日志目录
const logDir = process.env.LOG_DIR || path.join(__dirname, 'logs');
require('fs').mkdirSync(logDir, { recursive: true });

// 2. 创建 logger 实例
const logger = winston.createLogger({
    level: 'info',
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.json()
    ),
    transports: [
        // 控制台输出（开发环境）
        new winston.transports.Console(),

        // 每日轮转文件
        // new DailyRotateFile({
        //     filename: 'app-%DATE%.log',
        //     dirname: logDir,
        //     datePattern: 'YYYY-MM-DD',
        //     maxSize: '50m',
        //     maxFiles: '90d',
        //     zippedArchive: true,
        // }),

        //所有日志都输出到文件
        new winston.transports.File({
            filename: 'combine.log',
            dirname: logDir,
            }),

        // 错误日志单独存放
        new winston.transports.File({
            filename: 'errors.log',
            dirname: logDir,
            level: 'error'
        })
    ].filter(Boolean) // 过滤掉 null 项
});

export default logger;