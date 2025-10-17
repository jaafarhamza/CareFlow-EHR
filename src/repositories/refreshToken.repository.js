import RefreshToken from "../models/refreshToken.model.js";

export default {
  async create({ userId, tokenHash, deviceId = null, ip = null, userAgent = null, expiresAt }) {
    await RefreshToken.create({ userId, tokenHash, deviceId, ip, userAgent, expiresAt, revokedAt: null, replacedByTokenHash: null });
  },

  async findByTokenHash(tokenHash) {
    return RefreshToken.findOne({ tokenHash }).lean();
  },

  async revokeByHash(tokenHash, replacedByTokenHash = null) {
    await RefreshToken.updateOne(
      { tokenHash },
      { $set: { revokedAt: new Date(), replacedByTokenHash } }
    );
  },
  async revokeAllByUserId(userId) {
    await RefreshToken.updateMany(
      { userId, revokedAt: { $exists: false } },
      { $set: { revokedAt: new Date(), replacedByTokenHash: null } }
    );
  },
};


