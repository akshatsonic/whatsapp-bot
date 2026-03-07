const Database = require('better-sqlite3');
const path = require('path');

class MessageDatabase {
    constructor(dbPath = './whatsapp_bot.db') {
        this.db = new Database(dbPath);
        this.initializeTables();
    }

    initializeTables() {
        // Create mota_queue table for messages mentioning @mota
        this.db.exec(`
            CREATE TABLE IF NOT EXISTS mota_queue (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                message_id TEXT NOT NULL UNIQUE,
                chat_id TEXT NOT NULL,
                chat_name TEXT,
                group_id TEXT,
                sender_id TEXT NOT NULL,
                sender_name TEXT,
                message_text TEXT NOT NULL,
                question TEXT,
                reply_to_message_id TEXT,
                timestamp INTEGER NOT NULL,
                created_at INTEGER DEFAULT (strftime('%s', 'now')),
                status TEXT DEFAULT 'pending'
            );

            CREATE INDEX IF NOT EXISTS idx_mota_queue_status ON mota_queue(status);
            CREATE INDEX IF NOT EXISTS idx_mota_queue_chat_id ON mota_queue(chat_id);
        `);

        console.log('✅ Database tables initialized');
    }

    /**
     * Add a message to the mota_queue
     */
    addToMotaQueue(queueData) {
        const stmt = this.db.prepare(`
            INSERT INTO mota_queue (
                message_id, chat_id, chat_name, group_id, sender_id, sender_name,
                message_text, question, reply_to_message_id, timestamp
            ) VALUES (
                @message_id, @chat_id, @chat_name, @group_id, @sender_id, @sender_name,
                @message_text, @question, @reply_to_message_id, @timestamp
            )
        `);

        try {
            const info = stmt.run(queueData);
            console.log(`✅ Added to mota_queue: ID ${info.lastInsertRowid}`);
            return info.lastInsertRowid;
        } catch (error) {
            if (error.message.includes('UNIQUE constraint failed')) {
                console.log('⚠️  Message already in queue');
                return null;
            }
            console.error('❌ Error adding to mota_queue:', error.message);
            throw error;
        }
    }

    /**
     * Get pending messages from the mota_queue
     */
    getPendingMotaMessages(limit = 10) {
        const stmt = this.db.prepare(`
            SELECT * FROM mota_queue
            WHERE status = 'pending'
            ORDER BY timestamp ASC
            LIMIT ?
        `);

        return stmt.all(limit);
    }

    /**
     * Remove a message from the mota_queue after processing
     */
    removeFromMotaQueue(queueId) {
        const stmt = this.db.prepare(`
            DELETE FROM mota_queue WHERE id = ?
        `);

        try {
            const info = stmt.run(queueId);
            if (info.changes > 0) {
                console.log(`✅ Removed from mota_queue: ID ${queueId}`);
                return true;
            }
            return false;
        } catch (error) {
            console.error('❌ Error removing from mota_queue:', error.message);
            return false;
        }
    }

    /**
     * Mark a message as processing (optional - for tracking)
     */
    markAsProcessing(queueId) {
        const stmt = this.db.prepare(`
            UPDATE mota_queue SET status = 'processing' WHERE id = ?
        `);

        return stmt.run(queueId).changes > 0;
    }

    /**
     * Get queue statistics
     */
    getStats() {
        const queueCount = this.db.prepare("SELECT COUNT(*) as count FROM mota_queue WHERE status = 'pending'").get();

        return {
            pendingQueueItems: queueCount.count
        };
    }

    /**
     * Close the database connection
     */
    close() {
        this.db.close();
        console.log('🔒 Database closed');
    }
}

module.exports = MessageDatabase;
