import { prop, getModelForClass } from '@typegoose/typegoose';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import config from "./config/config"; // 添加 mongoose 核心库

// 位置类（保持不变）
class Position {
    @prop({ required: true, type: Number })
    x!: number;

    @prop({ required: true, type: Number })
    y!: number;
}

// 玩家类（保持不变）
class Player {
    _id!: ObjectId;

    @prop({ required: true, type: String })
    name!: string;

    @prop({ default: 1, type: Number })
    level!: number;

    @prop({ type: [String], default: [] })
    skills!: string[];

    @prop({ _id: false, type: () => Position })
    position!: Position;

    levelUp() {
        this.level++;
    }
}

// 创建模型（保持不变）
const PlayerModel = getModelForClass(Player);

// ============= 数据库连接部分 =============
async function connectDB() {
    try {
        let db = await mongoose.connect(config.db.uri, {
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
        });
        console.log(db.connections[0].name)
        console.log('🎮 数据库连接成功');
    } catch (error) {
        console.error('💥 数据库连接失败:', error);
        process.exit(1); // 退出进程
    }
}
// =========================================

// CRUD 操作（保持不变）
async function main() {
    // 创建玩家
    const newPlayer = await PlayerModel.create({
        _id: new ObjectId(),
        name: 'ShadowHunter',
        position: { x: 100, y: 200 }
    });
    // 调用实例方法
    newPlayer.levelUp();
    await newPlayer.save();
}

async function allLevelUp() {
    await PlayerModel.bulkWrite([
        {
            updateMany: {
                filter: { /* 匹配条件，如：level: { $lt: 10 } */ },
                update: { $inc: { level: -1 } }
            }
        }
    ]);
}

// ============= 程序入口 =============
(async () => {
    await connectDB(); // 先连接数据库

    try {
        await allLevelUp();
        console.log('✅ 所有操作执行完毕');
    } catch (error) {
        console.error('❌ 操作执行出错:', error);
    } finally {
        await mongoose.disconnect(); // 断开数据库连接
        console.log('🔌 数据库连接已断开');
    }
})();