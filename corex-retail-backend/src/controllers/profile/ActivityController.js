

const { db } = require("../../config/firebase");
const admin = require('firebase-admin');


const recordActivity = async (userId, activityType, title, description, metadata = {}) => {
  try {
    const activityData = {
      userId,
      activityType,
      title,
      description,
      metadata,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const activityRef = db.collection("user_activities").doc();
    await activityRef.set({
      id: activityRef.id,
      ...activityData
    });

    return {
      id: activityRef.id,
      ...activityData
    };
  } catch (error) {
    console.error("Error recording activity:", error);
    throw error;
  }
};


const getUserActivities_BE = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10, page = 1, type } = req.query;
    
    // Verify the requesting user is authorized
    if (req.user.uid !== id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        error: "Unauthorized access. You can only view your own activities." 
      });
    }

    let query = db.collection("user_activities")
      .where("userId", "==", id)
      .orderBy("timestamp", "desc");
      
    if (type) {
      query = query.where("activityType", "==", type);
    }
    
    const pageSize = parseInt(limit);
    const offset = (parseInt(page) - 1) * pageSize;
    
    const countSnapshot = await query.count().get();
    const totalItems = countSnapshot.data().count;
    
    const snapshot = await query.limit(pageSize).offset(offset).get();
    
    if (snapshot.empty) {
      return res.status(200).json({
        activities: [],
        pagination: {
          total: 0,
          page: parseInt(page),
          pageSize,
          totalPages: 0
        }
      });
    }

    const activities = snapshot.docs.map(doc => {
      const data = doc.data();
      if (data.timestamp) {
        data.formattedTimestamp = formatTimestamp(data.timestamp);
      }
      return data;
    });

    res.status(200).json({
      activities,
      pagination: {
        total: totalItems,
        page: parseInt(page),
        pageSize,
        totalPages: Math.ceil(totalItems / pageSize)
      }
    });
  } catch (error) {
    console.error("Error fetching user activities:", error);
    res.status(500).json({ error: error.message });
  }
};

function formatTimestamp(timestamp) {
  if (!timestamp) return "Unknown time";
  
  const now = new Date();
  const time = timestamp.toDate(); // Convert Firestore timestamp to JS Date
  const diffMs = now - time;
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHr = Math.round(diffMin / 60);
  const diffDays = Math.round(diffHr / 24);
  
  if (diffSec < 60) {
    return "Just now";
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  } else if (diffHr < 24) {
    return `${diffHr} hour${diffHr > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    return time.toLocaleDateString();
  }
}


const recordLoginActivity = async (userId, deviceInfo = {}) => {
  return recordActivity(
    userId,
    'login',
    'Logged In',
    'You signed into your account',
    {
      deviceInfo,
      timestamp: new Date().toISOString()
    }
  );
};


const recordProfileUpdateActivity = async (userId, updatedFields = []) => {
  return recordActivity(
    userId,
    'profile_update',
    'Profile Updated',
    'You updated your profile information',
    {
      updatedFields,
      timestamp: new Date().toISOString()
    }
  );
};

const trackActivity = (activityType, titleFn, descriptionFn) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user.uid;
        const title = typeof titleFn === 'function' ? titleFn(req, res) : activityType;
        const description = typeof descriptionFn === 'function' ? descriptionFn(req, res) : '';
        
        recordActivity(userId, activityType, title, description, {
          method: req.method,
          path: req.path,
          params: req.params
        }).catch(err => console.error('Activity tracking error:', err));
      }
      
      return originalSend.apply(res, arguments);
    };
    
    next();
  };
};

module.exports = {
  getUserActivities_BE,
  recordActivity,
  recordLoginActivity,
  recordProfileUpdateActivity,
  trackActivity
};