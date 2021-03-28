import mongodb, { MongoError, UpdateWriteOpResult, Logger } from 'mongodb';
import { TelegramUser } from '../interfaces/telegram-client.interface';

export class DBManager {
  static readonly DB_URL = 'mongodb://localhost:27017';
  static readonly DB_NAME = 'SOSWebScrapperDB';
  static readonly TABLE_CLIENTS = 'Clients';

  constructor() {
    Logger.setLevel('error');
  }
  findAllTelegramUsers(successCb: (clients: TelegramUser[]) => void, errorCb?: (err: MongoError) => void) {
    const client = this.createDBClient();

    client.connect((err, client) => {
      const db = client.db(DBManager.DB_NAME);
      const collection = db.collection(DBManager.TABLE_CLIENTS);
      collection.find({}).toArray((err, docs) => {
        client.close();
        if (!err) {
          successCb(docs);
        } else if (errorCb) {
          errorCb(err);
        }
      });
    });
  }

  private createDBClient() {
    return new mongodb.MongoClient(DBManager.DB_URL);
  }

  addTelegramUser(user: TelegramUser, successCb: (newUser: UpdateWriteOpResult) => void, errorCb?: (err: MongoError) => void) {
    const client = this.createDBClient();
    client.connect((err, client) => {
      const db = client.db(DBManager.DB_NAME);

      const collection = db.collection(DBManager.TABLE_CLIENTS);
      console.log(user);
      collection.updateOne(
        { userId: user.userId, chatId: user.chatId },
        { $set: { userId: user.userId, chatId: user.chatId } },
        { upsert: true },
        (err, result) => {
          client.close();
          if (!err) {
            successCb(result);
          } else if (errorCb) {
            errorCb(err);
          }
        },
      );
    });
  }

  deleteTelegramUser(user: TelegramUser, successCb: (deletedCount: number) => void, errorCb?: (err: MongoError) => void) {
    const client = this.createDBClient();
    client.connect((err, client) => {
      const db = client.db(DBManager.DB_NAME);
      const collection = db.collection(DBManager.TABLE_CLIENTS);
      collection.deleteOne({ userId: user.userId, chatId: user.chatId }, (err, result) => {
        client.close();
        if (!err) {
          successCb(result.deletedCount);
        } else if (errorCb) {
          errorCb(err);
        }
      });
    });
  }
}
