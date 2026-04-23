const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  admissionNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  kcpeIndex: {
    type: String,
    required: true
  },
  kcpeMarks: {
    type: Number,
    required: true,
    min: 0,
    max: 500
  },
  currentClass: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  stream: {
    type: String,
    required: true,
    enum: ['East', 'West', 'North', 'South']
  },
  admissionClass: {
    type: Number,
    required: true,
    min: 1,
    max: 4
  },
  yearOfAdmission: {
    type: Number,
    required: true
  },
  boardingStatus: {
    type: String,
    enum: ['boarder', 'day_scholar'],
    required: true
  },
  
  // Parent/Guardian Information
  parentName: {
    type: String,
    required: true
  },
  parentPhone: {
    type: String,
    required: true
  },
  parentEmail: {
    type: String
  },
  parentOccupation: String,
  
  // Emergency Contact
  emergencyContactName: {
    type: String,
    required: true
  },
  emergencyContactPhone: {
    type: String,
    required: true
  },
  emergencyContactRelationship: {
    type: String,
    required: true
  },
  
  // Medical Information
  medicalConditions: [String],
  allergies: [String],
  medications: [String],
  bloodGroup: {
    type: String,
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  
  // Academic Information
  subjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }],
  clubs: [{
    name: String,
    position: String,
    joinDate: Date
  }],
  sports: [{
    name: String,
    position: String,
    joinDate: Date
  }],
  
  // Documents
  documents: [{
    name: String,
    type: String,
    url: String,
    uploadDate: { type: Date, default: Date.now }
  }],
  
  // Academic Performance
  currentGPA: {
    type: Number,
    default: 0
  },
  overallRank: {
    type: Number,
    default: null
  },
  classRank: {
    type: Number,
    default: null
  },
  
  // Disciplinary Records
  disciplinaryRecords: [{
    date: Date,
    offense: String,
    action: String,
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Transfer History
  transferHistory: [{
    fromClass: Number,
    fromStream: String,
    toClass: Number,
    toStream: String,
    date: Date,
    reason: String
  }],
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  graduationDate: Date,
  dropoutDate: Date,
  dropoutReason: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for current class display
studentSchema.virtual('classDisplay').get(function() {
  return `Form ${this.currentClass} ${this.stream}`;
});

// Virtual for age calculation
studentSchema.virtual('age').get(function() {
  if (!this.user?.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.user.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Indexes
studentSchema.index({ currentClass: 1, stream: 1 });
studentSchema.index({ yearOfAdmission: 1 });
studentSchema.index({ kcpeMarks: -1 });

// Pre-save middleware to generate admission number
studentSchema.pre('save', async function(next) {
  if (this.isNew && !this.admissionNumber) {
    const year = this.yearOfAdmission;
    const classCode = this.admissionClass;
    const streamCode = this.stream.charAt(0);
    
    // Find the last admission number for this year/class/stream
    const lastStudent = await this.constructor.findOne({
      yearOfAdmission: year,
      admissionClass: classCode,
      stream: this.stream
    }).sort({ admissionNumber: -1 });
    
    let sequence = 1;
    if (lastStudent && lastStudent.admissionNumber) {
      const lastSequence = parseInt(lastStudent.admissionNumber.slice(-3));
      sequence = lastSequence + 1;
    }
    
    this.admissionNumber = `ADM/${year}/${classCode}${streamCode}${sequence.toString().padStart(3, '0')}`;
  }
  next();
});

// Static method to get class statistics
studentSchema.statics.getClassStats = async function(classLevel, stream) {
  const stats = await this.aggregate([
    {
      $match: {
        currentClass: classLevel,
        stream: stream,
        isActive: true
      }
    },
    {
      $group: {
        _id: null,
        totalStudents: { $sum: 1 },
        averageKCPE: { $avg: '$kcpeMarks' },
        averageGPA: { $avg: '$currentGPA' },
        boarders: {
          $sum: {
            $cond: [{ $eq: ['$boardingStatus', 'boarder'] }, 1, 0]
          }
        },
        dayScholars: {
          $sum: {
            $cond: [{ $eq: ['$boardingStatus', 'day_scholar'] }, 1, 0]
          }
        }
      }
    }
  ]);
  
  return stats[0] || {
    totalStudents: 0,
    averageKCPE: 0,
    averageGPA: 0,
    boarders: 0,
    dayScholars: 0
  };
};

module.exports = mongoose.model('Student', studentSchema);