const express = require('express');
const router = express.Router();
const {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getUnreadCount,
} = require('../controllers/messageController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect, authorize('customer', 'provider'));

router.get('/conversations', getConversations);
router.get('/unread-count', getUnreadCount);
router.get('/:otherUserId', getMessages);
router.post('/', sendMessage);
router.put('/read/:otherUserId', markAsRead);

module.exports = router;
