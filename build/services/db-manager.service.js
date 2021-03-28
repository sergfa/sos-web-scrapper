"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBManager = void 0;
const mongodb_1 = __importStar(require("mongodb"));
class DBManager {
    constructor() {
        mongodb_1.Logger.setLevel('error');
    }
    findAllTelegramUsers(successCb, errorCb) {
        const client = this.createDBClient();
        client.connect((err, client) => {
            const db = client.db(DBManager.DB_NAME);
            const collection = db.collection(DBManager.TABLE_CLIENTS);
            collection.find({}).toArray((err, docs) => {
                client.close();
                if (!err) {
                    successCb(docs);
                }
                else if (errorCb) {
                    errorCb(err);
                }
            });
        });
    }
    createDBClient() {
        return new mongodb_1.default.MongoClient(DBManager.DB_URL);
    }
    addTelegramUser(user, successCb, errorCb) {
        const client = this.createDBClient();
        client.connect((err, client) => {
            const db = client.db(DBManager.DB_NAME);
            const collection = db.collection(DBManager.TABLE_CLIENTS);
            console.log(user);
            collection.updateOne({ userId: user.userId, chatId: user.chatId }, { $set: { userId: user.userId, chatId: user.chatId } }, { upsert: true }, (err, result) => {
                client.close();
                if (!err) {
                    successCb(result);
                }
                else if (errorCb) {
                    errorCb(err);
                }
            });
        });
    }
    deleteTelegramUser(user, successCb, errorCb) {
        const client = this.createDBClient();
        client.connect((err, client) => {
            const db = client.db(DBManager.DB_NAME);
            const collection = db.collection(DBManager.TABLE_CLIENTS);
            collection.deleteOne({ userId: user.userId, chatId: user.chatId }, (err, result) => {
                client.close();
                if (!err) {
                    successCb(result.deletedCount);
                }
                else if (errorCb) {
                    errorCb(err);
                }
            });
        });
    }
}
exports.DBManager = DBManager;
DBManager.DB_URL = 'mongodb://localhost:27017';
DBManager.DB_NAME = 'SOSWebScrapperDB';
DBManager.TABLE_CLIENTS = 'Clients';
//# sourceMappingURL=db-manager.service.js.map