import User from '../models/User.js';
import Resource from '../models/Resource.js';

export const awardPoints = async (userId, pointsAwarded) => {
  try {
    const user = await User.findById(userId);
    if (!user) return null;

    user.points += pointsAwarded;
    await checkAndAwardBadges(user);
    await user.save();
    return user;
  } catch (error) {
    console.error(`Error awarding points: ${error.message}`);
  }
};

const checkAndAwardBadges = async (user) => {
  const currentBadges = new Set(user.badges);

  // Check upload count
  const uploadCount = await Resource.countDocuments({ uploadedBy: user._id });

  if (uploadCount >= 1 && !currentBadges.has('First Contributor')) {
    currentBadges.add('First Contributor');
  }
  if (uploadCount >= 5 && !currentBadges.has('Knowledge Donor')) {
    currentBadges.add('Knowledge Donor');
  }
  if (uploadCount >= 15 && !currentBadges.has('Academic Legend')) {
    currentBadges.add('Academic Legend');
  }

  // Check points badges
  if (user.points >= 100 && !currentBadges.has('Century Scholar')) {
    currentBadges.add('Century Scholar');
  }
  if (user.points >= 500 && !currentBadges.has('Campus Mentor')) {
    currentBadges.add('Campus Mentor');
  }

  // Check downloads badge
  if (user.downloadHistory.length >= 5 && !currentBadges.has('Active Reader')) {
    currentBadges.add('Active Reader');
  }

  user.badges = Array.from(currentBadges);
};
