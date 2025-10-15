import mongoose from "mongoose";

const collection = () => mongoose.connection.collection("refresh_tokens");

export default {
  async create({ userId, tokenHash, deviceId = null, ip = null, userAgent = null, expiresAt }) {
    await collection().insertOne({
      userId: new mongoose.Types.ObjectId(userId),
      tokenHash,
      deviceId,
      ip,
      userAgent,
      createdAt: new Date(),
      expiresAt,
      revokedAt: null,
      replacedByTokenHash: null,
    });
  },

  async findByTokenHash(tokenHash) {
    return collection().findOne({ tokenHash });
  },

  async revokeByHash(tokenHash, replacedByTokenHash = null) {
    await collection().updateOne(
      { tokenHash },
      { $set: { revokedAt: new Date(), replacedByTokenHash } }
    );
  },
};


