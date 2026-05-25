import { pool } from '../config/db.js';

// Resolve customer_id from user_id
const getCustomerId = async (userId) => {
  const [rows] = await pool.query('SELECT id FROM customers WHERE user_id = ?', [userId]);
  return rows.length > 0 ? rows[0].id : null;
};

// Resolve employee_id from user_id (with auto-create fallback for ADMIN/STAFF)
const getEmployeeId = async (userId) => {
  const [rows] = await pool.query('SELECT id FROM employees WHERE user_id = ?', [userId]);
  if (rows.length > 0) {
    return rows[0].id;
  }

  // Auto-create employee record if user has ADMIN or STAFF/EMPLOYEE role
  const [userRows] = await pool.query('SELECT role FROM users WHERE id = ?', [userId]);
  if (userRows.length > 0 && ['ADMIN', 'STAFF', 'EMPLOYEE'].includes(userRows[0].role)) {
    try {
      const [insertResult] = await pool.query('INSERT INTO employees (user_id, position) VALUES (?, ?)', [userId, 'Nhân viên']);
      return insertResult.insertId;
    } catch (e) {
      try {
        const [insertResult] = await pool.query('INSERT INTO employees (user_id) VALUES (?)', [userId]);
        return insertResult.insertId;
      } catch (err) {
        console.error('Failed to auto-create employee record:', err);
      }
    }
  }
  return null;
};

// --- CUSTOMER / GUEST APIS ---

export const customerListConversations = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.json([]); // Guests have no conversation list unless using session
    }

    const customerId = await getCustomerId(req.user.userId);
    if (!customerId) {
      return res.status(404).json({ message: 'Customer record not found' });
    }

    const [rows] = await pool.query(`
      SELECT c.*, b.booking_code, u2.full_name as staff_name
      FROM chat_conversations c
      LEFT JOIN bookings b ON b.id = c.related_booking_id
      LEFT JOIN employees e ON e.id = c.assigned_staff_id
      LEFT JOIN users u2 ON u2.id = e.user_id
      WHERE c.customer_id = ?
      ORDER BY COALESCE(c.last_message_at, c.created_at) DESC
    `, [customerId]);

    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const customerCreateConversation = async (req, res, next) => {
  try {
    let customerId = null;
    if (req.user) {
      customerId = await getCustomerId(req.user.userId);
    }

    const { subject, relatedBookingId } = req.body;
    const conversationCode = `CHAT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const [result] = await pool.query(`
      INSERT INTO chat_conversations (conversation_code, customer_id, related_booking_id, subject, status)
      VALUES (?, ?, ?, ?, 'WAITING')
    `, [conversationCode, customerId, relatedBookingId || null, subject || 'Yêu cầu hỗ trợ mới']);

    const [newConv] = await pool.query('SELECT * FROM chat_conversations WHERE id = ?', [result.insertId]);

    res.status(201).json(newConv[0]);
  } catch (error) {
    next(error);
  }
};

export const customerGetMessages = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if conversation exists
    const [convRows] = await pool.query('SELECT * FROM chat_conversations WHERE id = ?', [id]);
    if (convRows.length === 0) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const conversation = convRows[0];

    // Security check: if conversation belongs to a customer, make sure it matches
    if (conversation.customer_id && req.user) {
      const customerId = await getCustomerId(req.user.userId);
      if (conversation.customer_id !== customerId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }

    const [messages] = await pool.query(`
      SELECT * FROM chat_messages 
      WHERE conversation_id = ? 
      ORDER BY created_at ASC
    `, [id]);

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

export const customerSendMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { messageContent, messageType = 'TEXT', attachmentUrl = null } = req.body;

    if (!messageContent || !messageContent.trim()) {
      return res.status(400).json({ message: 'Message content cannot be empty' });
    }

    // Verify conversation
    const [convRows] = await pool.query('SELECT * FROM chat_conversations WHERE id = ?', [id]);
    if (convRows.length === 0) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const conversation = convRows[0];

    // Security check for authenticated customers
    let customerId = null;
    let senderRole = 'GUEST';
    if (req.user) {
      customerId = await getCustomerId(req.user.userId);
      senderRole = 'CUSTOMER';
      if (conversation.customer_id && conversation.customer_id !== customerId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }

    // Insert message
    const [msgResult] = await pool.query(`
      INSERT INTO chat_messages (conversation_id, sender_id, sender_role, message_type, message_content, attachment_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id, customerId, senderRole, messageType, messageContent, attachmentUrl]);

    // Update last message details in conversation
    let statusUpdate = 'WAITING';
    if (conversation.status === 'PROCESSING') {
      statusUpdate = 'PROCESSING';
    } else if (conversation.status === 'RESPONDED') {
      statusUpdate = 'CUSTOMER_WAITING';
    }

    await pool.query(`
      UPDATE chat_conversations 
      SET last_message = ?, last_message_at = NOW(), updated_at = NOW(), status = ?
      WHERE id = ?
    `, [messageContent, statusUpdate, id]);

    const [newMsg] = await pool.query('SELECT * FROM chat_messages WHERE id = ?', [msgResult.insertId]);

    res.status(201).json(newMsg[0]);
  } catch (error) {
    next(error);
  }
};

export const customerCloseConversation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [convRows] = await pool.query('SELECT * FROM chat_conversations WHERE id = ?', [id]);
    if (convRows.length === 0) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const conversation = convRows[0];
    if (req.user) {
      const customerId = await getCustomerId(req.user.userId);
      if (conversation.customer_id && conversation.customer_id !== customerId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }

    await pool.query(`
      UPDATE chat_conversations 
      SET status = 'CLOSED', closed_at = NOW() 
      WHERE id = ?
    `, [id]);

    res.json({ message: 'Conversation closed successfully' });
  } catch (error) {
    next(error);
  }
};


// --- ADMIN / STAFF APIS ---

export const adminListConversations = async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.*, 
             u.full_name as customer_name, u.email as customer_email,
             u2.full_name as staff_name,
             b.booking_code
      FROM chat_conversations c
      LEFT JOIN customers cust ON cust.id = c.customer_id
      LEFT JOIN users u ON u.id = cust.user_id
      LEFT JOIN employees e ON e.id = c.assigned_staff_id
      LEFT JOIN users u2 ON u2.id = e.user_id
      LEFT JOIN bookings b ON b.id = c.related_booking_id
      ORDER BY COALESCE(c.last_message_at, c.created_at) DESC
    `);

    res.json(rows);
  } catch (error) {
    next(error);
  }
};

export const adminGetConversationDetail = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [convRows] = await pool.query(`
      SELECT c.*, 
             u.full_name as customer_name, u.email as customer_email, u.phone as customer_phone,
             u2.full_name as staff_name,
             b.booking_code, b.status as booking_status, b.total_amount as booking_amount,
             b.check_in_date, b.check_out_date
      FROM chat_conversations c
      LEFT JOIN customers cust ON cust.id = c.customer_id
      LEFT JOIN users u ON u.id = cust.user_id
      LEFT JOIN employees e ON e.id = c.assigned_staff_id
      LEFT JOIN users u2 ON u2.id = e.user_id
      LEFT JOIN bookings b ON b.id = c.related_booking_id
      WHERE c.id = ?
    `, [id]);

    if (convRows.length === 0) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    const [messages] = await pool.query(`
      SELECT * FROM chat_messages 
      WHERE conversation_id = ? 
      ORDER BY created_at ASC
    `, [id]);

    res.json({
      conversation: convRows[0],
      messages
    });
  } catch (error) {
    next(error);
  }
};

export const adminAssignStaff = async (req, res, next) => {
  try {
    const { id } = req.params;
    let { staffId } = req.body;

    // If no staffId passed, assign to currently logged in employee
    if (!staffId) {
      staffId = await getEmployeeId(req.user.userId);
      if (!staffId) {
        return res.status(400).json({ message: 'Current user is not linked to an employee record' });
      }
    }

    await pool.query(`
      UPDATE chat_conversations 
      SET assigned_staff_id = ?, status = 'PROCESSING'
      WHERE id = ?
    `, [staffId, id]);

    res.json({ message: 'Conversation assigned successfully' });
  } catch (error) {
    next(error);
  }
};

export const adminSendMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { messageContent, messageType = 'TEXT', attachmentUrl = null } = req.body;

    if (!messageContent || !messageContent.trim()) {
      return res.status(400).json({ message: 'Message content cannot be empty' });
    }

    const employeeId = await getEmployeeId(req.user.userId);
    const senderRole = req.user.role === 'ADMIN' ? 'ADMIN' : 'STAFF';

    // Insert message
    const [msgResult] = await pool.query(`
      INSERT INTO chat_messages (conversation_id, sender_id, sender_role, message_type, message_content, attachment_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [id, employeeId, senderRole, messageType, messageContent, attachmentUrl]);

    // Update last message & status to RESPONDED
    await pool.query(`
      UPDATE chat_conversations 
      SET last_message = ?, last_message_at = NOW(), updated_at = NOW(), status = 'RESPONDED'
      WHERE id = ?
    `, [messageContent, id]);

    const [newMsg] = await pool.query('SELECT * FROM chat_messages WHERE id = ?', [msgResult.insertId]);

    res.status(201).json(newMsg[0]);
  } catch (error) {
    next(error);
  }
};

export const adminUpdateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['WAITING', 'PROCESSING', 'CUSTOMER_WAITING', 'RESPONDED', 'COMPLETED', 'CLOSED', 'TRANSFER_ADMIN'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    let closedField = '';
    if (status === 'CLOSED') {
      closedField = ', closed_at = NOW()';
    }

    await pool.query(`
      UPDATE chat_conversations 
      SET status = ? ${closedField}
      WHERE id = ?
    `, [status, id]);

    res.json({ message: `Status updated to ${status}` });
  } catch (error) {
    next(error);
  }
};

export const adminCloseConversation = async (req, res, next) => {
  try {
    const { id } = req.params;

    await pool.query(`
      UPDATE chat_conversations 
      SET status = 'CLOSED', closed_at = NOW() 
      WHERE id = ?
    `, [id]);

    res.json({ message: 'Conversation closed successfully' });
  } catch (error) {
    next(error);
  }
};
