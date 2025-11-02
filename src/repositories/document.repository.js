import Document from '../models/document.model.js';

class DocumentRepository {
  async create(documentData) {
    const document = new Document(documentData);
    await document.save();
    return this.findById(document._id);
  }

  async findById(id) {
    return Document.findById(id)
      .populate({
        path: 'patientId',
        populate: {
          path: 'userId',
          select: 'firstName lastName email phone'
        }
      })
      .populate('uploadedBy', 'firstName lastName email')
      .populate('verifiedBy', 'firstName lastName email')
      .populate('deletedBy', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName')
      .populate('updatedBy', 'firstName lastName');
  }

  async findByIdSimple(id) {
    return Document.findById(id);
  }

  async update(id, updates) {
    return Document.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );
  }

  async delete(id) {
    return Document.findByIdAndDelete(id);
  }

  async list(options = {}) {
    const {
      page = 1,
      limit = 20,
      filter = {},
      sort = { createdAt: -1 }
    } = options;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Document.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'patientId',
          select: 'userId dateOfBirth gender',
          populate: {
            path: 'userId',
            select: 'firstName lastName email'
          }
        })
        .populate('uploadedBy', 'firstName lastName email')
        .populate('verifiedBy', 'firstName lastName'),
      Document.countDocuments(filter)
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  buildFilter(params) {
    const filter = {};

    // Exclude deleted by default unless explicitly requested
    if (params.includeDeleted !== 'true') {
      filter.isDeleted = false;
    }

    if (params.patientId) {
      filter.patientId = params.patientId;
    }

    if (params.uploadedBy) {
      filter.uploadedBy = params.uploadedBy;
    }

    if (params.documentType) {
      filter.documentType = params.documentType;
    }

    if (params.isVerified !== undefined) {
      filter.isVerified = params.isVerified === 'true';
    }

    if (params.relatedTo) {
      filter.relatedTo = params.relatedTo;
    }

    if (params.relatedId) {
      filter.relatedId = params.relatedId;
    }

    if (params.tags) {
      const tagsArray = Array.isArray(params.tags) ? params.tags : [params.tags];
      filter.tags = { $in: tagsArray };
    }

    if (params.fromDate || params.toDate) {
      filter.createdAt = {};
      if (params.fromDate) {
        filter.createdAt.$gte = new Date(params.fromDate);
      }
      if (params.toDate) {
        filter.createdAt.$lte = new Date(params.toDate);
      }
    }

    if (params.search) {
      filter.$or = [
        { title: { $regex: params.search, $options: 'i' } },
        { description: { $regex: params.search, $options: 'i' } },
        { fileName: { $regex: params.search, $options: 'i' } },
        { tags: { $regex: params.search, $options: 'i' } }
      ];
    }

    return filter;
  }

  async findByPatientId(patientId, options = {}) {
    return Document.findByPatientId(patientId, options);
  }

  async findByType(documentType, options = {}) {
    return Document.findByType(documentType, options);
  }

  async findByTags(tags, options = {}) {
    return Document.findByTags(tags, options);
  }

  async findUnverified(options = {}) {
    return Document.findUnverified(options);
  }

  async findExpired() {
    return Document.findExpired();
  }

  async getStatistics() {
    const stats = await Document.aggregate([
      {
        $facet: {
          byType: [
            { $match: { isDeleted: false } },
            { $group: { _id: '$documentType', count: { $sum: 1 } } }
          ],
          byVerification: [
            { $match: { isDeleted: false } },
            { $group: { _id: '$isVerified', count: { $sum: 1 } } }
          ],
          total: [
            { $match: { isDeleted: false } },
            { $count: 'count' }
          ],
          deleted: [
            { $match: { isDeleted: true } },
            { $count: 'count' }
          ],
          totalSize: [
            { $match: { isDeleted: false } },
            { $group: { _id: null, total: { $sum: '$fileSize' } } }
          ]
        }
      }
    ]);

    const result = {
      total: stats[0].total[0]?.count || 0,
      deleted: stats[0].deleted[0]?.count || 0,
      verified: 0,
      unverified: 0,
      totalSizeBytes: stats[0].totalSize[0]?.total || 0,
      totalSizeMB: ((stats[0].totalSize[0]?.total || 0) / (1024 * 1024)).toFixed(2),
      byType: {}
    };

    stats[0].byType.forEach(item => {
      result.byType[item._id] = item.count;
    });

    stats[0].byVerification.forEach(item => {
      if (item._id === true) {
        result.verified = item.count;
      } else {
        result.unverified = item.count;
      }
    });

    return result;
  }
}

export default new DocumentRepository();
